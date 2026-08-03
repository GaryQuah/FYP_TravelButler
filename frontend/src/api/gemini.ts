
import { getAuthHeaders } from './auth';

const BASE_URL = '/api/gemini';

export async function analyzeReceipt(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  } as Record<string, string>;
  delete headers["Content-Type"];

  const response = await fetch(`${BASE_URL}/analyze-receipt`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze receipt');
  }

  return response.json();
}

export async function analyzeDescription(description: string) {
  const response = await fetch(`${BASE_URL}/analyze-description`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
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
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  } as Record<string, string>;
  delete headers["Content-Type"];

  const response = await fetch(`${BASE_URL}/analyze-document`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze document');
  }

  return response.json();
}