
import type { User } from "../models";

export async function getTrackerMembers(trackerId: string): Promise<User[]> {
  const response = await fetch(`/api/availability-trackers/${trackerId}/members`);
  if (!response.ok) {
    throw new Error("Failed to fetch tracker members");
  }
  return response.json();
}

export async function deleteAvailabilityTracker(trackerId: string): Promise<void> {
  const response = await fetch(`/api/availability-trackers/${trackerId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete availability tracker");
  }
}