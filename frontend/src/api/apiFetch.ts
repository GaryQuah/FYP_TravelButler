const API_URL = import.meta.env.VITE_API_URL;

export function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers({
    ...options.headers,
  });

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });
}
