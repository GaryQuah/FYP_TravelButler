import { useState, useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { useTripDetails } from "../../hooks/useTripDetails";
import { useUser } from "../../models/UserContext";
import { MiniItineraryCard } from "../../components/cards/MiniItineraryCard";
import { formatTime } from "../../utils/dateUtils";
import { ItineraryModal } from "../../components/modals/ItineraryModal";
import { DateSelectionModal } from "../../components/modals/DateSelectionModal";
import "../../assets/css/TripAssistancePage.css";

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
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  useEffect(() => {
    if (trip?.ai_chat_id) {
      getAIChat(trip.ai_chat_id)
        .then((chat) => {
          setChat(chat);
          if (chat.ai_recommendations) {
            console.log(
              "Initial AI Recommendations on load:",
              chat.ai_recommendations,
            );
          }
        })
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
      setAlert({ message: "Activity added to itinerary!", type: "success" });
    } catch (error) {
      console.error("Failed to add itinerary item:", error);
      setAlert({
        message: "Failed to add activity. Please try again.",
        type: "danger",
      });
    }
  };

  const handleSaveAllItineraries = async (date: Date) => {
    if (!tripId || !chat?.ai_recommendations) return;

    try {
      const dateString = formatDateForInput(date);
      if (!dateString) {
        setAlert({ message: "Invalid date selected.", type: "danger" });
        return;
      }

      const formatTimeFromString = (dateTimeString: string): string => {
        const timePart = dateTimeString.split("T")[1];
        if (timePart) {
          const [hours, minutes] = timePart.split(":");
          return `${hours}:${minutes}`;
        }
        return ""; // Fallback
      };

      const itineraryPromises = chat.ai_recommendations.map((item) => {
        const startTime = formatTimeFromString(item.start_time);
        const endTime = formatTimeFromString(item.end_time);

        const newItem = {
          ...item,
          start_time: `${dateString}T${startTime}`,
          end_time: `${dateString}T${endTime}`,
        };
        return addItinerary(tripId, newItem);
      });

      const newItineraryItems = await Promise.all(itineraryPromises);
      newItineraryItems.forEach(addItineraryItem);

      setIsDateModalOpen(false);
      setAlert({
        message:
          "All recommended activities have been added to your itinerary!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to add all itinerary items:", error);
      setAlert({
        message:
          "Failed to add all activities. Please check the console for details.",
        type: "danger",
      });
    }
  };

  const sendMessage = async () => {
    console.log("Send button clicked, sendMessage function started...");
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
      if (updatedChat.ai_recommendations) {
        console.log(
          "Newly received AI Recommendations:",
          updatedChat.ai_recommendations,
        );
      }
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
      {alert && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show`}
          role="alert"
        >
          {alert.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlert(null)}
          ></button>
        </div>
      )}
      <h2>AI Assisted Chat</h2>

      {/* Chat messages */}
      <div className="flex-grow-1 border rounded p-3 mb-3 overflow-auto chat-container">
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
                className={`p-2 rounded chat-bubble ${
                  msg.user_id === "assistant"
                    ? "bg-light border"
                    : "bg-primary text-white"
                }`}
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
            <div className="p-2 rounded bg-light border chat-bubble">
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
