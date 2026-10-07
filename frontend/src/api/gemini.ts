
import { apiFetch } from './apiFetch';

const BASE_URL = '/api/gemini';

export async function analyzeReceipt(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiFetch(`${BASE_URL}/analyze-receipt`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze receipt');
  }

  return response.json();
}

export async function analyzeItinerary(itinerary: any[]) {
  const response = await apiFetch(`${BASE_URL}/analyze-itinerary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itinerary }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze itinerary");
  }

  return response.json();
}

export async function analyzeDescription(description: string) {
  const response = await apiFetch(`${BASE_URL}/analyze-description`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze description");
  }

  return response.json();
}

export async function analyzeDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiFetch(`${BASE_URL}/analyze-document`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze document');
  }

  return response.json();
}