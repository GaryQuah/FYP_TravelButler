const LEGACY_ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

export function clearLegacyAccessToken() {
  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
}

export function clearAuthState() {
  clearLegacyAccessToken();
  window.localStorage.removeItem(USER_KEY);
}
