import { type Trip as ApiTrip } from "../../models";
import { Link } from "react-router-dom";
import { formatFullDateTime } from "../../utils/dateUtils";

interface CardProps {
  trip: ApiTrip;
  onDelete: (tripId: string) => void;
}

const Card = ({ trip, onDelete }: CardProps) => {
  const dateRange = `${formatFullDateTime(trip.start_date)} - ${formatFullDateTime(
    trip.end_date,
  )}`;

  const handleDelete = () => {
    if (
      window.confirm(`Are you sure you want to delete "${trip.trip_name}"?`)
    ) {
      onDelete(trip.trip_id);
    }
  };

  return (
    <div className="card mb-4 shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start">
          <h3 className="mb-0">{trip.trip_name}</h3>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleDelete}
            aria-label={`Delete trip ${trip.trip_name}`}
          >
            &times;
          </button>
        </div>

        <div className="mb-2 text-muted">{dateRange}</div>

        <p className="card-text mb-auto">{trip.description}</p>

        {/*TODO: Add image upload support for the trip card, and display the image here if it exists*/}
        <Link
          to={`/trip/${trip.trip_id}/itinerary`}
          className="btn btn-outline-primary mt-3 align-self-start"
        >
          View Trip
        </Link>
      </div>
    </div>
  );
};

export default Card;
