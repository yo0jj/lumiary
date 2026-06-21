import json
from typing import List

import firebase_admin
from firebase_admin import credentials, messaging

from app.core.config import settings


class _NotificationService:
    """Firebase Admin SDK 래퍼. 설정이 없으면 전송을 조용히 건너뜁니다."""

    def __init__(self) -> None:
        self._ready = False

    def _ensure_init(self) -> bool:
        if self._ready:
            return True
        if not settings.firebase_service_account:
            return False
        try:
            if not firebase_admin._apps:
                sa = json.loads(settings.firebase_service_account)
                cred = credentials.Certificate(sa)
                firebase_admin.initialize_app(cred)
            self._ready = True
            return True
        except Exception:
            return False

    def send_card_ready(self, push_token: str, card_id: str, keywords: List[str]) -> None:
        if not push_token or not self._ensure_init():
            return
        kw = " ".join(f"#{k}" for k in (keywords or [])[:2])
        try:
            messaging.send(messaging.Message(
                token=push_token,
                notification=messaging.Notification(
                    title="오늘 대화 카드가 도착했어요 ✨",
                    body=f"오늘의 키워드: {kw}" if kw else "카드를 확인해보세요",
                ),
                data={"card_id": card_id, "type": "card_ready"},
            ))
        except Exception:
            pass

    def send_call_trigger(self, push_token: str, nickname: str) -> None:
        if not push_token or not self._ensure_init():
            return
        try:
            messaging.send(messaging.Message(
                token=push_token,
                notification=messaging.Notification(
                    title=f"{nickname}님, 여보세요예요 📞",
                    body="오늘 하루 이야기 들을게요. 받아주세요!",
                ),
                data={"type": "incoming_call"},
            ))
        except Exception:
            pass


notification_service = _NotificationService()
