import { GoogleLogin } from "@react-oauth/google";
import WelcomeTypewriter from "../components/WelcomeTypewriter";
import { LoginPageViewModel } from "../viewmodels/LoginPageViewModel";
import "../assets/css/LoginPage.css";
import backgroundImage from "../assets/images/loginpage/background.jpg";

export function LoginPage() {
  const { handleGoogleLogin, lastUserName } = LoginPageViewModel();

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
                  <h6>AI Assited Itinerary Planning</h6>
                  <p>
                    Not sure what to do? Let our AI assistant suggest activities
                    for you to pick from.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi-filetype-doc"></i>
                </div>

                <div>
                  <h6>Document hub</h6>
                  <p>
                    Store and access your documents such as passports, visa and
                    plane tickets easily.
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
