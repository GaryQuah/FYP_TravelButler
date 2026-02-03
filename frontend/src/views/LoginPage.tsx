import { GoogleLogin } from "@react-oauth/google";
import { LoginPageViewModel } from "../viewmodels/LoginPageViewModel";
import "../assets/css/LoginPage.css";

export function LoginPage() {
  const { handleGoogleLogin, handleGuestLogin } = LoginPageViewModel();

  return (
    <div className="login-container">
      <h1 className="title">Welcome to TravelMate</h1>
      <h1 className="title">Sign in with Google, or continue as a guest</h1>

      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => {
          console.log("Login Failed");
        }}
        auto_select={false}
      />

      <button onClick={handleGuestLogin}>Continue as a Guest</button>
    </div>
  );
}
