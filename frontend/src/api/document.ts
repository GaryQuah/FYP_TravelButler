import { apiFetch } from "./apiFetch";
import { getAuthHeaders } from "./auth";

export interface Document {
  id: string;
  filename: string;
  name: string;
  description: string;
  content_type: string;
  gcs_url: string;
  created_at: string;
  user_id: string;
  uploaded_by: string;
}

export async function getDocuments(tripId: string): Promise<Document[]> {
  const response = await apiFetch(`/api/trips/${tripId}/documents`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json();
}

export async function uploadDocument(
  tripId: string,
  file: File,
  name: string,
  description: string,
): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("description", description);

  const headers: Record<string, string> = {
    ...getAuthHeaders(),
  } as Record<string, string>;
  delete headers["Content-Type"];

  const response = await apiFetch(`/api/trips/${tripId}/documents`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }
  return response.json();
}

export async function deleteDocument(
  tripId: string,
  documentId: string,
): Promise<void> {
  const response = await apiFetch(`/api/trips/${tripId}/documents/${documentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete document");
  }
}