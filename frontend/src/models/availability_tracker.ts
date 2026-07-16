export interface AvailabilityTracker {
  id: string;
  name: string;
  user_ids: string[];
  availability: Record<string, string[]>;
}

export interface AvailabilityTrackerCreationData {
  name: string;
  user_ids: string[];
}