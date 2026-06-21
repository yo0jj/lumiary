from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.database import get_supabase
from app.services.notification_service import notification_service

_scheduler = AsyncIOScheduler(timezone="UTC")


async def _trigger_calls() -> None:
    """1분 간격: scheduled_at ≤ now AND status='pending' 인 call_schedules 처리."""
    db = get_supabase()
    now = datetime.now(timezone.utc)

    result = (
        db.table("call_schedules")
        .select("id, user_id, users(nickname, call_time, push_token)")
        .lte("scheduled_at", now.isoformat())
        .eq("status", "pending")
        .execute()
    )

    for row in result.data or []:
        user = row.get("users") or {}
        push_token = user.get("push_token")
        nickname = user.get("nickname", "사용자")
        user_id = row["user_id"]

        if push_token:
            notification_service.send_call_trigger(push_token, nickname)

        db.table("call_schedules").update({"status": "sent"}).eq("id", row["id"]).execute()

        # 다음 날 스케줄 생성
        call_time = user.get("call_time", "22:00")
        h, m = map(int, str(call_time).split(":")[:2])
        local_tz = timezone(timedelta(hours=9))  # Asia/Seoul
        tomorrow_local = (datetime.now(local_tz) + timedelta(days=1)).replace(
            hour=h, minute=m, second=0, microsecond=0
        )
        db.table("call_schedules").insert({
            "user_id": user_id,
            "scheduled_at": tomorrow_local.astimezone(timezone.utc).isoformat(),
            "status": "pending",
        }).execute()


def start_scheduler() -> None:
    _scheduler.add_job(
        _trigger_calls,
        "interval",
        minutes=1,
        id="trigger_calls",
        replace_existing=True,
    )
    _scheduler.start()
