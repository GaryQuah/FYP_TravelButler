from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Itinerary(BaseModel):
    id: str
    trip_id: str
    activity_name: str
    start_time: str
    end_time: str
    description: str

class ItineraryIdsRequest(BaseModel):
    itinerary_ids: list[str]

class ItineraryCreationRequest(BaseModel):
    activity_name: str
    start_time: datetime
    end_time: datetime
    description: str

class ItineraryUpdateRequest(BaseModel):
    activity_name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    description: Optional[str] = None