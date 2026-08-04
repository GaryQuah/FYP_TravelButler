const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

export function getAuthHeaders(): HeadersInit {
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function clearAuthState() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}