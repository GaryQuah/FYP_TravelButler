const API_BASE_URL = "http://localhost:8000";

export interface User {
  user_id: string;
  name: string;
  email: string;
}

export const loginOrRegisterUser = async (
  email: string,
  name?: string
): Promise<User | null> => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name }),
  });

  if (!response.ok) {
    console.error("Failed to login or register user");
    return null;
  }

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