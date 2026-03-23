import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ItineraryCard from "../../components/cards/ItineraryCard";
import AddItineraryModal from "../../components/modals/AddItineraryModal";
import AddUserModal from "../../components/modals/AddUserModal";
import { useItineraries } from "../../hooks/UseItineraries";
import { useTripDetails } from "../../hooks/useTripDetails";
import { inviteUserToTrip } from "../../api";
import type { ItineraryCreationData } from "../../models";

export function TripItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const {
    trip,
    members,
    loading: tripLoading,
    error: tripError,
    refresh: refreshTripDetails,
  } = useTripDetails(tripId);
  const {
    itineraries,
    loading: itinerariesLoading,
    error: itinerariesError,
    addItinerary,
    deleteItinerary,
  } = useItineraries(tripId, trip?.itinerary_ids);
  const [showModal, setShowModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);

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
      refreshTripDetails(); // Refresh the trip details and members
    } catch (error: any) {
      setAddUserError(error.message || "Failed to add user.");
    }
  };

  if (tripLoading) {
    return <div>Loading trip details...</div>;
  }

  if (tripError) {
    return <div>{tripError}</div>;
  }

  if (!trip) {
    return <div>Trip not found.</div>;
  }

  return (
    <>
      <div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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
        <div className="col-12">
          {itinerariesLoading && <p>Loading itinerary...</p>}
          {itinerariesError && (
            <p className="text-danger">{itinerariesError}</p>
          )}
          <div className="row">
            {(() => {
              if (!itineraries || itineraries.length === 0) {
                return (
                  !itinerariesLoading && (
                    <p>No itinerary items found. Add one to get started!</p>
                  )
                );
              }

              const sortedItineraries = [...itineraries].sort(
                (a, b) =>
                  new Date(a.start_time).getTime() -
                  new Date(b.start_time).getTime(),
              );

              let lastDate: string | null = null;

              return sortedItineraries.map((item) => {
                const itemDate = new Date(item.start_time).toLocaleDateString(
                  undefined,
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                );

                const showHeader = itemDate !== lastDate;
                if (showHeader) {
                  lastDate = itemDate;
                }

                return (
                  <React.Fragment key={item.id}>
                    {showHeader && (
                      <div className="col-12 mt-4">
                        <h2>{itemDate}</h2>
                        <hr />
                      </div>
                    )}
                    <div className="col-md-6 mb-4">
                      <ItineraryCard
                        id={item.id}
                        activity_name={item.activity_name}
                        start_time={item.start_time}
                        end_time={item.end_time}
                        description={item.description}
                        onDelete={deleteItinerary}
                      />
                    </div>
                  </React.Fragment>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </>
  );
}
