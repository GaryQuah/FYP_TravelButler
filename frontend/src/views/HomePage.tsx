import { useState } from "react";
import Navbar from "../components/navigation/Navbar";
import Card from "../components/cards/TripCard";
import AddTripModal from "../components/modals/AddTripModal";
import { type Trip as ApiTrip } from "../models";
import { useTrips } from "../hooks/UseTrip";
import { useUser } from "../models/UserContext";
import "../assets/css/LoginPage.css";
import { useAvailabilityTrackers } from "../hooks/useAvailabilityTrackers";
import AvailabilityTrackerCard from "../components/cards/AvailabilityTrackerCard";
import AvailabilityTrackerModal from "../components/modals/AvailabilityTrackerModal";

export function HomePage() {
  const {
    trips,
    createNewTrip,
    deleteTrip,
    loading: tripsLoading,
  } = useTrips();
  const {
    trackers,
    loading: trackersLoading,
    refetchTrackers,
  } = useAvailabilityTrackers();
  const { user } = useUser();
  const [showTripModal, setShowTripModal] = useState(false);
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  // Set to "trips" by default, so the Trip Cards tab is active when the page loads, optionally set to "availability"
  const [activeTab, setActiveTab] = useState("trips");

  const handleCreateTracker = async (trackerData: { name: string }) => {
    if (!user) {
      alert("You must be logged in to create a tracker.");
      return;
    }

    try {
      const response = await fetch("/api/availability-trackers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.user_id,
        },
        body: JSON.stringify({
          name: trackerData.name,
          user_ids: [user.user_id],
        }),
      });

      if (response.ok) {
        alert("Availability tracker created successfully");
        refetchTrackers(); // Refetch trackers to show the new one
        setShowTrackerModal(false);
      } else {
        alert("Failed to create availability tracker");
        setShowTrackerModal(false);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An error occurred while creating the tracker.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        {/*Main text section */}
        <div className="p-4 p-md-5 mb-4 text-white rounded bg-dark">
          <div className="col-md-6 px-0">
            <h1 className="display-5 fst-italic">Welcome to TravelMate</h1>
            <p className="lead my-3">
              Plan, collaborate with friends, and explore smarter ✈️
            </p>
            <button
              className="btn btn-primary me-2"
              onClick={() => setShowTripModal(true)}
            >
              Add Trip
            </button>
            <button
              className="btn btn-primary me-2"
              onClick={() => setShowTrackerModal(true)}
            >
              Add Availability Tracker
            </button>

            {showTripModal && (
              <AddTripModal
                onClose={() => setShowTripModal(false)}
                onSave={async (tripData) => {
                  if (
                    user?.user_id &&
                    tripData.start_date &&
                    tripData.end_date
                  ) {
                    await createNewTrip(tripData, [user.user_id]);
                    setShowTripModal(false);
                  } else {
                    console.error(
                      "No user ID found or dates are not selected.",
                    );
                  }
                }}
              />
            )}

            {showTrackerModal && (
              <AvailabilityTrackerModal
                onClose={() => setShowTrackerModal(false)}
                onSave={handleCreateTracker}
              />
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === "trips" ? "active" : ""}`}
              onClick={() => setActiveTab("trips")}
              href="#"
            >
              Trip Cards
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link ${
                activeTab === "availability" ? "active" : ""
              }`}
              onClick={() => setActiveTab("availability")}
              href="#"
            >
              Availability Cards
            </a>
          </li>
        </ul>

        <div className="tab-content mt-3">
          {activeTab === "trips" && (
            <div className="row mb-4">
              {tripsLoading ? (
                <p>Loading trips...</p>
              ) : (
                trips.map((trip: ApiTrip) => (
                  <div key={trip.trip_id} className="col-md-6">
                    <Card trip={trip} onDelete={deleteTrip} />
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === "availability" && (
            <div className="row mb-4">
              {trackersLoading ? (
                <p>Loading availability trackers...</p>
              ) : (
                trackers.map((tracker) => (
                  <div key={tracker.id} className="col-md-6">
                    <AvailabilityTrackerCard tracker={tracker} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center border-top mt-5">
        <a href="#">Back to top</a>
      </footer>
    </>
  );
}
