from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user_id
from app.core.database import get_supabase
from app.models.user import UserResponse, UserUpdateRequest
from app.services.user_service import get_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def me(user_id: str = Depends(get_current_user_id)):
    db = get_supabase()
    try:
        return get_user(db, user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.patch("/me", response_model=UserResponse)
async def update_me(
    req: UserUpdateRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    patch = req.model_dump(exclude_none=True)
    if patch:
        db.table("users").update(patch).eq("id", user_id).execute()
    return get_user(db, user_id)
