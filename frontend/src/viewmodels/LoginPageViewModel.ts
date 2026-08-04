import { useNavigate } from "react-router-dom";
import { useUser } from "../models/UserContext";
import { loginOrRegisterUser } from "../api";
import { useEffect, useState } from "react";

export function LoginPageViewModel() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [lastUserName, setLastUserName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("lastUserName");
    if (name) {
      setLastUserName(name);
    }
  }, []);

  /*
  Receives the response from Google One Tap login, decodes the JWT to extract user information, and then calls the API to login or register the user.
  */
  const handleGoogleLogin = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    const loginResponse = await loginOrRegisterUser(credentialResponse.credential);

    if (loginResponse) {
      localStorage.setItem("user", JSON.stringify(loginResponse.user));
      localStorage.setItem("lastUserName", loginResponse.user.name);
      setUser(loginResponse.user);
      navigate("/Home");
    } else {
      // Handle error case where user is null
      console.error("Login failed: no user data returned");
    }
  };

  return {
    handleGoogleLogin,
    lastUserName,
  };
}