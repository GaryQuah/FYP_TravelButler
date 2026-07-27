import type { User, Trip, TripCreationData } from "../models";
import { getAuthHeaders } from "./auth";

export async function createTrip(tripData: TripCreationData): Promise<Trip> {
  const response = await fetch(`/api/trips/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(tripData),
  });
  if (!response.ok) {
    throw new Error("Failed to create trip");
  }
  const newTrip = await response.json();
  // Convert string dates to Date objects
  return {
    ...newTrip,
    start_date: new Date(newTrip.start_date),
    end_date: new Date(newTrip.end_date),
    ai_chat_id: newTrip.ai_chat_id,
  };
}

export async function deleteTrip(tripId: string): Promise<void> {
  const response = await fetch(`/api/trips/${tripId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to delete trip: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }
}

export async function getTripDetails(tripId: string): Promise<Trip> {
  const response = await fetch(`/api/trips/${tripId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch trip details");
  }
  const trip = await response.json();
  // Convert string dates to Date objects
  return {
    ...trip,
    start_date: new Date(trip.start_date),
    end_date: new Date(trip.end_date),
    ai_chat_id: trip.ai_chat_id,
  };
}

export async function getTripMembers(tripId: string): Promise<User[]> {
  const response = await fetch(`/api/trips/${tripId}/members`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch trip members");
  }
  return response.json();
}

export async function getTrips(): Promise<Trip[]> {
  const response = await fetch("/api/trips/", {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch trips");
  }
  const trips = await response.json();
  // Convert string dates to Date objects
  return trips.map((trip: any) => ({
    ...trip,
    start_date: new Date(trip.start_date),
    end_date: new Date(trip.end_date),
    ai_chat_id: trip.ai_chat_id,
  }));
}

export async function updateTrip(
  tripId: string,
  tripData: Partial<TripCreationData>,
): Promise<Trip> {
  const response = await fetch(`/api/trips/${tripId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(tripData),
  });
  if (!response.ok) {
    throw new Error("Failed to update trip");
  }
  const updatedTrip = await response.json();
  // Convert string dates to Date objects
  return {
    ...updatedTrip,
    start_date: new Date(updatedTrip.start_date),
    end_date: new Date(updatedTrip.end_date),
    ai_chat_id: updatedTrip.ai_chat_id,
  };
}