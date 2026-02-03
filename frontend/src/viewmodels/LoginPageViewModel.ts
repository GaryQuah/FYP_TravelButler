import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useUser } from "../models/UserContext";
import { getUserByEmail, createUser } from "../models/api";

export function LoginPageViewModel() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleGoogleLogin = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const email = decoded.email;
      console.log(decoded);

      // Check if user exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        setUser(existingUser);
        navigate("/Home");
      } else {
        // Store email for onboarding
        localStorage.setItem("pendingEmail", email);
        navigate("/Setup");
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      const user = await createUser("guest", "guest@guest.com");
      setUser(user);
      navigate("/Home");
    } catch (error) {
      console.error("Failed to create guest user:", error);
      // Maybe show error
    }
  };

  return {
    handleGoogleLogin,
    handleGuestLogin,
  };
}