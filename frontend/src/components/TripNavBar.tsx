import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Itinerary", path: "/" },
  { label: "Budget", path: "/" },
];

const TripNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="d-flex flex-column p-3 border-end"
      style={{ width: "220px", height: "100vh" }}
    >
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`btn text-start mb-2 ${
            location.pathname === item.path
              ? "fw-bold btn-dark"
              : "btn-outline-secondary"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default TripNavbar;
