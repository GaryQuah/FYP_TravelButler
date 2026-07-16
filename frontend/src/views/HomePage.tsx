import { useState } from "react";
import Navbar from "../components/navigation/Navbar";
import Card from "../components/cards/TripCard";
import AddTripModal from "../components/modals/AddTripModal";
import {
  type Trip as ApiTrip,
  type AvailabilityTracker,
  type TripCreationData,
} from "../models";
import { useTrips } from "../hooks/UseTrip";
import { useUser } from "../models/UserContext";
import { useAvailabilityTrackers } from "../hooks/useAvailabilityTrackers";
import AvailabilityTrackerCard from "../components/cards/AvailabilityTrackerCard";
import AvailabilityTrackerModal from "../components/modals/AvailabilityTrackerModal";
import "../assets/css/HomePage.css";
import homeBanner from "../assets/images/dashboard/sunset.jpg";

export function HomePage() {
  const {
    trips,
    createNewTrip,
    deleteTrip,
    updateTrip,
    loading: tripsLoading,
  } = useTrips();
  const {
    trackers,
    loading: trackersLoading,
    refetchTrackers,
    deleteTracker,
    updateTracker,
  } = useAvailabilityTrackers();
  const { user } = useUser();
  const [showTripModal, setShowTripModal] = useState(false);
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [activeTab, setActiveTab] = useState("trips");
  const [editingTrip, setEditingTrip] = useState<ApiTrip | null>(null);
  const [editingTracker, setEditingTracker] =
    useState<AvailabilityTracker | null>(null);

  const handleEditTrip = (trip: ApiTrip) => {
    setEditingTrip(trip);
    setShowTripModal(true);
  };

  const handleUpdateTrip = async (tripData: Partial<TripCreationData>) => {
    if (!editingTrip) return;
    await updateTrip(editingTrip.trip_id, tripData);
    setShowTripModal(false);
    setEditingTrip(null);
  };

  const handleEditTracker = (tracker: AvailabilityTracker) => {
    setEditingTracker(tracker);
    setShowTrackerModal(true);
  };

  const handleUpdateTracker = async (
    trackerData: { name: string },
    trackerId?: string,
  ) => {
    if (!trackerId) return;
    await updateTracker(trackerId, trackerData);
    setShowTrackerModal(false);
    setEditingTracker(null);
  };

  const handleDeleteTracker = async (trackerId: string) => {
    try {
      await deleteTracker(trackerId);
    } catch (error) {
      console.error("Failed to delete tracker:", error);
      alert("Failed to delete tracker.");
    }
  };

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
        refetchTrackers();
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
        <div
          className="home-banner mb-4"
          style={{ backgroundImage: `url(${homeBanner})` }}
        >
          <div className="home-banner-overlay"></div>
          <div className="home-banner-content">
            <h1 className="display-4 fw-bold">Welcome to TravelMate</h1>
            <p className="lead mb-4">
              Plan, collaborate with friends, and explore smarter ✈️
            </p>
            <button
              className="btn btn-primary me-3"
              onClick={() => {
                setEditingTrip(null);
                setShowTripModal(true);
              }}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Trip
            </button>
            <button
              className="btn btn-light"
              onClick={() => {
                setEditingTracker(null);
                setShowTrackerModal(true);
              }}
            >
              <i className="bi bi-calendar3 me-2"></i>
              Add Availability Tracker
            </button>
          </div>
        </div>

        {showTripModal && (
          <AddTripModal
            onClose={() => setShowTripModal(false)}
            onSave={async (tripData) => {
              if (editingTrip) {
                await handleUpdateTrip(tripData);
              } else if (user?.user_id) {
                const fullTripData = {
                  ...tripData,
                  user_ids: [user.user_id],
                };
                await createNewTrip(fullTripData, [user.user_id]);
              }
              setShowTripModal(false);
            }}
            initialData={
              editingTrip
                ? {
                    ...editingTrip,
                    start_date: editingTrip.start_date
                      ? new Date(editingTrip.start_date)
                      : null,
                    end_date: editingTrip.end_date
                      ? new Date(editingTrip.end_date)
                      : null,
                  }
                : undefined
            }
          />
        )}

        {showTrackerModal && (
          <AvailabilityTrackerModal
            onClose={() => setShowTrackerModal(false)}
            onSave={async (trackerData, trackerId) => {
              if (trackerId) {
                await handleUpdateTracker(trackerData, trackerId);
              } else {
                await handleCreateTracker(trackerData);
              }
            }}
            initialData={editingTracker ?? undefined}
          />
        )}
      </div>

      <div className="container">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === "trips" ? "active" : ""}`}
              onClick={() => setActiveTab("trips")}
              href="#"
            >
              <i className="bi bi-airplane"></i>
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
              <i className="bi bi-calendar-check me-2"></i>
              Availability Cards
            </a>
          </li>
        </ul>

        <div className="tab-content mt-3">
          {activeTab === "trips" && (
            <div className="row gy-4 mb-4">
              {tripsLoading ? (
                <p>Loading trips...</p>
              ) : (
                trips.map((trip: ApiTrip) => (
                  <div key={trip.trip_id} className="col-md-6">
                    <Card
                      trip={trip}
                      onDelete={deleteTrip}
                      onEdit={handleEditTrip}
                    />
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === "availability" && (
            <div className="row gy-4 mb-4">
              {trackersLoading ? (
                <p>Loading availability trackers...</p>
              ) : (
                trackers.map((tracker) => (
                  <div key={tracker.id} className="col-md-6">
                    <AvailabilityTrackerCard
                      tracker={tracker}
                      onDelete={() => handleDeleteTracker(tracker.id)}
                      onEdit={() => handleEditTracker(tracker)}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="py-4 text-center border-top mt-5">
        <a href="#">Back to top</a>
      </footer>
    </>
  );
}
