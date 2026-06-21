from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user_id
from app.core.database import get_supabase

router = APIRouter()


@router.get("/schedule/next")
async def get_next_schedule(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    now = datetime.now(timezone.utc)
    result = (
        db.table("call_schedules")
        .select("scheduled_at")
        .eq("user_id", user_id)
        .eq("status", "pending")
        .gte("scheduled_at", now.isoformat())
        .order("scheduled_at")
        .limit(1)
        .execute()
    )
    data = result.data or []
    if not data:
        return {"next_call_at": None, "minutes_remaining": None}

    raw = data[0]["scheduled_at"]
    next_call = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    minutes_remaining = max(0, int((next_call - now).total_seconds() / 60))
    return {"next_call_at": raw, "minutes_remaining": minutes_remaining}


@router.post("/schedule/snooze")
async def snooze_call(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    now = datetime.now(timezone.utc)
    snooze_until = now + timedelta(hours=1)

    result = (
        db.table("call_schedules")
        .select("id")
        .eq("user_id", user_id)
        .eq("status", "pending")
        .lte("scheduled_at", now.isoformat())
        .order("scheduled_at", desc=True)
        .limit(1)
        .execute()
    )
    data = result.data or []
    if not data:
        raise HTTPException(status_code=404, detail="No pending schedule found")

    db.table("call_schedules").update({
        "status": "snoozed",
        "snoozed_until": snooze_until.isoformat(),
    }).eq("id", data[0]["id"]).execute()

    db.table("call_schedules").insert({
        "user_id": user_id,
        "scheduled_at": snooze_until.isoformat(),
        "status": "pending",
    }).execute()

    return {"snoozed_until": snooze_until.isoformat()}
