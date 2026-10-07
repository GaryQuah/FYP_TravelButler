import { apiFetch } from "./apiFetch";

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
  const response = await apiFetch(`/api/trips/${tripId}/documents`);
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

  const response = await apiFetch(`/api/trips/${tripId}/documents`, {
    method: "POST",
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
  });

  if (!response.ok) {
    throw new Error("Failed to delete document");
  }
}