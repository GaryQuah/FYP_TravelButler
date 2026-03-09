import { useState } from "react";
import Navbar from "../components/navigation/Navbar";
import Card from "../components/cards/TripCard";
import AddTripModal from "../components/modals/AddTripModal";
import { type Trip as ApiTrip } from "../models/api";
import { useTrips } from "../hooks/UseTrip";
import { useUser } from "../models/UserContext";

export function HomePage() {
  const { trips, createNewTrip, deleteTrip, loading } = useTrips();
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
              // Show the add trip modal when the button is clicked - fill in details and add a new trip.
              onClick={() => setShowModal(true)}
            >
              Add Trip
            </button>

            {showModal && (
              <AddTripModal
                onClose={() => setShowModal(false)}
                onSave={async (tripData) => {
                  if (
                    user?.user_id &&
                    tripData.start_date &&
                    tripData.end_date
                  ) {
                    await createNewTrip(tripData, user.user_id);
                    setShowModal(false);
                  } else {
                    console.error(
                      "No user ID found or dates are not selected.",
                    );
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
              <Card trip={trip} onDelete={deleteTrip} />
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
