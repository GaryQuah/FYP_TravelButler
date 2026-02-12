const API_BASE_URL = "http://localhost:8000";

export interface User {
  user_id: string;
  name: string;
  email: string;
}

export const getUserByEmail = async (
  email: string
): Promise<User | null> => {
  const response = await fetch(`${API_BASE_URL}/users/${email}`);

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch user");

  return response.json();
};

export const createUser = async (
  name: string,
  email: string
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return response.json();
};
