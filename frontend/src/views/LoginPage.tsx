import { GoogleLogin } from "@react-oauth/google";
import { LoginPageViewModel } from "../viewmodels/LoginPageViewModel";

export function LoginPage() {
  const { handleGoogleLogin, handleGuestLogin } = LoginPageViewModel();

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center">
      <div className="text-center p-4 shadow rounded bg-white">
        <h1 className="mb-3">Welcome to TravelMate</h1>
        <p className="mb-4">Sign in with Google, or continue as a guest</p>

        <div className="d-flex justify-content-center mb-3">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.log("Login Failed");
            }}
            auto_select={false}
          />
        </div>

        <button
          className="btn btn-outline-primary w-100"
          onClick={handleGuestLogin}
        >
          Continue as a Guest
        </button>
      </div>
    </div>
  );
}
