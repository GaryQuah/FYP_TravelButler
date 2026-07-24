from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    user_id: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Chat(BaseModel):
    trip_id: str
    messages: List[Message] = []