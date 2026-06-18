from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class OnboardRequest(BaseModel):
    name: str
    nickname: str
    call_time: str  # "HH:MM" format e.g. "22:00"
    timezone: str = "Asia/Seoul"
    voice_tone: str = "calm"  # calm | bright | plain
    push_token: Optional[str] = None


class OnboardResponse(BaseModel):
    user_id: str
    first_call_at: datetime


class UserStats(BaseModel):
    total_conversations: int = 0
    streak_days: int = 0
    average_rating: Optional[float] = None
    action_completion_rate: Optional[float] = None


class UserResponse(BaseModel):
    id: str
    name: str
    nickname: str
    call_time: str
    voice_tone: str
    timezone: str
    stats: UserStats


class UserUpdateRequest(BaseModel):
    nickname: Optional[str] = None
    call_time: Optional[str] = None
    voice_tone: Optional[str] = None
    push_token: Optional[str] = None
