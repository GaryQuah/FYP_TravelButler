import type { AiChat } from "../models/ai_chat";
import { getAuthHeaders } from "./auth";

export async function getAIChat(aiChatId: string): Promise<AiChat> {
  const response = await fetch(`/api/ai-chats/${aiChatId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch chat");
  }
  return response.json();
}

export async function addAIChatMessage(
  aiChatId: string,
  userId: string,
  message: string,
  country: string,
): Promise<AiChat> {
  const response = await fetch(`/api/ai-chats/${aiChatId}/messages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id: userId, message, country }),
  });

  if (!response.ok) {
    throw new Error("Failed to add chat message");
  }
  return response.json();
}