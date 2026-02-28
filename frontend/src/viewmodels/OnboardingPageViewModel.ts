/*
Initial plan was to have an onboarding page to allow user to set their username, but for now we extract if from google one tap login response, 
so this page is not used. We can decide later if we want to bring it back for users to customize their username after login.
TODO: decide if we want to bring back the onboarding page for users to customize their username after login, or if we are fine with just using the name from google one tap login response.
*/
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