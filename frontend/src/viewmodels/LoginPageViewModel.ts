import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useUser } from "../models/UserContext";
import { getUserByEmail } from "../models/api";

export function LoginPageViewModel() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleGoogleLogin = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    const decoded: { email: string; name?: string } =
      jwtDecode(credentialResponse.credential);

    const existingUser = await getUserByEmail(decoded.email);

    if (existingUser) {
      setUser(existingUser);
      navigate("/Home");
    } else {
      localStorage.setItem("pendingEmail", decoded.email);
      navigate("/Setup");
    }
  };

  return {
    handleGoogleLogin,
  };
}
