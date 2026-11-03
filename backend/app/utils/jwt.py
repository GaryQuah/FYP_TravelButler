import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, Request, Response, status
from app.models.user import User
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorCollection
from app.dependencies import get_users_collection
from app.config import DEBUG

SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
ALGORITHM = os.environ.get("JWT_ALGORITHM")
JWT_ISSUER = os.environ.get("JWT_ISSUER", "travelmate-backend")
JWT_AUDIENCE = os.environ.get("JWT_AUDIENCE", "travelmate-frontend")

try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("JWT_EXPIRATION_TIME", "60"))
except ValueError as exc:
    raise RuntimeError("JWT_EXPIRATION_TIME must be an integer") from exc

if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY is not configured")
if not ALGORITHM:
    raise RuntimeError("JWT_ALGORITHM is not configured")
if ACCESS_TOKEN_EXPIRE_MINUTES <= 0:
    raise RuntimeError("JWT_EXPIRATION_TIME must be greater than 0")

def create_access_token(data: dict):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update(
        {"exp": expire, "iat": now, "iss": JWT_ISSUER, "aud": JWT_AUDIENCE}
    )
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def set_access_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=not DEBUG,
        samesite="lax" if DEBUG else "none",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


def clear_access_cookie(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        samesite="lax" if DEBUG else "none",
        secure=not DEBUG,
    )

async def get_current_user(
    request: Request,
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection)
):
    token = request.cookies.get("access_token")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    try:
        user_object_id = ObjectId(user_id)
    except InvalidId:
        raise credentials_exception

    user = await users_collection.find_one({"_id": user_object_id})
    if user is None:
        raise credentials_exception
    
    # Create a User instance and set the user_id explicitly
    user_instance = User(**user)
    user_instance.user_id = user_id
    return user_instance