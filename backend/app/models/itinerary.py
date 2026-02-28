from typing import Optional

from pydantic import BaseModel, EmailStr


class Itinerary(BaseModel):
    itinerary_id: str
    trip_id: str #Keep track of the trip that this itinerary belongs to for retrieval purposes
    title: str
    description: str
    time: str
