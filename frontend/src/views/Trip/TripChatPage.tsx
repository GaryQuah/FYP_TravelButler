import { useState } from "react";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
}

export function TripChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Alice",
      text: "Hey! Are we meeting at the airport?",
      time: "10:00",
    },
    {
      id: 2,
      sender: "You",
      text: "Yes, 7am should be fine.",
      time: "10:02",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "You",
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="d-flex flex-column">
      <h2>Trip Chat</h2>

      {/* Chat messages */}
      <div
        className="flex-grow-1 border rounded p-3 mb-3 overflow-auto"
        style={{ maxHeight: "60vh" }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 d-flex ${
              msg.sender === "You"
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className={`p-2 rounded ${
                msg.sender === "You"
                  ? "bg-primary text-white"
                  : "bg-light border"
              }`}
              style={{ maxWidth: "60%" }}
            >
              <div className="small fw-bold">{msg.sender}</div>
              <div>{msg.text}</div>
              <div className="text-end small opacity-75">{msg.time}</div>
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
