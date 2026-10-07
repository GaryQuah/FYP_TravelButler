import type { Chat } from "../models/chat";
import { apiFetch } from "./apiFetch";

export async function getChat(chatId: string): Promise<Chat> {
  const response = await apiFetch(`/api/chats/${chatId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch chat");
  }
  return response.json();
}

export async function addChatMessage(
  chatId: string,
  userId: string,
  message: string,
): Promise<Chat> {
  const response = await apiFetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, message }),
  });

  if (!response.ok) {
    throw new Error("Failed to add chat message");
  }
  return response.json();
}