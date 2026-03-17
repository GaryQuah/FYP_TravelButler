import { useNavigate, useLocation, useParams } from "react-router-dom";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Itinerary", path: "itinerary" },
  { label: "Budget", path: "budget" },
  { label: "Trip Chat", path: "chat" },
  { label: "Polls", path: "poll" },
];

const TripNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId } = useParams();

  return (
    <div
      className="d-flex flex-column p-3 border-end"
      style={{ width: "220px", height: "100vh" }}
    >
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(`/trip/${tripId}/${item.path}`)}
          className={`btn text-start mb-2 ${
            location.pathname.endsWith(item.path)
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
