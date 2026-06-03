import { Outlet, useParams } from "react-router-dom";
import Navbar from "../../components/navigation/Navbar";
import TripNavbar from "../../components/navigation/TripNavBar";
import {
  useTripDetails,
  TripDetailsProvider,
} from "../../hooks/useTripDetails";
import { formatFullDateTime } from "../../utils/dateUtils";
import "../../assets/css/LoginPage.css";

export function TripLayout() {
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <TripDetailsProvider tripId={tripId}>
      <TripLayoutContent />
    </TripDetailsProvider>
  );
}

function TripLayoutContent() {
  const { trip, members, loading, error } = useTripDetails();

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

        <div className="container-fluid p-4">
          {/* Trip header */}
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="p-4 text-white rounded bg-dark h-100 d-flex flex-column">
                <h1 className="display-5 fst-italic">{trip.trip_name}</h1>

                <p className="mb-3">
                  {formatFullDateTime(trip.start_date)} -{" "}
                  {formatFullDateTime(trip.end_date)}
                </p>

                <p className="lead">{trip.description}</p>
              </div>
            </div>

            {/* Trip members */}
            <div className="col-md-4">
              <h4>Trip Members</h4>

              <ul className="list-group">
                {members.map((member) => (
                  <li key={member.user_id} className="list-group-item">
                    {member.name} ({member.email})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Page content (itinerary / chat / budget) */}
          <Outlet />
        </div>
      </div>
    </>
  );
}
