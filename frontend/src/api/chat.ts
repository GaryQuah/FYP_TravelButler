import type { Trip } from "../models";

export async function addChatMessage(
  tripId: string,
  userId: string,
  message: string
): Promise<Trip> {
  const response = await fetch(`/api/trips/${tripId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, message }),
  });

  if (!response.ok) {
    throw new Error("Failed to add chat message");
  }
  return response.json();
}