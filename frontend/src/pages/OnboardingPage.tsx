import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function OnboardingPage() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!name.trim()) return;

    // Store name (pick one)
    localStorage.setItem("displayName", name);
    // or send to backend
    // or store in global context

    navigate("/home");
  };

  return (
    <div className="onboarding-container">
      <h1>Welcome!</h1>
      <p>What should we call you?</p>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleContinue}>Continue</button>
    </div>
  );
}
