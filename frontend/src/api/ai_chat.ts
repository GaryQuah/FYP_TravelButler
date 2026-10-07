import type { AiChat } from "../models/ai_chat";
import { apiFetch } from "./apiFetch";

export async function getAIChat(aiChatId: string): Promise<AiChat> {
  const response = await apiFetch(`/api/ai-chats/${aiChatId}`);
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
  const response = await apiFetch(`/api/ai-chats/${aiChatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, message, country }),
  });

  if (!response.ok) {
    throw new Error("Failed to add chat message");
  }
  return response.json();
}