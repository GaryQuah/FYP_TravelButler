from typing import Optional
from app.models.itinerary import Itinerary
from datetime import date, datetime
from pydantic import BaseModel, Field
from bson import ObjectId

class Trip(BaseModel):
    id: ObjectId = Field(default_factory=ObjectId, alias="_id")
    user_ids: list[str]
    itinerary_ids: Optional[list[str]] = Field(None)
    budget: float
    trip_name: str
    start_date: datetime
    end_date: datetime
    description: str
    country: str
    chat_id: Optional[str] = Field(None)
    ai_chat_id: Optional[str] = Field(None)
    document_ids: Optional[list[str]] = Field(None)

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }

class TripCreationRequest(BaseModel):
    trip_name: str
    start_date: str
    end_date: str
    description: str
    country: str
    budget: float = 0.0
    user_ids: list[str]

class TripUpdateRequest(BaseModel):
    trip_name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    country: Optional[str] = None
    budget: Optional[float] = None