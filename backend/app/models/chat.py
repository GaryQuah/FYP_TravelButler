from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

class Message(BaseModel):
    user_id: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc)
)

class Chat(BaseModel):
    trip_id: str
    messages: List[Message] = []