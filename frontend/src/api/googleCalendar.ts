import { apiFetch } from "./apiFetch";

const API_BASE_URL = "/api";

export async function getGoogleCalendarStatus(): Promise<{ connected: boolean }> {
  const response = await apiFetch(`${API_BASE_URL}/google-calendar/status`);
  if (!response.ok) throw new Error("Failed to get Google Calendar status");
  return response.json();
}

export async function connectGoogleCalendar(codeResponse: {
  code: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await apiFetch(`${API_BASE_URL}/google-calendar/connect`, {
    method: "POST",
    body: JSON.stringify(codeResponse),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(errorData.detail || `HTTP error: ${response.status}`);
  }
  return response.json();
}

export async function disconnectGoogleCalendar(): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await apiFetch(`${API_BASE_URL}/google-calendar/disconnect`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to disconnect Google Calendar");
  return response.json();
}

export async function exportItinerariesToCalendar(
  itinerary_ids: string[],
): Promise<{
  success: boolean;
  created_events: Array<{
    itinerary_id: string;
    event_id: string;
    html_link: string;
  }>;
  errors: Array<{ itinerary_id: string; error: string }>;
  message: string;
}> {
  const response = await apiFetch(
    `${API_BASE_URL}/google-calendar/export-itineraries`,
    {
      method: "POST",
      body: JSON.stringify({ itinerary_ids }),
    },
  );
  if (!response.ok)
    throw new Error("Failed to export itineraries to Google Calendar");
  return response.json();
}

export async function createSingleCalendarEvent(
  eventData: any,
): Promise<{ success: boolean; event: any }> {
  const response = await apiFetch(`${API_BASE_URL}/google-calendar/events`, {
    method: "POST",
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error("Failed to create calendar event");
  return response.json();
}