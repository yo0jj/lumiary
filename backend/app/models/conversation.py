from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ConversationStartRequest(BaseModel):
    call_length: str = "3min"  # 1min | 3min | 7min


class ActionItemOut(BaseModel):
    id: str
    content: str
    status: str
    scheduled_for: Optional[str] = None


class ConversationStartResponse(BaseModel):
    session_id: str
    conversation_id: str
    opening_message: str
    pending_action_item: Optional[ActionItemOut] = None


class ConversationOut(BaseModel):
    id: str
    called_at: datetime
    duration_sec: Optional[int] = None
    call_length: Optional[str] = None
    status: str
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None
    emotion: Optional[str] = None
    emotion_intensity: Optional[int] = None
    key_scene: Optional[str] = None
    hidden_desire: Optional[str] = None
    ai_comment: Optional[str] = None
    rating: Optional[int] = None
    rating_tags: Optional[List[str]] = None
    rating_comment: Optional[str] = None
    transcript: Optional[list] = None
    action_item: Optional[ActionItemOut] = None


class ConversationListResponse(BaseModel):
    conversations: List[ConversationOut]
    next_cursor: Optional[str] = None


class ConversationRatingRequest(BaseModel):
    rating: int  # 1~5
    tags: Optional[List[str]] = None
    comment: Optional[str] = None


class ActionItemUpdateRequest(BaseModel):
    status: str  # done | skipped | rescaled
