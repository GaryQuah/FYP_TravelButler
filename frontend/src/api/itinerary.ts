import type { Itinerary, ItineraryCreationData } from "../models";
import { getAuthHeaders } from "./auth";

export async function getItineraries(tripId: string): Promise<Itinerary[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/itineraries/${tripId}`, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch itineraries");
  }
  const itineraries = await response.json();
  // Convert string dates to Date objects
  return itineraries.map((itinerary: any) => ({
    ...itinerary,
    start_time: new Date(itinerary.start_time),
    end_time: new Date(itinerary.end_time),
  }));
}

export async function addItinerary(
  tripId: string,
  itineraryData: ItineraryCreationData,
): Promise<Itinerary> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`/api/itineraries/${tripId}`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itineraryData),
  });

  if (!response.ok) {
    throw new Error("Failed to add itinerary item");
  }
  return response.json();
}

export async function deleteItinerary(
  tripId: string,
  itineraryId: string,
): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/itineraries/${tripId}/${itineraryId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to delete itinerary");
  }
}

export async function getItinerariesByIds(
  itineraryIds: string[],
): Promise<Itinerary[]> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`/api/itineraries/get_by_ids`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itinerary_ids: itineraryIds }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch itineraries");
  }
  const itineraries = await response.json();
  // Convert string dates to Date objects
  return itineraries.map((itinerary: any) => ({
    ...itinerary,
    start_time: new Date(itinerary.start_time),
    end_time: new Date(itinerary.end_time),
  }));
}

export async function updateItinerary(
  tripId: string,
  itineraryId: string,
  itineraryData: Partial<ItineraryCreationData>,
): Promise<Itinerary> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`/api/itineraries/${tripId}/${itineraryId}`, {
    method: "PUT",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itineraryData),
  });
  if (!response.ok) {
    throw new Error("Failed to update itinerary");
  }
  const updatedItinerary = await response.json();
  // Convert string dates to Date objects
  return {
    ...updatedItinerary,
    start_time: new Date(updatedItinerary.start_time),
    end_time: new Date(updatedItinerary.end_time),
  };
}