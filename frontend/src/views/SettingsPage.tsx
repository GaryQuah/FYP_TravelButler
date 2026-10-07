import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  getGoogleCalendarStatus,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
} from "../api";
import Navbar from "../components/navigation/Navbar";

export function SettingsPage() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkGoogleCalendarStatus();
  }, []);

  const checkGoogleCalendarStatus = async () => {
    try {
      const status = await getGoogleCalendarStatus();
      setGoogleConnected(status.connected);
    } catch (err) {
      setError("Failed to check Google Calendar status");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSuccess = async (codeResponse: { code: string }) => {
    try {
      setError(null);
      setSuccess(null);
      await connectGoogleCalendar(codeResponse);
      setGoogleConnected(true);
      setSuccess("Google Calendar connected successfully!");
    } catch (err: any) {
      setError(
        `Failed to connect Google Calendar: ${
          err?.response?.data?.detail || err?.message || JSON.stringify(err)
        }`,
      );
    }
  };

  const handleDisconnect = async () => {
    try {
      setError(null);
      setSuccess(null);
      await disconnectGoogleCalendar();
      setGoogleConnected(false);
      setSuccess("Google Calendar disconnected successfully!");
    } catch (err) {
      setError("Failed to disconnect Google Calendar");
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
      setError("Google login failed");
    },
  });

  if (loading) {
    return <div className="container mt-5">Loading settings...</div>;
  }

  return (
    <div>
      <Navbar />

      <div className="container mt-5">
        <h1>Settings</h1>
        <hr />

        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Google Calendar Integration</h5>
            <p className="card-text">
              Connect your Google Calendar to export trip itineraries directly
              to your calendar.
            </p>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

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
