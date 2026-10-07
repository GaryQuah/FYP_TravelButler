import { apiFetch } from "./apiFetch";
import { getAuthHeaders } from "./auth";

export const fetchPolls = async (tripId: string) => {
  const response = await apiFetch(`/api/trip/${tripId}/polls`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to fetch polls" }));
    throw new Error(errorData.message);
  }
  return response.json();
};

export const createPoll = async (
  tripId: string,
  pollData: { title: string; options: string[] },
) => {
  const response = await apiFetch(`/api/trip/${tripId}/polls`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(pollData),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to create poll" }));
    throw new Error(errorData.message);
  }
  return response.json();
};

export const voteOnPoll = async (
  tripId: string,
  pollId: string,
  optionId: string,
) => {
  const response = await apiFetch(
    `/api/trip/${tripId}/polls/${pollId}/options/${optionId}/vote`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    },
  );
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to vote" }));
    throw new Error(errorData.message);
  }
  return response.json();
};

export const deletePoll = async (tripId: string, pollId: string) => {
  const response = await apiFetch(`/api/trip/${tripId}/polls/${pollId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Failed to delete poll" }));
    throw new Error(errorData.message);
  }
};