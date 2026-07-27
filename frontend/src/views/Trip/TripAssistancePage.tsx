import { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { useTripDetails } from "../../hooks/useTripDetails";
import { useUser } from "../../models/UserContext";
import { MiniItineraryCard } from "../../components/cards/MiniItineraryCard";
import { formatTime } from "../../utils/dateUtils";

import { addAIChatMessage, getAIChat, addItinerary } from "../../api";
import type { ChatMessage, AiChat, ItineraryCreationData } from "../../models";

export function TripAssistancePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, members, addItineraryItem } = useTripDetails();
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<AiChat | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (trip?.ai_chat_id) {
      getAIChat(trip.ai_chat_id)
        .then(setChat)
        .catch((err) => console.error("Failed to load chat:", err));
    }
  }, [trip?.ai_chat_id]);

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

  const handleAddToItinerary = async (item: ItineraryCreationData) => {
    if (!tripId) return;
    try {
      const newItineraryItem = await addItinerary(tripId, item);
      addItineraryItem(newItineraryItem);
      // Optionally, provide feedback to the user
      alert("Activity added to itinerary!");
    } catch (error) {
      console.error("Failed to add itinerary item:", error);
      alert("Failed to add activity. Please try again.");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !trip?.ai_chat_id || !user) return;

    const userMessage: ChatMessage = {
      user_id: user.user_id,
      message: input,
      timestamp: new Date().toISOString(),
    };

    setChat((prevChat) => {
      if (!prevChat) {
        return {
          ai_chat_id: trip.ai_chat_id!,
          trip_id: trip.trip_id,
          messages: [userMessage],
          ai_recommendations: [],
        };
      }
      return {
        ...prevChat,
        messages: [...prevChat.messages, userMessage],
      };
    });

    const messageToSend = input;
    setInput("");

    setIsThinking(true);
    try {
      const updatedChat = await addAIChatMessage(
        trip.ai_chat_id,
        user.user_id,
        messageToSend,
      );
      setChat(updatedChat);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="d-flex flex-column">
      <h2>AI Assisted Chat</h2>

      {/* Chat messages */}
      <div
        className="flex-grow-1 border rounded p-3 mb-3 overflow-auto"
        style={{ maxHeight: "60vh" }}
      >
        {chat?.messages?.map((msg: ChatMessage, index: number) => {
          let messageContent = msg.message;
          if (msg.user_id === "assistant") {
            try {
              const parsed = JSON.parse(msg.message);
              if (parsed && parsed.response) {
                messageContent = parsed.response;
              }
            } catch (e) {
              // Not a JSON string, so we'll just display the raw message.
            }
          }

          return (
            <div
              key={`${msg.timestamp}-${msg.user_id}`}
              className={`mb-3 d-flex ${
                msg.user_id === "assistant"
                  ? "justify-content-start"
                  : "justify-content-end"
              }`}
            >
              <div
                className={`p-2 rounded ${
                  msg.user_id === "assistant"
                    ? "bg-light border"
                    : "bg-primary text-white"
                }`}
                style={{ maxWidth: "60%" }}
              >
                <div className="small fw-bold">
                  {msg.user_id === "assistant"
                    ? "AI Assistant"
                    : memberNames[msg.user_id] || msg.user_id}
                </div>
                {msg.user_id === "assistant" ? (
                  <ReactMarkdown>{messageContent}</ReactMarkdown>
                ) : (
                  <div>{messageContent}</div>
                )}
                {msg.user_id === "assistant" &&
                  index === chat.messages.length - 1 &&
                  chat.ai_recommendations?.length > 0 && (
                    <div className="mt-2">
                      {chat.ai_recommendations.map((itinerary, i) => {
                        return (
                          <MiniItineraryCard
                            key={i}
                            itinerary={itinerary}
                            onAddToItinerary={handleAddToItinerary}
                          />
                        );
                      })}
                    </div>
                  )}
                <div className="text-end small opacity-75">
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
        {isThinking && (
          <div className="mb-3 d-flex justify-content-start">
            <div
              className="p-2 rounded bg-light border"
              style={{ maxWidth: "60%" }}
            >
              <div className="small fw-bold">AI Assistant</div>
              <div>typing...</div>
            </div>
          </div>
        )}
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
