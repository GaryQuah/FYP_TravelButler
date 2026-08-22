/* Uses Outlet to render the content of the trip layout, prevents rendering the hero banner e.t.c multiple times. */
import { Outlet, useParams } from "react-router-dom";
import { useState } from "react";
import Navbar from "../../components/navigation/Navbar";
import TripNavbar from "../../components/navigation/TripNavBar";
import AddUserModal from "../../components/modals/AddUserModal";
import {
  useTripDetails,
  TripDetailsProvider,
} from "../../hooks/useTripDetails";
import { inviteUserToTrip } from "../../api";
import { formatFullDateTime } from "../../utils/dateUtils";
import "../../assets/css/LoginPage.css";
import "../../assets/css/TripLayout.css";
import homeBanner from "../../assets/images/dashboard/sunset.jpg";

export function TripLayout() {
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <TripDetailsProvider tripId={tripId}>
      <TripLayoutContent />
    </TripDetailsProvider>
  );
}

function TripLayoutContent() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, members, loading, error, refresh } = useTripDetails();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  const handleAddUser = async (email: string) => {
    if (!tripId) {
      setAddUserError("Trip ID is missing.");
      return;
    }
    try {
      await inviteUserToTrip(tripId, email);
      setShowAddUserModal(false);
      setAddUserError(null);
      refresh();
    } catch (err: any) {
      setAddUserError(err.message || "Failed to add user.");
    }
  };

  if (loading) {
    return <div>Loading trip details...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!trip) {
    return <div>Trip not found.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="d-flex">
        <TripNavbar />

        <div className="main-content container-fluid p-4">
          {/* Trip header */}
          <div className="row mb-4">
            <div className="col-md-8">
              <div
                className="p-4 text-white rounded h-100 d-flex flex-column trip-layout-container"
                style={{ backgroundImage: `url(${homeBanner})` }}
              >
                <div className="trip-layout-overlay"></div>
                <div className="trip-layout-content">
                  <h1 className="display-5 fst-italic">{trip.trip_name}</h1>
                  <h3 className="display-8 fst-italic">{trip.country}</h3>
                  <p className="mb-3">
                    {formatFullDateTime(new Date(trip.start_date))} -{" "}
                    {formatFullDateTime(new Date(trip.end_date))}
                  </p>
                  <p className="lead">{trip.description}</p>
                </div>
              </div>
            </div>

            {/* Trip members */}
            <div className="col-md-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="mb-0">Trip Members</h4>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddUserModal(true)}
                >
                  <i className="bi bi-person-plus me-2"></i>Add User
                </button>
              </div>

              <ul className="list-group">
                {members.map((member) => (
                  <li key={member.user_id} className="list-group-item">
                    {member.name} ({member.email})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Outlet />
        </div>
      </div>
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onAddUser={handleAddUser}
          error={addUserError}
        />
      )}
    </>
  );
}
