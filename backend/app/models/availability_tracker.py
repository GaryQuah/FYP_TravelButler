from pydantic import BaseModel
from typing import List, Dict

class AvailabilityTracker(BaseModel):
    id: str
    name: str
    user_ids: List[str]
    availability: Dict[str, List[str]] = {}

class AvailabilityTrackerCreationRequest(BaseModel):
    name: str
    user_ids: List[str]

class AvailabilityTrackerUpdateRequest(BaseModel):
    name: str