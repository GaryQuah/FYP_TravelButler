from typing import Optional
from app.models.itinerary import Itinerary

from pydantic import BaseModel, Field

class Trip(BaseModel):
    trip_id: str
    user_ids: list[str]
    itineraries: Optional[list[Itinerary]] = Field(None)
    budget: float
    trip_name: str
    start_date: str
    end_date: str
    description: str

class TripCreationRequest(BaseModel):
    trip_name: str
    start_date: str
    end_date: str
    description: str
    budget: float
    user_ids: list[str]