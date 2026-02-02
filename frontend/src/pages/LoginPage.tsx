import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import "../assets/css/LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <h1 className="title">Welcome to TravelMate</h1>
      <h1 className="title">Sign in with Google, or continue as a guest</h1>

      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            console.log(jwtDecode(credentialResponse.credential));
            navigate("/home");
            // Add logic to store data here
          }
        }}
        onError={() => {
          console.log("Login Failed");
        }}
        auto_select={false}
      />

      <button
        onClick={() => {
          navigate("/Setup");
        }}
      >
        Continue as a Guest
      </button>
    </div>
  );
}
