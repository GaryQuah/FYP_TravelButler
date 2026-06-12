from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GoogleCalendarTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_expiry: datetime
    token_type: str = "Bearer"

class GoogleCalendarIntegration(BaseModel):
    id: str
    user_id: str
    service: str = "google_calendar"
    tokens: GoogleCalendarTokens
    created_at: datetime
    updated_at: datetime

class GoogleCalendarIntegrationCreateRequest(BaseModel):
    code: str

class GoogleCalendarEventRequest(BaseModel):
    summary: str
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    location: Optional[str] = None

class ExportItineraryRequest(BaseModel):
    itinerary_ids: list[str]