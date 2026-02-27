import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/TripCard";
import { HomePageViewModel } from "../viewmodels/HomePageViewModel";
import AddTripModal from "../components/AddTripModal";

interface Trip {
  trip_id: string;
  title: string;
  budget: number;
  itineraries: any[]; // Define a more specific type for itineraries if possible
}

const {} = HomePageViewModel();

export function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showModal, setShowModal] = useState(false);

  const createNewTrip = async () => {};
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("/api/trips");
        if (!response.ok) {
          throw new Error("Failed to fetch trips");
        }
        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchTrips();
  }, []);

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

            {showModal && <AddTripModal onClose={() => setShowModal(false)} />}
          </div>
        </div>
      </div>

      <div className="container">
        {/* User's current trips */}
        <div className="row mb-4">
          {trips.map((trip) => (
            <div key={trip.trip_id} className="col-md-6">
              <Card
                title={trip.title}
                date={""} // You might want to derive a date from the itineraries
                description={`Budget: ${trip.budget}`}
              />
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
