import LoadingOverlay from "../components/LoadingOverlay";
import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  getGoogleCalendarStatus,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
} from "../api";
import { updateUsername } from "../api/user";
import Navbar from "../components/navigation/Navbar";
import { useUser } from "../contexts/UserContext";

export function SettingsPage() {
  const { user, setUser } = useUser();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarSuccess, setCalendarSuccess] = useState<string | null>(null);
  const [username, setUsername] = useState(user?.name || "");

  useEffect(() => {
    checkGoogleCalendarStatus();
  }, []);

  const checkGoogleCalendarStatus = async () => {
    try {
      const status = await getGoogleCalendarStatus();
      setGoogleConnected(status.connected);
    } catch (err) {
      setCalendarError("Failed to check Google Calendar status");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSuccess = async (codeResponse: { code: string }) => {
    try {
      setCalendarError(null);
      setCalendarSuccess(null);
      await connectGoogleCalendar(codeResponse);
      setGoogleConnected(true);
      setCalendarSuccess("Google Calendar connected successfully!");
    } catch (err: any) {
      setCalendarError(
        `Failed to connect Google Calendar: ${
          err?.response?.data?.detail || err?.message || JSON.stringify(err)
        }`,
      );
    }
  };

  const handleDisconnect = async () => {
    try {
      setCalendarError(null);
      setCalendarSuccess(null);
      await disconnectGoogleCalendar();
      setGoogleConnected(false);
      setCalendarSuccess("Google Calendar disconnected successfully!");
    } catch (err) {
      setCalendarError("Failed to disconnect Google Calendar");
    }
  };

  const handleUpdateUsername = async () => {
    if (!username) {
      setAccountError("Username cannot be empty");
      return;
    }

    try {
      setAccountError(null);
      setAccountSuccess(null);
      const updatedUser = await updateUsername(username);
      setUser(updatedUser);
      setAccountSuccess("Username updated successfully!");
    } catch (err) {
      setAccountError("Failed to update username");
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",

    onSuccess: (codeResponse) => {
      handleConnectSuccess({
        code: codeResponse.code,
      });
    },

    onError: (error) => {
      console.error(error);
      setCalendarError("Google login failed");
    },
  });

  return (
    <div>
      <LoadingOverlay show={loading} />
      <Navbar />

      <div className="container mt-5">
        <h1>Settings</h1>
        <hr />

        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Account Settings</h5>
            {accountError && (
              <div className="alert alert-danger">{accountError}</div>
            )}
            {accountSuccess && (
              <div className="alert alert-success">{accountSuccess}</div>
            )}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleUpdateUsername}>
              Update Username
            </button>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Google Calendar Integration</h5>
            <p className="card-text">
              Connect your Google Calendar to export trip itineraries directly
              to your calendar.
            </p>

            {calendarError && (
              <div className="alert alert-danger">{calendarError}</div>
            )}
            {calendarSuccess && (
              <div className="alert alert-success">{calendarSuccess}</div>
            )}

            {googleConnected ? (
              <div>
                <span className="badge bg-success mb-3">Connected</span>
                <br />
                <button className="btn btn-danger" onClick={handleDisconnect}>
                  Disconnect Google Calendar
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => googleLogin()}>
                Connect Google Calendar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
