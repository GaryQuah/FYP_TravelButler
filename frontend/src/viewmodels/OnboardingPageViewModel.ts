import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../models/UserContext";
import { createUser } from "../models/api";

export function OnboardingPageViewModel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pendingEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, []);

  const handleContinue = async () => {
    if (!name.trim()) return;

    try {
      const user = await createUser(name, email);
      setUser(user);
      localStorage.removeItem("pendingEmail");
      navigate("/Home");
    } catch (error) {
      console.error("Failed to create user:", error);
      // Maybe show error
    }
  };

  return {
    name,
    setName,
    handleContinue,
  };
}