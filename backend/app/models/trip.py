from typing import Optional
from app.models.itinerary import Itinerary
from datetime import date, datetime
from pydantic import BaseModel, Field

class Trip(BaseModel):
    trip_id: str
    user_ids: list[str]
    itinerary_ids: Optional[list[str]] = Field(None)
    budget: float
    trip_name: str
    start_date: datetime
    end_date: datetime
    description: str
    chat_id: Optional[str] = Field(None)
    ai_chat_id: Optional[str] = Field(None)

class TripCreationRequest(BaseModel):
    trip_name: str
    start_date: str
    end_date: str
    description: str
    budget: float = 0.0
    user_ids: list[str]

class TripUpdateRequest(BaseModel):
    trip_name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    budget: Optional[float] = None