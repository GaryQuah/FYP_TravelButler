import { post } from "./utils";
import { getAuthHeaders } from "./auth";

export const addExpenditure = async (
  tripId: string,
  expenditure: { amount: number; item: string; category: string },
) => {
  return await post(`/api/trips/${tripId}/budget`, expenditure);
};

export const getTripBudget = async (tripId: string) => {
  const response = await fetch(`/api/budget/${tripId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch trip budget");
  }
  return response.json();
};