from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorCollection

from app.utils.jwt import create_access_token
from app.utils.google import verify_google_token
from app.utils.jwt import get_current_user
from app.dependencies import get_users_collection
from app.services.user_service import (
    find_or_create_user,
    create_user,
    get_user_by_email,
    get_user_by_id,
    update_user,
)
from app.models.user import User, UpdateUserRequest

router = APIRouter(prefix="/api/users", tags=["Users"])

class GoogleLoginRequest(BaseModel):
    token: str

@router.post("/login", status_code=status.HTTP_200_OK)
async def login_google(
    request: GoogleLoginRequest,
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
):
    google_user = await verify_google_token(request.token)
    user = await find_or_create_user(
        users_collection, google_user["email"], google_user.get("name")
    )
    if not user:
        raise HTTPException(status_code=500, detail="Failed to create or find user")

    access_token = create_access_token(data={"sub": user["user_id"]})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user_route(
    user: User,
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
):
    return await create_user(users_collection, user)


@router.get("/{email}")
async def get_user(
    email: str,
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
    current_user: User = Depends(get_current_user),
):
    if email != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user",
        )

    user = await get_user_by_email(users_collection, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/{user_id}", response_model=User)
async def get_user_by_id_route(
    user_id: str,
    db: AsyncIOMotorCollection = Depends(get_users_collection),
    current_user: User = Depends(get_current_user),
):
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user",
        )

    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user



@router.put("/{user_id}")
async def update_user_route(
    user_id: str,
    data: UpdateUserRequest,
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection),
    current_user: User = Depends(get_current_user),
):
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user",
        )

    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    user = await update_user(users_collection, user_id, update_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user