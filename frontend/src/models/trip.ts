export interface ChatMessage {
  user_id: string;
  message: string;
  timestamp: string;
}

export interface Trip {
  trip_id: string;
  trip_name: string;
  budget: number;
  start_date: Date;
  end_date: Date;
  description: string;
  user_ids: string[];
  chat: ChatMessage[];
}

export interface TripCreationData {
  trip_name: string;
  start_date: string;
  end_date: string;
  description: string;
  budget?: number;
  user_ids: string[];
}
