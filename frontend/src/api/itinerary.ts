import type { Itinerary, ItineraryCreationData } from "../models";

export async function getItineraries(tripId: string): Promise<Itinerary[]> {
  const response = await fetch(`/api/itineraries/${tripId}`);
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
  const response = await fetch(`/api/itineraries/${tripId}`, {
    method: "POST",
    headers: {
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
  itineraryId: string
): Promise<void> {
  const response = await fetch(`/api/itineraries/${tripId}/${itineraryId}`, {
    method: "DELETE",
  });
 
  if (!response.ok) {
    throw new Error("Failed to delete itinerary");
  }
}

export async function getItinerariesByIds(itineraryIds: string[]): Promise<Itinerary[]> {
  const response = await fetch(`/api/itineraries/get_by_ids`, {
    method: "POST",
    headers: {
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