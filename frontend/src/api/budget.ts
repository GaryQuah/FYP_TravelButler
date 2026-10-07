import { post } from "./utils";
import type { TripBudget } from "../models/budget";
import { apiFetch } from "./apiFetch";

export const addExpenditure = async (
  tripId: string,
  expenditure: { amount: number; item: string; category: string },
) => {
  return await post(`/api/trips/${tripId}/budget`, expenditure);
};

export const getTripBudget = async (tripId: string) => {
  const response = await apiFetch(`/api/budget/${tripId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch trip budget");
  }
  return response.json();
};

export const updateTripBudget = async (trip: TripBudget) => {
  const response = await apiFetch(`/api/budget/${trip.id}`, {
    method: "PUT",
    body: JSON.stringify(trip),
  });

  if (!response.ok) {
    throw new Error("Failed to update trip budget");
  }
  return response.json();
};