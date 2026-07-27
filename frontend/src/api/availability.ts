
import type {
  AvailabilityTracker,
  AvailabilityTrackerCreationData,
  User,
} from "../models";
import { getAuthHeaders } from "./auth";

export async function getAvailabilityTrackers(): Promise<AvailabilityTracker[]> {
  const response = await fetch(`/api/availability-trackers/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch availability trackers");
  }
  return response.json();
}

export async function getTrackerMembers(trackerId: string): Promise<User[]> {
  const response = await fetch(
    `/api/availability-trackers/${trackerId}/members`,
    {
      headers: getAuthHeaders(),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch tracker members");
  }
  return response.json();
}

export async function updateAvailabilityTracker(
  trackerId: string,
  trackerData: Partial<AvailabilityTrackerCreationData>,
): Promise<AvailabilityTracker> {
  const response = await fetch(`/api/availability-trackers/${trackerId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete availability tracker");
  }
}