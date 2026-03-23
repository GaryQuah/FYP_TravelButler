import { type ChatMessage } from "./trip";


export interface Chat {
  chat_id: string;
  trip_id: string;
  messages: ChatMessage[];
}
