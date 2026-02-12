import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/home" },
  { label: "My trips", path: "/trips" },
  { label: "AI Suggestions", path: "/suggestions" },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="py-2 mb-3 border-bottom">
      <nav className="nav d-flex justify-content-between flex-wrap">
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
      </nav>
    </div>
  );
};

export default Navbar;
