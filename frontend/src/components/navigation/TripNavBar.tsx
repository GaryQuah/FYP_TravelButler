import { useNavigate, useLocation, useParams } from "react-router-dom";
import "../../assets/css/TripNavbar.css";

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  {
    label: "Itinerary",
    path: "itinerary",
    icon: "bi-map",
  },
  {
    label: "Budget",
    path: "budget",
    icon: "bi-wallet2",
  },
  {
    label: "Trip Chat",
    path: "chat",
    icon: "bi-chat-dots-fill",
  },
  {
    label: "Polls",
    path: "poll",
    icon: "bi-bar-chart-fill",
  },
  {
    label: "Assistance",
    path: "assistance",
    icon: "bi-question-circle-fill",
  },
  {
    label: "Documents",
    path: "documents",
    icon: "bi-filetype-doc",
  },
];

const TripNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId } = useParams();

  return (
    <aside className="trip-sidebar">
      <div className="trip-sidebar-links">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(`/trip/${tripId}/${item.path}`)}
            className={`trip-nav-btn ${
              location.pathname.endsWith(item.path) ? "active" : ""
            }`}
          >
            <i className={`bi ${item.icon}`}></i>

            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default TripNavbar;
