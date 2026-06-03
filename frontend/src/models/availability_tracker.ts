export interface AvailabilityTracker {
  id: string;
  name: string;
  user_ids: string[];
  availability: Record<string, string[]>;
}