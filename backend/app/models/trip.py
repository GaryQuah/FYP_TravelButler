from typing import Optional
from app.models.itinerary import Itinerary

from pydantic import BaseModel

class Trip(BaseModel):
    trip_id: str
    itineraries: list[Itinerary]
    budget: float
