import { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { useTripDetails } from "../../hooks/useTripDetails";
import { useUser } from "../../models/UserContext";
import { MiniItineraryCard } from "../../components/cards/MiniItineraryCard";
import { formatTime } from "../../utils/dateUtils";
import { ItineraryModal } from "../../components/modals/ItineraryModal";
import { DateSelectionModal } from "../../components/modals/DateSelectionModal";

import { addAIChatMessage, getAIChat, addItinerary } from "../../api";
import type { ChatMessage, AiChat, ItineraryCreationData } from "../../models";

export function TripAssistancePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, members, addItineraryItem } = useTripDetails();
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<AiChat | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] =
    useState<ItineraryCreationData | null>(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

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

  const handleAddToItinerary = (item: ItineraryCreationData) => {
    setSelectedItinerary(item);
    setIsModalOpen(true);
  };

  const handleAddAllToItinerary = async () => {
    setIsDateModalOpen(true);
  };

  const handleSaveItinerary = async (data: ItineraryCreationData) => {
    if (!tripId) return;
    try {
      const newItineraryItem = await addItinerary(tripId, data);
      addItineraryItem(newItineraryItem);
      setIsModalOpen(false);
      alert("Activity added to itinerary!");
    } catch (error) {
      console.error("Failed to add itinerary item:", error);
      alert("Failed to add activity. Please try again.");
    }
  };

  const handleSaveAllItineraries = async (date: Date) => {
    if (!tripId || !chat?.ai_recommendations) return;

    try {
      const dateString = formatDateForInput(date);
      if (!dateString) {
        alert("Invalid date selected.");
        return;
      }

      for (const item of chat.ai_recommendations) {
        const startTimeObj = new Date(item.start_time);
        const endTimeObj = new Date(item.end_time);

        const startTimeString = `${String(startTimeObj.getUTCHours()).padStart(
          2,
          "0",
        )}:${String(startTimeObj.getUTCMinutes()).padStart(
          2,
          "0",
        )}:${String(startTimeObj.getUTCSeconds()).padStart(2, "0")}`;
        const endTimeString = `${String(endTimeObj.getUTCHours()).padStart(
          2,
          "0",
        )}:${String(endTimeObj.getUTCMinutes()).padStart(2, "0")}:${String(
          endTimeObj.getUTCSeconds(),
        ).padStart(2, "0")}`;

        const newStartTime = new Date(`${dateString}T${startTimeString}Z`);
        const newEndTime = new Date(`${dateString}T${endTimeString}Z`);

        const newItem = {
          ...item,
          start_time: newStartTime,
          end_time: newEndTime,
        };
        const newItineraryItem = await addItinerary(tripId, newItem);
        addItineraryItem(newItineraryItem);
      }
      setIsDateModalOpen(false);
      alert("All recommended activities have been added to your itinerary!");
    } catch (error) {
      console.error("Failed to add all itinerary items:", error);
      alert(
        "Failed to add all activities. Please check the console for details.",
      );
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
        trip.country,
      );
      setChat(updatedChat);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return undefined;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
            } catch (e) {}
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
                      <button
                        className="btn btn-secondary btn-sm mb-2"
                        onClick={handleAddAllToItinerary}
                      >
                        Add All to Itinerary
                      </button>
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
      <ItineraryModal
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        onSave={handleSaveItinerary}
        itinerary={selectedItinerary}
        tripStartDate={formatDateForInput(trip?.start_date)}
        tripEndDate={formatDateForInput(trip?.end_date)}
      />
      <DateSelectionModal
        show={isDateModalOpen}
        onHide={() => setIsDateModalOpen(false)}
        onSave={handleSaveAllItineraries}
        minDate={formatDateForInput(trip?.start_date)}
        maxDate={formatDateForInput(trip?.end_date)}
      />
    </div>
  );
}
