import { type ChatMessage } from "./trip";


export interface AiChat {
  ai_chat_id: string;
  trip_id: string;
  messages: ChatMessage[];
}