import type { User, Trip, TripCreationData } from "../models";

export const createTrip = async (tripData: TripCreationData): Promise<Trip> => {
  const response = await fetch(`/api/trips/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tripData),
  });
  if (!response.ok) {
    throw new Error("Failed to create trip");
  }
  return response.json();
};

export async function deleteTrip(tripId: string): Promise<void> {
  const response = await fetch(`/api/trips/${tripId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to delete trip: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }
}

export async function getTripDetails(tripId: string): Promise<Trip> {
  const response = await fetch(`/api/trips/${tripId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch trip details");
  }
  const trip = await response.json();
  // Convert string dates to Date objects
  return {
    ...trip,
    start_date: new Date(trip.start_date),
    end_date: new Date(trip.end_date),
  };
}

export async function getTripMembers(tripId: string): Promise<User[]> {
  const response = await fetch(`/api/trips/${tripId}/members`);
  if (!response.ok) {
    throw new Error("Failed to fetch trip members");
  }
  return response.json();
}

export async function getTrips(userId: string): Promise<Trip[]> {
  const response = await fetch("/api/trips", {
    headers: {
      "X-User-Id": userId,
    },
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
  }));
}