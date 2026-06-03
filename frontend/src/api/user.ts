import type { User } from "../models";

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
};

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
}

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

export async function inviteUserToTracker(
  trackerId: string,
  email: string,
): Promise<void> {
  const response = await fetch(
    `/api/availability-trackers/${trackerId}/invite`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || "Failed to invite user to tracker");
  }
}