from typing import Optional, Annotated
from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    id: str = Field(exclude=True)
    name: str
    email: EmailStr


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None