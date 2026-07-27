import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import User
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from app.dependencies import get_users_collection

http_bearer = HTTPBearer()

SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
ALGORITHM = os.environ.get("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("JWT_EXPIRATION_TIME"))

def create_access_token(data: dict):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(http_bearer), 
    users_collection: AsyncIOMotorCollection = Depends(get_users_collection)
):
    token = credentials.credentials
    # print(f"Token: {token}")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # print(f"Payload: {payload}")
        user_id: str = payload.get("sub")
        # print(f"User ID: {user_id}")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        # print(f"JWT Error: {e}")
        raise credentials_exception
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    # print(f"User from DB: {user}")
    if user is None:
        raise credentials_exception
    
    # Create a User instance and set the user_id explicitly
    user_instance = User(**user)
    user_instance.user_id = user_id
    return user_instance