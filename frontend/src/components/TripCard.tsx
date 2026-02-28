import { type Trip as ApiTrip } from "../models/api";

interface CardProps {
  trip: ApiTrip;
}

const Card = ({ trip }: CardProps) => {
  // Format the date range for display
  const dateRange = `${trip.start_date} - ${trip.end_date}`;

  return (
    <div className="card mb-4 shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        <h3 className="mb-0">
          <a className="text-dark text-decoration-none" href="#">
            {trip.trip_name}
          </a>
        </h3>

        <div className="mb-2 text-muted">{dateRange}</div>

        <p className="card-text mb-auto">{trip.description}</p>

        <a href="#" className="mt-3">
          View Trip
        </a>
      </div>
    </div>
  );
};

export default Card;
