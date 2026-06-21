from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user_id
from app.core.database import get_supabase
from app.models.conversation import ActionItemOut, ActionItemUpdateRequest

router = APIRouter()


@router.get("/action-items/pending")
async def get_pending(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
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
    if not data:
        return None
    return ActionItemOut(**data[0])


@router.patch("/action-items/{item_id}")
async def update_action_item(
    item_id: str,
    req: ActionItemUpdateRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    result = (
        db.table("action_items")
        .update({"status": req.status})
        .eq("id", item_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
