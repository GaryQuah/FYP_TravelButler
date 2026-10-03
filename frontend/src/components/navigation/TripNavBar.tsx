import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTripDetails } from "../../hooks/useTripDetails";
import { useItineraries } from "../../hooks/UseItineraries";
import "../../assets/css/TripNavBar.css";

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
  const { trip } = useTripDetails();
  const { itineraries } = useItineraries(tripId, trip?.itinerary_ids);

  const handleDateNavigation = (dateString: string) => {
    navigate(`/trip/${tripId}/itinerary#${dateString}`);
  };

  const itineraryDates = itineraries
    ? [
        ...new Set(itineraries.map((item) => item.start_time.split("T")[0])),
      ].sort()
    : [];

  return (
    <aside className="trip-sidebar">
      <div className="trip-sidebar-links">
        {navItems.map((item) => (
          <div key={item.path}>
            <button
              onClick={() => navigate(`/trip/${tripId}/${item.path}`)}
              className={`trip-nav-btn ${
                location.pathname.endsWith(item.path) ? "active" : ""
              }`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
            {item.path === "itinerary" &&
              location.pathname.endsWith("itinerary") && (
                <div className="sub-nav">
                  {itineraryDates.map((dateString) => (
                    <button
                      key={dateString}
                      onClick={() => handleDateNavigation(dateString)}
                      className="sub-nav-btn"
                    >
                      {new Date(dateString + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default TripNavbar;
