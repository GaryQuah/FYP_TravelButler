import { getAuthHeaders } from "./auth";

export const post = async (url: string, body: any) => {
  const isFormData = body instanceof FormData;

  const headers = getAuthHeaders();

  if (isFormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Something went wrong");
  }

  return response.json();
};