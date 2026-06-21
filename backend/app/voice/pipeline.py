import asyncio
import json
import re
from typing import Optional

import google.genai as genai
from google.genai import types
from google.cloud import texttospeech

from app.core.config import settings
from app.voice.prompts import build_summary_prompt, build_system_prompt
from .base import VoiceEngine

_STT_PROMPT = (
    "이 음성을 한국어 텍스트로 정확히 전사해주세요. "
    "전사된 텍스트만 반환하고 다른 설명은 하지 마세요."
)

# Chirp 3 HD 한국어 음성 (warm 톤에 가장 가까운 목소리)
_CHIRP_VOICE_MAP = {
    "calm":   "ko-KR-Chirp3-HD-Aoede",
    "warm":   "ko-KR-Chirp3-HD-Aoede",
    "bright": "ko-KR-Chirp3-HD-Charon",
    "plain":  "ko-KR-Chirp3-HD-Fenrir",
}
_CHIRP_DEFAULT = "ko-KR-Chirp3-HD-Aoede"


class OptionAPipeline(VoiceEngine):
    """STT(Gemini 3 Flash) → LLM(Gemini 3.1 Flash Lite) → TTS(Google Chirp 3) 파이프라인."""

    def __init__(self, context: dict = None) -> None:
        self._context = context or {}
        self._client = genai.Client(
            vertexai=True,
            project=settings.google_cloud_project,
            location=settings.google_cloud_location,
        )
        self._tts_client = texttospeech.TextToSpeechAsyncClient()
        self._chat: Optional[genai.types.AsyncChat] = None
        voice_tone = self._context.get("voice_tone", "warm")
        self._chirp_voice = _CHIRP_VOICE_MAP.get(voice_tone, _CHIRP_DEFAULT)

    # ── STT ─────────────────────────────────────────────────────────────────

    async def transcribe(self, audio_bytes: bytes) -> str:
        audio_part = types.Part.from_bytes(data=audio_bytes, mime_type="audio/webm")
        response = await self._client.aio.models.generate_content(
            model="gemini-3.5-flash",
            contents=[audio_part, _STT_PROMPT],
        )
        return (response.text or "").strip()

    # ── LLM ─────────────────────────────────────────────────────────────────

    async def generate_response(self, transcript: str, context: dict) -> str:
        if self._chat is None:
            merged = {**self._context, **context}
            system_prompt = build_system_prompt(merged)
            self._chat = self._client.aio.chats.create(
                model="gemini-3.1-flash-lite",
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                ),
            )
        response = await self._chat.send_message(transcript)
        return (response.text or "").strip()

    # ── TTS (Google Chirp 3) ─────────────────────────────────────────────────

    async def synthesize(self, text: str) -> bytes:
        request = texttospeech.SynthesizeSpeechRequest(
            input=texttospeech.SynthesisInput(text=text),
            voice=texttospeech.VoiceSelectionParams(
                language_code="ko-KR",
                name=self._chirp_voice,
            ),
            audio_config=texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
            ),
        )
        response = await self._tts_client.synthesize_speech(request=request)
        return response.audio_content

    # ── 요약 생성 (통화 종료 후 비실시간) ──────────────────────────────────

    async def generate_summary(self, nickname: str, transcript: list) -> dict:
        prompt = build_summary_prompt(nickname, transcript)
        response = await self._client.aio.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=[prompt],
        )
        text = (response.text or "{}").strip()
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        return {}
