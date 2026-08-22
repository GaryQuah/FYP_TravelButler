import { GoogleLogin } from "@react-oauth/google";
import WelcomeTypewriter from "../components/WelcomeTypewriter";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { loginOrRegisterUser } from "../api";
import { useEffect, useState } from "react";
import "../assets/css/LoginPage.css";
import backgroundImage from "../assets/images/loginpage/background.jpg";
import FeatureCard from "../components/cards/FeatureCard";

const features = [
  {
    icon: "bi-clock-history",
    title: "Availability Tracking",
    description:
      "Find common dates with your group members for hassle-free planning.",
  },
  {
    icon: "bi-wallet2",
    title: "Budget Tracking",
    description:
      "Track expenses and split costs fairly. Upload receipts and organize spending automatically.",
  },
  {
    icon: "bi-lightbulb",
    title: "AI Assisted Itinerary Planning",
    description:
      "Not sure what to do? Let our AI assistant suggest activities for you to pick from.",
  },
  {
    icon: "bi-calendar-event",
    title: "Calendar Sync",
    description: "Export activities directly into Google Calendar.",
  },
  {
    icon: "bi-chat-dots-fill",
    title: "Group Communication",
    description: "Chat in real time, vote on activities using polls",
  },

  {
    icon: "bi-filetype-doc",
    title: "Document hub",
    description:
      "Store and access your documents such as passports, visa and plane tickets easily.",
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [lastUserName, setLastUserName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("lastUserName");
    if (name) {
      setLastUserName(name);
    }
  }, []);

  /*
  Receives the response from Google One Tap login, decodes the JWT to extract user information, and then calls the API to login or register the user.
  */
  const handleGoogleLogin = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;

    const loginResponse = await loginOrRegisterUser(
      credentialResponse.credential,
    );

    if (loginResponse) {
      localStorage.setItem("user", JSON.stringify(loginResponse.user));
      localStorage.setItem("lastUserName", loginResponse.user.name);
      setUser(loginResponse.user);
      navigate("/Home");
    } else {
      // Handle error case where user is null
      console.error("Login failed: no user data returned");
    }
  };

  return (
    <div className="login-page">
      {/* Left Region*/}
      <div className="login-left">
        <img
          src={backgroundImage}
          alt="Travel Background"
          className="login-background-image"
        />

        <div className="login-overlay"></div>

        <div className="container pt-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              <div className="hero-content">
                {/* Logo */}
                <div className="d-flex align-items-center mb-4">
                  <i className="bi bi-airplane-engines-fill hero-logo me-3"></i>

                  <h1 className="fw-bold text-white mb-0">TravelMate</h1>
                </div>

                {/* Hero Heading */}
                <div className="hero-title mb-4">
                  <h1 className="display-4 fw-bold mb-0">
                    Plan <span className="gradient-text">smarter,</span>
                  </h1>

                  <h1 className="display-4 fw-bold">
                    Travel <span className="gradient-text">together.</span>
                  </h1>
                </div>
                <div className="hero-divider"></div>
                {/* Description */}
                <p className="hero-description">
                  TravelMate is an AI-powered collaborative travel planner
                  designed for groups. Build itineraries, manage budgets,
                  organize activities and make travelling together effortless.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="login-right">
        {/* Login Card */}
        <div className="login-card">
          <div className="text-center">
            <h2 className="fw-bold">
              <WelcomeTypewriter />
              {lastUserName ? `, ${lastUserName}` : ""}
            </h2>

            <p className="text-muted mb-4">
              Sign in to continue planning your next adventure.
            </p>
          </div>

          <div className="d-flex justify-content-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => console.log("Login Failed")}
              auto_select={false}
            />
          </div>
        </div>

        {/* Feature Section */}
        <div className="features-section">
          <div className="row g-3">
            {features.map((feature, index) => (
              <div className="col-md-6" key={index}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
