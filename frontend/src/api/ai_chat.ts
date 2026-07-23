import type { AiChat } from "../models/ai_chat";

export async function getAIChat(aiChatId: string): Promise<AiChat> {
  const response = await fetch(`/api/ai-chats/${aiChatId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch chat");
  }
  return response.json();
}

export async function addAIChatMessage(
  aiChatId: string,
  userId: string,
  message: string
): Promise<AiChat> {
  const response = await fetch(`/api/ai-chats/${aiChatId}/messages`, {
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