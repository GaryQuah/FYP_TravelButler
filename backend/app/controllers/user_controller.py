from fastapi import APIRouter, Depends, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorCollection


from app.models import UpdateUserRequest, User
from app.services.user_service import (
    create_user,
    get_user_by_email,
    update_user,
    find_or_create_user,
)
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    name: str | None = None

router = APIRouter(prefix="/api/users", tags=["users"])

# Dependency to get the database collection from the application state
def get_users_collection(request: Request) -> AsyncIOMotorCollection:
    return request.app.users_collection

@router.post("/login", status_code=status.HTTP_200_OK)
async def login_user(
    request: LoginRequest,
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
):
    user = await find_or_create_user(
        users_collection, request.email, request.name
    )
    if not user:
        raise HTTPException(status_code=500, detail="Failed to create or find user")
    return user

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user_route(
    user: User,
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
):
    return await create_user(users_collection, user)


@router.get("/{email}")
async def get_user(
    email: str, users_collection: AsyncIOMotorCollection = Depends(get_users_collection)
):
    user = await get_user_by_email(users_collection, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}")
async def update_user_route(
    user_id: str,
    data: UpdateUserRequest,
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    user = await update_user(users_collection, user_id, update_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user