import { useState } from "react";
import "../assets/css/LoginPage.css";

type LoginPageProps = {
  onLogin: (email: string) => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [hasSelectedLoginMethod, setHasSelectedLoginMethod] = useState<
    boolean | null
  >(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="login-container">
      <h1 className="title">Welcome to TravelMate</h1>

      {hasSelectedLoginMethod === null && (
        <div className="login-selection-method">
          <button
            onClick={() => {
              setHasAccount(false);
              setHasSelectedLoginMethod(true);
            }}
          >
            Sign in
          </button>
          <button
            onClick={() => {
              setHasAccount(true);
              setHasSelectedLoginMethod(true);
            }}
          >
            Log in
          </button>
        </div>
      )}

      {hasAccount !== null && (
        <form onSubmit={handleSubmit} className="login-form">
          <label className="text">
            <span className="label-text">Email:</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="text">
            <span className="label-text">Password:</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">{hasAccount ? "Log in" : "Sign Up"}</button>
        </form>
      )}
      {hasSelectedLoginMethod !== null && (
        <button
          className="toggle-login-method"
          onClick={() => setHasAccount(!hasAccount)}
        >
          {hasAccount ? "Switch to Sign Up" : "Switch to Log In"}
        </button>
      )}
    </div>
  );
}
