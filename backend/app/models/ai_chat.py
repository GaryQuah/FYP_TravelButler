from typing import List
from .chat import Chat
from .itinerary import ItineraryCreationRequest

class AiChat(Chat):
    ai_recommendations: List[ItineraryCreationRequest] = []