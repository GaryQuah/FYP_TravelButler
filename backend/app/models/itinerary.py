from pydantic import BaseModel
from typing import Optional

class Itinerary(BaseModel):
    id: str
    trip_id: str
    activity_name: str
    start_time: str
    end_time: str
    description: str

class ItineraryCreationRequest(BaseModel):
    activity_name: str
    start_time: str
    end_time: str
    description: str