from typing import Optional

from pydantic import BaseModel, EmailStr


class Itinerary(BaseModel):
    itinerary_id: str
    title: str
    description: str
    time: str
