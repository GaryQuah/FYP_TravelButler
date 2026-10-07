
import type {
  AvailabilityTracker,
  AvailabilityTrackerCreationData,
  User,
} from "../models";
import { apiFetch } from "./apiFetch";

export async function getAvailabilityTrackers(): Promise<AvailabilityTracker[]> {
  const response = await apiFetch(`/api/availability-trackers/`);
  if (!response.ok) {
    throw new Error("Failed to fetch availability trackers");
  }
  return response.json();
}

export async function getTrackerMembers(trackerId: string): Promise<User[]> {
  const response = await apiFetch(
    `/api/availability-trackers/${trackerId}/members`
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
  const response = await apiFetch(`/api/availability-trackers/${trackerId}`, {
    method: "PUT",
    body: JSON.stringify(trackerData),
  });
  if (!response.ok) {
    throw new Error("Failed to update availability tracker");
  }
  return response.json();
}

export async function deleteAvailabilityTracker(
  trackerId: string,
): Promise<void> {
  const response = await apiFetch(`/api/availability-trackers/${trackerId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete availability tracker");
  }
}

export async function getTrackerData(trackerId: string) {
  const response = await apiFetch(`/api/availability-trackers/${trackerId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch tracker data");
  }
  return response.json();
}

export async function saveAvailability(
  trackerId: string,
  userId: string,
  dates: string[],
) {
  const response = await apiFetch(
    `/api/availability-trackers/${trackerId}/availability/${userId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dates),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to save availability");
  }
  return response.json();
}