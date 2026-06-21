from datetime import date, datetime, timedelta, timezone
from typing import Optional

from supabase import Client

from app.models.user import OnboardRequest, OnboardResponse, UserResponse, UserStats
from app.voice.prompts import get_todays_lens


# ── 온보딩 (기존 유지) ────────────────────────────────────────────────────────

def _next_call_at(call_time_str: str, tz_offset_hours: int = 9) -> datetime:
    h, m = map(int, call_time_str.split(":"))
    local_tz = timezone(timedelta(hours=tz_offset_hours))
    now_local = datetime.now(local_tz)
    scheduled = now_local.replace(hour=h, minute=m, second=0, microsecond=0)
    if scheduled <= now_local:
        scheduled += timedelta(days=1)
    return scheduled.astimezone(timezone.utc)


def onboard_user(db: Client, user_id: str, req: OnboardRequest) -> OnboardResponse:
    db.table("users").upsert({
        "id": user_id,
        "name": req.name,
        "nickname": req.nickname,
        "call_time": req.call_time,
        "timezone": req.timezone,
        "voice_tone": req.voice_tone,
        "push_token": req.push_token,
    }).execute()

    first_call_at = _next_call_at(req.call_time)
    db.table("call_schedules").insert({
        "user_id": user_id,
        "scheduled_at": first_call_at.isoformat(),
        "status": "pending",
    }).execute()

    return OnboardResponse(user_id=user_id, first_call_at=first_call_at)


def get_user(db: Client, user_id: str) -> UserResponse:
    result = db.table("users").select("*").eq("id", user_id).maybe_single().execute()
    user = result.data if result else None
    if not user:
        raise Exception("User not found")

    total = (
        db.table("conversations")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("status", "completed")
        .execute()
        .count or 0
    )

    done_cnt = (
        db.table("action_items")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("status", "done")
        .execute()
        .count or 0
    )
    all_cnt = (
        db.table("action_items")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .execute()
        .count or 0
    )

    ratings = [
        r["rating"]
        for r in (
            db.table("conversations")
            .select("rating")
            .eq("user_id", user_id)
            .not_.is_("rating", "null")
            .execute()
            .data or []
        )
        if r.get("rating")
    ]

    return UserResponse(
        id=user["id"],
        name=user["name"],
        nickname=user["nickname"],
        call_time=user["call_time"],
        voice_tone=user["voice_tone"],
        timezone=user.get("timezone", "Asia/Seoul"),
        stats=UserStats(
            total_conversations=total,
            average_rating=sum(ratings) / len(ratings) if ratings else None,
            action_completion_rate=(done_cnt / all_cnt) if all_cnt else None,
        ),
    )


# ── 대화 서비스 (Phase 3+) ───────────────────────────────────────────────────

def get_pending_action_item(db: Client, user_id: str) -> Optional[dict]:
    result = (
        db.table("action_items")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", "pending")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    data = result.data or []
    return data[0] if data else None


def get_opening_message(pending: Optional[dict]) -> str:
    if pending:
        return f"어제 '{pending['content']}'를 해보기로 했었는데, 어떻게 됐어요?"
    return "오늘 하루는 어땠나요?"


def create_conversation(db: Client, user_id: str, call_length: str) -> str:
    result = db.table("conversations").insert({
        "user_id": user_id,
        "called_at": datetime.now(timezone.utc).isoformat(),
        "call_length": call_length,
        "status": "in_progress",
    }).execute()
    return result.data[0]["id"]
