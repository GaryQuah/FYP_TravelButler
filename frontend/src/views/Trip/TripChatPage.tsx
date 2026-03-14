import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTripDetails } from "../../hooks/useTripDetails";
import { useUser } from "../../models/UserContext";
import { addChatMessage } from "../../models/api";

interface Message {
  user_id: string;
  message: string;
  timestamp: string;
}

export function TripChatPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, setTripDetails } = useTripDetails(tripId!);
  const { user } = useUser();
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim() || !trip || !user) return;

    try {
      const updatedTrip = await addChatMessage(
        trip.trip_id,
        user.user_id,
        input,
      );
      setTripDetails(updatedTrip);
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="d-flex flex-column">
      <h2>Trip Chat</h2>

      {/* Chat messages */}
      <div
        className="flex-grow-1 border rounded p-3 mb-3 overflow-auto"
        style={{ maxHeight: "60vh" }}
      >
        {trip?.chat.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 d-flex ${
              msg.user_id === user?.user_id
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className={`p-2 rounded ${
                msg.user_id === user?.user_id
                  ? "bg-primary text-white"
                  : "bg-light border"
              }`}
              style={{ maxWidth: "60%" }}
            >
              <div className="small fw-bold">{msg.user_id}</div>
              <div>{msg.message}</div>
              <div className="text-end small opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
