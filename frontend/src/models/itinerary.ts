export interface Itinerary {
  id: string;
  activity_name: string;
  start_time: string;
  end_time: string;
  description: string;
}

export interface ItineraryCreationData {
  activity_name: string;
  start_time: string;
  end_time: string;
  description: string;
}