import { GoogleLogin } from "@react-oauth/google";
import { LoginPageViewModel } from "../viewmodels/LoginPageViewModel";
import "../assets/css/LoginPage.css";

export function LoginPage() {
  const { handleGoogleLogin } = LoginPageViewModel();

  return (
    <div className="login-gradient-bg">
      <div className="login-card">
        <h1 className="mb-3">Welcome to TravelMate</h1>
        <p className="mb-4">Sign in with Google, or continue as a guest</p>

        <div className="d-flex justify-content-center mb-3">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => console.log("Login Failed")}
            auto_select={false}
          />
        </div>
      </div>
    </div>
  );
}
