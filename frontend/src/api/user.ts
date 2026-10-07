import type { User } from "../models";
import { apiFetch } from "./apiFetch";
import { clearAuthState } from "./auth";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const loginOrRegisterUser = async (
  credential: string,
): Promise<LoginResponse | null> => {
  const response = await apiFetch(`/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: credential }),
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
  const response = await apiFetch(`/api/trips/${tripId}/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || errorBody.message || "Failed to invite user");
  }
}

export const createUser = async (
  name: string,
  email: string,
): Promise<User> => {
  const response = await apiFetch(`/api/users/`, {
    method: "POST",
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
  const response = await apiFetch(
    `/api/availability-trackers/${trackerId}/invite`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.detail || errorBody.message || "Failed to invite user to tracker",
    );
  }
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiFetch(`/api/users/me`);
  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }
  return response.json();
}

export async function logoutUser(): Promise<void> {
  await apiFetch(`/api/users/logout`, {
    method: "POST",
  });
  clearAuthState();
}