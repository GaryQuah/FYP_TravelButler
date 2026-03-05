/*
This file contains API calls related to user authentication and trip management. 
It defines functions to login/register users, create users, and create trips. 
TODO: create individual api files rather than bunching all api calls into one file.
*/

export interface User {
  user_id: string;
  name: string;
  email: string;
}

export const loginOrRegisterUser = async (
  email: string,
  name?: string,
): Promise<User | null> => {
  const response = await fetch(`/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name }),
  });

  if (!response.ok) {
    console.error("Failed to login or register user");
    return null;
  }

  return response.json();
}

export async function inviteUserToTrip(
  tripId: string,
  email: string,
): Promise<void> {
  const response = await fetch(`/api/trips/${tripId}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || "Failed to invite user");
  }
};

export const createUser = async (
  name: string,
  email: string,
): Promise<User> => {
  const response = await fetch(`/api/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return response.json();
};

//Trip related API calls
export interface Trip {
  trip_id: string;
  trip_name: string;
  budget: number;
  start_date: Date;
  end_date: Date;
  description: string;
  user_ids: string[];
}

export interface TripCreationData {
  trip_name: string;
  start_date: string;
  end_date: string;
  description: string;
  budget?: number;
  user_ids: string[];
}

export interface Itinerary {
  id: string;
  activity_name: string;
  start_time: Date;
  end_time: Date;
  description: string;
}

export interface ItineraryCreationData {
  activity_name: string;
  start_time: Date;
  end_time: Date;
  description: string;
}

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

export async function getTrips(): Promise<Trip[]> {
  const response = await fetch("/api/trips");
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