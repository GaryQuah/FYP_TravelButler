from pydantic import BaseModel, Field
from typing import List, Dict

class AvailabilityTracker(BaseModel):
    id: str
    name: str
    user_ids: List[str]
    user_names: List[str] = []
    min_consecutive_days: int = Field(default=3, ge=1)
    availability: Dict[str, List[str]] = {}

class AvailabilityTrackerCreationRequest(BaseModel):
    name: str
    user_ids: List[str]
    min_consecutive_days: int = Field(default=3, ge=1)

class AvailabilityTrackerUpdateRequest(BaseModel):
    name: str | None = None
    min_consecutive_days: int | None = Field(default=None, ge=1)