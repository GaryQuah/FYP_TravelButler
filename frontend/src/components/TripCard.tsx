import { type Trip as ApiTrip } from "../models/api";

interface CardProps {
  trip: ApiTrip;
  onDelete: (tripId: string) => void;
}

const Card = ({ trip, onDelete }: CardProps) => {
  // Format the date range for display
  const dateRange = `${trip.start_date} - ${trip.end_date}`;

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
          <h3 className="mb-0">
            <a className="text-dark text-decoration-none" href="#">
              {trip.trip_name}
            </a>
          </h3>
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
        <a href="#" className="mt-3 align-self-start">
          View Trip
        </a>
      </div>
    </div>
  );
};

export default Card;
