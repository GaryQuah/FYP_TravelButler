import { type ChatMessage } from "./trip";
import { type ItineraryCreationData } from "./itinerary";

export interface AiChat {
  ai_chat_id: string;
  trip_id: string;
  messages: ChatMessage[];
  ai_recommendations: ItineraryCreationData[];
}