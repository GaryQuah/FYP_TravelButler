import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import TripNavbar from "../components/TripNavBar";
import ItineraryCard from "../components/ItineraryCard";
import AddItineraryModal from "../components/AddItineraryModal";
import AddUserModal from "../components/AddUserModal";
import { useItineraries } from "../hooks/UseItineraries";
import { useTrips } from "../hooks/UseTrip";
import { type ItineraryCreationData, type Trip } from "../models/api";

export function TripsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { itineraries, loading, error, addItinerary } = useItineraries(tripId);
  const { getTripById, inviteUserToTrip } = useTrips();
  const [tripDetails, setTripDetails] = useState<Trip | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  const [tripUserNames, setTripUserNames] = useState<string[]>([]);

  useEffect(() => {
    if (tripId && getTripById) {
      const fetchTripDetails = () => {
        const details = getTripById(tripId);
        setTripDetails(details || null);
      };
      fetchTripDetails();
    }
  }, [tripId, getTripById]);

  const handleSaveItinerary = async (itineraryData: ItineraryCreationData) => {
    await addItinerary(itineraryData);
    setShowModal(false);
  };

  const handleAddUser = async (email: string) => {
    if (!tripId) return;
    try {
      await inviteUserToTrip(tripId, email);
      setShowAddUserModal(false);
      setAddUserError(null);
    } catch (error: any) {
      setAddUserError(error.message || "Failed to add user.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="d-flex">
        <TripNavbar />
        <div className="container p-4">
          {loading && <p>Loading itinerary...</p>}
          {error && <p className="text-danger">{error}</p>}
          {tripDetails && (
            <>
              <div className="p-4 p-md-5 mb-4 text-white rounded bg-dark">
                <h1 className="display-5 fst-italic">
                  {tripDetails.trip_name}
                </h1>
                <p className="lead my-3">{tripDetails.description}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Add Itinerary
                </button>
                <button
                  className="btn btn-secondary ms-2"
                  onClick={() => setShowAddUserModal(true)}
                >
                  Add User
                </button>
              </div>

              {showModal && (
                <AddItineraryModal
                  onClose={() => setShowModal(false)}
                  onSave={handleSaveItinerary}
                />
              )}

              {showAddUserModal && (
                <AddUserModal
                  onClose={() => setShowAddUserModal(false)}
                  onAddUser={handleAddUser}
                  error={addUserError}
                />
              )}

              <div className="row">
                {itineraries && itineraries.length > 0
                  ? itineraries.map((item) => (
                      <div key={item.id} className="col-md-6 mb-4">
                        <ItineraryCard
                          activity_name={item.activity_name}
                          start_time={item.start_time}
                          end_time={item.end_time}
                          description={item.description}
                        />
                      </div>
                    ))
                  : !loading && (
                      <p>No itinerary items found. Add one to get started!</p>
                    )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
