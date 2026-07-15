
import type {
  AvailabilityTracker,
  AvailabilityTrackerCreationData,
  User,
} from "../models";


export async function getTrackerMembers(trackerId: string): Promise<User[]> {
  const response = await fetch(`/api/availability-trackers/${trackerId}/members`);
  if (!response.ok) {
    throw new Error("Failed to fetch tracker members");
  }
  return response.json();
}

export async function updateAvailabilityTracker(
  trackerId: string,
  trackerData: Partial<AvailabilityTrackerCreationData>
): Promise<AvailabilityTracker> {
  const response = await fetch(`/api/availability-trackers/${trackerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trackerData),
  });
  if (!response.ok) {
    throw new Error("Failed to update availability tracker");
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