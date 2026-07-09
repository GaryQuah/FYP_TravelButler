const getAuthToken = (): string | null => {
  const userItem = localStorage.getItem("user");
  if (userItem) {
    try {
      const user = JSON.parse(userItem);
      return user?.token || null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  }
  return null;
};

export const post = async (url: string, body: any) => {
  const token = getAuthToken();

  const isFormData = body instanceof FormData;

  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
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