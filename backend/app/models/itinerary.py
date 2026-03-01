from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Itinerary(BaseModel):
    id: str
    trip_id: str
    activity_name: str
    start_time: datetime
    end_time: datetime
    description: str

class ItineraryCreationRequest(BaseModel):
    activity_name: str
    start_time: datetime
    end_time: datetime
    description: str