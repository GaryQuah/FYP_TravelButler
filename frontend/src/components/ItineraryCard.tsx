import { formatTime } from "../utils/dateUtils";

interface ItineraryCardProps {
  id: string;
  activity_name: string;
  start_time: Date;
  end_time: Date;
  description: string;
  onDelete: (itineraryId: string) => void;
}

const ItineraryCard = ({
  id,
  activity_name,
  start_time,
  end_time,
  description,
  onDelete,
}: ItineraryCardProps) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${activity_name}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="card mb-4 shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start">
          <h3 className="mb-0">
            <a className="text-dark text-decoration-none" href="#">
              {activity_name}
            </a>
          </h3>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleDelete}
            aria-label={`Delete itinerary ${activity_name}`}
          >
            &times;
          </button>
        </div>

        <div className="mb-2 text-muted">
          {formatTime(start_time)} - {formatTime(end_time)}
        </div>

        <p className="card-text mb-auto">{description}</p>

        {/*TODO: Add image upload support for the trip card, and display the image here if it exists*/}
        <a href="#" className="mt-3">
          Continue reading
        </a>
      </div>
    </div>
  );
};

export default ItineraryCard;
