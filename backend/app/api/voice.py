import base64
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.database import get_supabase
from app.core.redis import delete_session, get_session, set_session
from app.voice.pipeline import OptionAPipeline
from app.voice.safety import CRISIS_RESPONSE, detect_crisis

router = APIRouter()


async def _finalize_conversation(
    session: dict,
    transcript: list,
    engine: OptionAPipeline,
) -> None:
    """통화 종료: 요약 생성 → DB 업데이트 → action_item 생성 → FCM 알림."""
    conversation_id = session.get("conversation_id")
    if not conversation_id:
        return

    db = get_supabase()
    nickname = session.get("nickname", "사용자")
    summary_data: dict = {}

    if len(transcript) >= 2:
        try:
            summary_data = await engine.generate_summary(nickname, transcript)
        except Exception:
            pass

    update: dict = {"status": "completed", "transcript": transcript}
    for key in ("summary", "keywords", "emotion", "emotion_intensity",
                "key_scene", "hidden_desire", "ai_comment"):
        if summary_data.get(key) is not None:
            update[key] = summary_data[key]

    db.table("conversations").update(update).eq("id", conversation_id).execute()

    action_content = summary_data.get("action_item")
    if action_content:
        db.table("action_items").insert({
            "conversation_id": conversation_id,
            "user_id": session.get("user_id"),
            "content": action_content,
            "scheduled_for": (date.today() + timedelta(days=1)).isoformat(),
            "status": "pending",
        }).execute()

    push_token = session.get("push_token")
    if push_token:
        try:
            from app.services.notification_service import notification_service
            notification_service.send_card_ready(
                push_token,
                conversation_id,
                summary_data.get("keywords", []),
            )
        except Exception:
            pass


@router.websocket("/ws/conversation/{session_id}")
async def voice_ws(websocket: WebSocket, session_id: str) -> None:
    """음성 대화 WebSocket.

    연결 시 Redis 세션 로드 → 오프닝 메시지 TTS 전송 → STT→LLM→TTS 루프
    → 종료 시 Gemini 요약 생성 + DB 업데이트 + FCM 알림.

    프로토콜:
      Client → Server: { type: "audio_chunk", data: base64, is_final: bool }
                       { type: "end" }
      Server → Client: { type: "transcript", role: "user"|"ai", text: str }
                       { type: "audio", data: base64 }
                       { type: "call_end", summary: str }
                       { type: "error", code: str }
    """
    await websocket.accept()

    session = await get_session(session_id)
    if not session:
        await websocket.send_json({"type": "error", "code": "session_not_found"})
        await websocket.close()
        return

    engine = OptionAPipeline(context=session)
    audio_buffer = bytearray()
    transcript: list = session.get("transcript", [])

    # 오프닝 메시지 TTS 전송
    opening = session.get("opening_message", "오늘 하루는 어땠나요?")
    try:
        tts_bytes = await engine.synthesize(opening)
        await websocket.send_json({"type": "transcript", "role": "ai", "text": opening})
        await websocket.send_json({
            "type": "audio",
            "data": base64.b64encode(tts_bytes).decode(),
        })
        transcript.append({"role": "ai", "text": opening})
    except Exception as exc:
        await websocket.send_json({"type": "error", "code": str(exc)})
        await websocket.close()
        await delete_session(session_id)
        return

    try:
        while True:
            msg = await websocket.receive_json()

            if msg.get("type") == "end":
                await _finalize_conversation(session, transcript, engine)
                try:
                    await websocket.send_json({"type": "call_end", "summary": ""})
                except Exception:
                    pass
                break

            if msg.get("type") != "audio_chunk":
                continue

            chunk = base64.b64decode(msg["data"])
            audio_buffer.extend(chunk)

            if not msg.get("is_final"):
                continue

            audio_bytes = bytes(audio_buffer)
            audio_buffer.clear()

            try:
                user_text = await engine.transcribe(audio_bytes)
                if not user_text:
                    continue

                transcript.append({"role": "user", "text": user_text})
                await websocket.send_json({
                    "type": "transcript", "role": "user", "text": user_text,
                })

                # 위기 감지: 감지 시 공감 메시지 TTS 후 대화 종료
                if detect_crisis(user_text):
                    transcript.append({"role": "ai", "text": CRISIS_RESPONSE})
                    await websocket.send_json({
                        "type": "transcript", "role": "ai", "text": CRISIS_RESPONSE,
                    })
                    try:
                        crisis_audio = await engine.synthesize(CRISIS_RESPONSE)
                        await websocket.send_json({
                            "type": "audio",
                            "data": base64.b64encode(crisis_audio).decode(),
                        })
                    except Exception:
                        pass
                    await _finalize_conversation(session, transcript, engine)
                    try:
                        await websocket.send_json({"type": "call_end", "summary": ""})
                    except Exception:
                        pass
                    break

                ai_text = await engine.generate_response(user_text, session)
                transcript.append({"role": "ai", "text": ai_text})
                await websocket.send_json({
                    "type": "transcript", "role": "ai", "text": ai_text,
                })

                tts_bytes = await engine.synthesize(ai_text)
                await websocket.send_json({
                    "type": "audio",
                    "data": base64.b64encode(tts_bytes).decode(),
                })

                session["transcript"] = transcript
                await set_session(session_id, session)

            except Exception as exc:
                await websocket.send_json({"type": "error", "code": str(exc)})

    except WebSocketDisconnect:
        if len(transcript) >= 2:
            await _finalize_conversation(session, transcript, engine)
    finally:
        await delete_session(session_id)
