import React from "react";
import "../../assets/css/Navbar.css";
import { useUser } from "../../contexts/UserContext.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import WelcomeTypewriter from "../WelcomeTypewriter.tsx";
import { logoutUser } from "../../api/user";

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    path: "/home",
    icon: "bi-house-door-fill",
  },
  // {
  //   label: "AI Suggestions",
  //   path: "/suggestions",
  //   icon: "bi-stars",
  // },
  {
    label: "Settings",
    path: "/settings",
    icon: "bi-gear-fill",
  },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useUser();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      navigate("/");
    }
  };

  return (
    <header className="navbar-container">
      <nav className="container-fluid px-5 d-flex align-items-center justify-content-between">
        {/* Left */}
        <div className="navbar-brand-custom">
          <i className="bi bi-airplane-engines-fill"></i>

          <span>TravelMate</span>
        </div>

        {/* Centre */}
        <div className="navbar-links">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-btn ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <i className={`bi ${item.icon} me-2`}></i>

              {item.label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="welcome-section">
          <div className="welcome-text">
            <WelcomeTypewriter />
          </div>

          <div className="welcome-name">{user?.name}</div>
          <button
            className="btn btn-outline-light btn-sm ms-3"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
