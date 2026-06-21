import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user_id
from app.core.database import get_supabase
from app.core.redis import set_session
from app.models.conversation import (
    ActionItemOut,
    ConversationListResponse,
    ConversationOut,
    ConversationRatingRequest,
    ConversationStartRequest,
    ConversationStartResponse,
)
from app.services.conversation_service import (
    create_conversation,
    get_opening_message,
    get_pending_action_item,
)
from app.voice.prompts import get_todays_lens

router = APIRouter()


@router.post("/conversations/start", response_model=ConversationStartResponse, status_code=201)
async def start_conversation(
    req: ConversationStartRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()

    user_row = (
        db.table("users")
        .select("nickname, push_token")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    user_data = (user_row.data if user_row else None) or {}
    nickname = user_data.get("nickname", "사용자")
    push_token = user_data.get("push_token")

    pending = get_pending_action_item(db, user_id)
    opening = get_opening_message(pending)
    conversation_id = create_conversation(db, user_id, req.call_length)

    session_id = str(uuid.uuid4())
    await set_session(session_id, {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "nickname": nickname,
        "call_length": req.call_length,
        "lens": get_todays_lens(),
        "opening_message": opening,
        "pending_action_item": pending["content"] if pending else None,
        "push_token": push_token,
        "transcript": [],
    })

    return ConversationStartResponse(
        session_id=session_id,
        conversation_id=conversation_id,
        opening_message=opening,
        pending_action_item=ActionItemOut(**pending) if pending else None,
    )


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = 20,
    cursor: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    query = (
        db.table("conversations")
        .select("*, action_items(id, content, status, scheduled_for)")
        .eq("user_id", user_id)
        .eq("status", "completed")
        .order("called_at", desc=True)
        .limit(limit)
    )
    if cursor:
        query = query.lt("called_at", cursor)

    rows = query.execute().data or []
    conversations = []
    for row in rows:
        items = row.pop("action_items", []) or []
        action_item = ActionItemOut(**items[0]) if items else None
        conversations.append(ConversationOut(**row, action_item=action_item))

    next_cursor = rows[-1]["called_at"] if len(rows) == limit else None
    return ConversationListResponse(conversations=conversations, next_cursor=next_cursor)


@router.get("/conversations/{conversation_id}", response_model=ConversationOut)
async def get_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    result = (
        db.table("conversations")
        .select("*, action_items(id, content, status, scheduled_for)")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Not found")
    row = result.data
    items = row.pop("action_items", []) or []
    action_item = ActionItemOut(**items[0]) if items else None
    return ConversationOut(**row, action_item=action_item)


@router.patch("/conversations/{conversation_id}/rating")
async def rate_conversation(
    conversation_id: str,
    req: ConversationRatingRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    db.table("conversations").update({
        "rating": req.rating,
        "rating_tags": req.tags,
        "rating_comment": req.comment,
    }).eq("id", conversation_id).eq("user_id", user_id).execute()
    return {"ok": True}
