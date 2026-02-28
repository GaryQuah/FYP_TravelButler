import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useUser } from "../models/UserContext";
import { loginOrRegisterUser } from "../models/api";

export function LoginPageViewModel() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleGoogleLogin = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    const decoded: { email: string; name?: string } =
      jwtDecode(credentialResponse.credential);

    const user = await loginOrRegisterUser(decoded.email, decoded.name);

    if (user && user.name) {
      setUser(user);
      navigate("/Home");
    } else {
      // Handle error case where user is null
      console.error("Login failed: no user data returned");
    }
  };

  return {
    handleGoogleLogin,
  };
}