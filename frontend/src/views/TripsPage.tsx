import { HomePageViewModel } from "../viewmodels/HomePageViewModel";
import { useState } from "react";
import Navbar from "../components/Navbar";
import TripNavbar from "../components/TripNavBar";
import ItineraryCard from "../components/ItineraryCard";
import AddItineraryModal from "../components/AddItineraryModal";
//TODO: Migrate these static data into the database & import from there
const cardsData = [
  {
    id: 1,
    activity_name: "BBQ",
    start_time: "1pm",
    end_time: "4pm",
    description: "BBQ at East coast park.",
  },
  {
    id: 1,
    activity_name: "BBQ",
    start_time: "1pm",
    end_time: "4pm",
    description: "BBQ at East coast park.",
  },
  {
    id: 1,
    activity_name: "BBQ",
    start_time: "1pm",
    end_time: "4pm",
    description: "BBQ at East coast park.",
  },
  {
    id: 1,
    activity_name: "BBQ",
    start_time: "1pm",
    end_time: "4pm",
    description: "BBQ at East coast park.",
  },
  {
    id: 1,
    activity_name: "BBQ",
    start_time: "1pm",
    end_time: "4pm",
    description: "BBQ at East coast park.",
  },
  {
    id: 1,
    activity_name: "BBQ",
    start_time: "1pm",
    end_time: "4pm",
    description: "BBQ at East coast park.",
  },
];

export function TripsPage() {
  const {} = HomePageViewModel();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* TOP NAVBAR */}
      <Navbar />

      {/* BELOW NAVBAR: Sidebar + Content */}
      <div className="d-flex">
        {/* LEFT SIDEBAR */}
        <TripNavbar />

        {/* RIGHT CONTENT */}
        <div>
          <>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Add Itinerary
            </button>

            {showModal && (
              <AddItineraryModal onClose={() => setShowModal(false)} />
            )}
          </>

          <div className="container">
            <p className="lead my-3">01/01/2001</p>
            <div className="container">
              {/* User's current trips */}
              <div className="row mb-4">
                {cardsData.map((card) => (
                  <div key={card.id} className="col-md-6">
                    <ItineraryCard
                      activity_name={card.activity_name}
                      start_time={card.start_time}
                      end_time={card.end_time}
                      description={card.description}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="container">
            <p className="lead my-3">02/01/2001</p>
            <div className="container">
              {/* User's current trips */}
              <div className="row mb-4">
                {cardsData.map((card) => (
                  <div key={card.id} className="col-md-6">
                    <ItineraryCard
                      activity_name={card.activity_name}
                      start_time={card.start_time}
                      end_time={card.end_time}
                      description={card.description}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="container">
            <p className="lead my-3">03/01/2001</p>
            <div className="container">
              {/* User's current trips */}
              <div className="row mb-4">
                {cardsData.map((card) => (
                  <div key={card.id} className="col-md-6">
                    <ItineraryCard
                      activity_name={card.activity_name}
                      start_time={card.start_time}
                      end_time={card.end_time}
                      description={card.description}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="py-4 text-center border-top mt-5">
            <a href="#">Back to top</a>
          </footer>
        </div>
      </div>
    </>
  );
}
