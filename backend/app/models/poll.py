from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Vote(BaseModel):
    user_id: str = Field(..., alias="userId")
    user_name: str = Field(..., alias="userName")

class PollOption(BaseModel):
    id: str = Field(..., alias="id")
    text: str = Field(..., alias="text")
    votes: List[Vote] = Field(default_factory=list)

class Poll(BaseModel):
    id: str = Field(..., alias="id")
    trip_id: str = Field(..., alias="tripId")
    title: str = Field(..., alias="title")
    created_by: Optional[str] = Field(None, alias="createdBy")
    created_at: datetime = Field(default_factory=datetime.now, alias="createdAt")
    options: List[PollOption] = Field(..., alias="options")

class CreatePollRequest(BaseModel):
    title: str
    options: List[str]

class UpdatePollRequest(BaseModel):
    title: str
    options: List[str]