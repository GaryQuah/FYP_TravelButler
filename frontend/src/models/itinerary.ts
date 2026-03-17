export interface Itinerary {
  id: string;
  activity_name: string;
  start_time: Date;
  end_time: Date;
  description: string;
}

export interface ItineraryCreationData {
  activity_name: string;
  start_time: Date;
  end_time: Date;
  description: string;
}
