from fastapi import APIRouter, HTTPException, status

from app.models import UpdateUserRequest, User
from app.services.user_service import create_user, get_user_by_email, update_user

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user_route(user: User):
    return await create_user(router.app.users_collection, user)


@router.get("/{email}")
async def get_user(email: str):
    user = await get_user_by_email(router.app.users_collection, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}")
async def update_user_route(user_id: str, data: UpdateUserRequest):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    user = await update_user(router.app.users_collection, user_id, update_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user