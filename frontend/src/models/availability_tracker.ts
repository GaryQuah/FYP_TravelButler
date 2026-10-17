export interface AvailabilityTracker {
  id: string;
  name: string;
  user_ids: string[];
  user_names?: string[];
  min_consecutive_days: number;
  availability: Record<string, string[]>;
}

export interface AvailabilityTrackerCreationData {
  name: string;
  user_ids: string[];
  min_consecutive_days?: number;
}