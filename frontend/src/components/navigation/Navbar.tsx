// The main navigation bar at the top of the page. It allows users to navigate between different pages of the application, such as home and AI suggestions.
import React from "react";
import "./Navbar.css";
import { useUser } from "../../models/UserContext";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/home" },
  { label: "AI Suggestions", path: "/suggestions" },
  { label: "Settings", path: "/settings" },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="py-2 mb-3 border-bottom">
      <nav className="d-flex align-items-center">
        <div className="ms-3">
          <span>Welcome, {user?.name}</span>
        </div>

        <div className="d-flex gap-2 mx-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`nav-btn btn btn-link text-decoration-none ${
                location.pathname === item.path
                  ? "fw-bold text-dark"
                  : "text-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="me-3" style={{ width: "120px" }} />
      </nav>
    </div>
  );
};

export default Navbar;
