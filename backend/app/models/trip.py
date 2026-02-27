from typing import Optional
from app.models.itinerary import Itinerary

from pydantic import BaseModel, Field

class Trip(BaseModel):
    trip_id: str #Stores the unique identifier for the trip
    user_ids: list[str] #Stores the list of user IDs associated with the trip for retrieval purposes
    itineraries: Optional[list[Itinerary]] = Field(None) #Stores the list of itineraries associated with the trip for retrieval purposes
    budget: float #Stores the budget for the trip, potentially remove if not needed
    title: str #Stores the title of the trip

class CreateTripRequest(BaseModel):
    user_ids: list[str] #Stores the list of user IDs associated with the trip for retrieval purposes