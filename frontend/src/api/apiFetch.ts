import { getAuthHeaders } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

export function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
}