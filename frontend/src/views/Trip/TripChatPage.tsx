import { useState, useMemo, useEffect } from "react";
import { useTripDetails } from "../../hooks/useTripDetails";
import { useUser } from "../../contexts/UserContext";
import { addChatMessage, getChat } from "../../api";
import type { ChatMessage, Chat } from "../../models";
import { convertUtcToLocalTime } from "../../utils/dateUtils";
import LoadingOverlay from "../../components/LoadingOverlay";
import "../../assets/css/TripChatPage.css";

export function TripChatPage() {
  const { trip, members } = useTripDetails();
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (trip?.chat_id) {
      getChat(trip.chat_id)
        .then(setChat)
        .catch((err) => console.error("Failed to load chat:", err))
        .finally(() => setIsLoading(false));
    } else if (trip) {
      setIsLoading(false);
    }
  }, [trip?.chat_id]);

  const memberNames = useMemo(() => {
    if (!members) return {};
    return members.reduce(
      (acc, member) => {
        acc[member.user_id] = member.name;
        return acc;
      },
      {} as { [key: string]: string },
    );
  }, [members]);

  const sendMessage = async () => {
    if (!input.trim() || !trip?.chat_id || !user) return;

    try {
      const updatedChat = await addChatMessage(
        trip.chat_id,
        user.user_id,
        input,
      );
      setChat(updatedChat);
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="d-flex flex-column">
      <LoadingOverlay show={isLoading} />
      <h2>Trip Chat</h2>

      {/* Chat messages */}
      <div className="flex-grow-1 border rounded p-3 mb-3 overflow-auto chat-container">
        {chat?.messages?.map((msg: ChatMessage) => (
          <div
            key={`${msg.timestamp}-${msg.user_id}`}
            className={`mb-3 d-flex ${
              msg.user_id === user?.user_id
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className={`p-2 rounded chat-bubble ${
                msg.user_id === user?.user_id
                  ? "bg-primary text-white"
                  : "bg-light border"
              }`}
            >
              <div className="small fw-bold">
                {memberNames[msg.user_id] || msg.user_id}
              </div>
              <div>{msg.message}</div>
              <div className="text-end small opacity-75">
                {convertUtcToLocalTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
