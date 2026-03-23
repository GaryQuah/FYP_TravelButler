import type { Chat } from "../models/chat";

export async function getChat(chatId: string): Promise<Chat> {
  const response = await fetch(`/api/chats/${chatId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch chat");
  }
  return response.json();
}

export async function addChatMessage(
  chatId: string,
  userId: string,
  message: string
): Promise<Chat> {
  const response = await fetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, message }),
  });

  if (!response.ok) {
    throw new Error("Failed to add chat message");
  }
  return response.json();
}