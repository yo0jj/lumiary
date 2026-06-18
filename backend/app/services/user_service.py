from datetime import datetime, time, timedelta, timezone

from supabase import Client

from app.models.user import OnboardRequest, OnboardResponse, UserResponse, UserStats


def _next_call_at(call_time_str: str, tz_offset_hours: int = 9) -> datetime:
    """Returns the next UTC datetime for the given local HH:MM call time."""
    h, m = map(int, call_time_str.split(":"))
    local_tz = timezone(timedelta(hours=tz_offset_hours))
    now_local = datetime.now(local_tz)
    scheduled_local = now_local.replace(hour=h, minute=m, second=0, microsecond=0)
    if scheduled_local <= now_local:
        scheduled_local += timedelta(days=1)
    return scheduled_local.astimezone(timezone.utc)


def onboard_user(db: Client, user_id: str, req: OnboardRequest) -> OnboardResponse:
    db.table("users").upsert(
        {
            "id": user_id,
            "name": req.name,
            "nickname": req.nickname,
            "call_time": req.call_time,
            "timezone": req.timezone,
            "voice_tone": req.voice_tone,
            "push_token": req.push_token,
        }
    ).execute()

    first_call_at = _next_call_at(req.call_time)

    db.table("call_schedules").insert(
        {
            "user_id": user_id,
            "scheduled_at": first_call_at.isoformat(),
            "status": "pending",
        }
    ).execute()

    return OnboardResponse(user_id=user_id, first_call_at=first_call_at)


def get_user(db: Client, user_id: str) -> UserResponse:
    result = db.table("users").select("*").eq("id", user_id).single().execute()
    user = result.data

    total = (
        db.table("conversations")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("status", "completed")
        .execute()
        .count
        or 0
    )

    return UserResponse(
        id=user["id"],
        name=user["name"],
        nickname=user["nickname"],
        call_time=user["call_time"],
        voice_tone=user["voice_tone"],
        timezone=user.get("timezone", "Asia/Seoul"),
        stats=UserStats(total_conversations=total),
    )
