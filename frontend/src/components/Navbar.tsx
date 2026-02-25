import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../models/UserContext";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/home" },
  { label: "Add trip", path: "/trips" },
  { label: "AI Suggestions", path: "/suggestions" },
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
      <nav className="nav d-flex justify-content-between align-items-center flex-wrap">
        <div>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`btn btn-link text-decoration-none ${
                location.pathname === item.path
                  ? "fw-bold text-dark"
                  : "text-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="me-3">
          <span>Welcome, {user?.name}</span>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
