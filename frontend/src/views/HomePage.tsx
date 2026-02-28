import { useState } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/TripCard";
import AddTripModal from "../components/AddTripModal";
import { type Trip as ApiTrip } from "../models/api";
import { useTrips } from "../hooks/UseTrip";
import { useUser } from "../models/UserContext";

export function HomePage() {
  const { trips, createNewTrip, loading } = useTrips();
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="container">
        {/* Navigation */}
        <Navbar />

        {/*Main text section */}
        <div className="p-4 p-md-5 mb-4 text-white rounded bg-dark">
          <div className="col-md-6 px-0">
            <h1 className="display-5 fst-italic">Welcome to TravelMate</h1>
            <p className="lead my-3">
              Plan, collaborate with friends, and explore smarter ✈️
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Add Trip
            </button>

            {showModal && (
              <AddTripModal
                onClose={() => setShowModal(false)}
                onSave={async (tripData) => {
                  if (user?.user_id) {
                    await createNewTrip(tripData, user.user_id);
                    setShowModal(false);
                  } else {
                    console.error("No user ID found to create trip.");
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* User's current trips */}
        <div className="row mb-4">
          {trips.map((trip: ApiTrip) => (
            <div key={trip.trip_id} className="col-md-6">
              <Card trip={trip} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center border-top mt-5">
        <a href="#">Back to top</a>
      </footer>
    </>
  );
}
