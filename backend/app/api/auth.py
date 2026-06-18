from fastapi import APIRouter, Depends

from app.core.auth import get_current_user_id
from app.core.database import get_supabase
from app.models.user import OnboardRequest, OnboardResponse
from app.services.user_service import onboard_user

router = APIRouter()


@router.post("/onboard", response_model=OnboardResponse, status_code=201)
async def onboard(
    req: OnboardRequest,
    user_id: str = Depends(get_current_user_id),
):
    db = get_supabase()
    return onboard_user(db, user_id, req)
