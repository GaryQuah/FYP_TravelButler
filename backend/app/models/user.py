from typing import Optional, Annotated
from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    user_id: Optional[str] = None
    name: str
    email: EmailStr


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None