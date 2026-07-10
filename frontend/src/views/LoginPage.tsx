import { GoogleLogin } from "@react-oauth/google";
import { LoginPageViewModel } from "../viewmodels/LoginPageViewModel";
import "../assets/css/LoginPage.css";
import backgroundImage from "../assets/login/background.jpg";

export function LoginPage() {
  const { handleGoogleLogin } = LoginPageViewModel();

  return (
    <div className="login-page">
      {/* ================= LEFT ================= */}
      <div className="login-left">
        <img
          src={backgroundImage}
          alt="Travel Background"
          className="login-background-image"
        />

        <div className="login-overlay"></div>

        <div className="container h-100">
          <div className="row h-100 align-items-center">
            <div className="col-lg-9">
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

                {/* Description */}
                <p className="hero-description">
                  TravelMate is an AI-powered collaborative travel planner
                  designed for groups. Build itineraries, manage budgets,
                  organize activities and make travelling together effortless.
                </p>

                <div className="hero-divider"></div>

                <p className="hero-subtitle">
                  Everything your group needs in one place.
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
            <h2 className="fw-bold">Welcome Back</h2>

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
            {/* Budget */}
            <div className="col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-wallet2"></i>
                </div>

                <div>
                  <h6>Budget Tracking</h6>
                  <p>Track expenses and split costs fairly.</p>
                </div>
              </div>
            </div>

            {/* Receipt */}
            <div className="col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-receipt"></i>
                </div>

                <div>
                  <h6>Receipt Scanner</h6>
                  <p>Upload receipts and organize spending automatically.</p>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-calendar-event"></i>
                </div>

                <div>
                  <h6>Calendar Sync</h6>
                  <p>Export activities directly into Google Calendar.</p>
                </div>
              </div>
            </div>

            {/* Polls */}
            <div className="col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-chat-dots-fill"></i>
                </div>

                <div>
                  <h6>Group Communication</h6>
                  <p>Chat in real time, vote on activities using polls</p>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-clock-history"></i>
                </div>

                <div>
                  <h6>Availability Tracking</h6>
                  <p>
                    Find common dates with your group members for hassle-free
                    planning.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-lightbulb"></i>
                </div>

                <div>
                  <h6>AI Assisted Planning</h6>
                  <p>
                    Automatically extract information from your itinerary such
                    as budget
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-geo-alt"></i>
                </div>

                <div>
                  <h6>Placeholder</h6>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-geo-alt"></i>
                </div>

                <div>
                  <h6>Placeholder</h6>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
