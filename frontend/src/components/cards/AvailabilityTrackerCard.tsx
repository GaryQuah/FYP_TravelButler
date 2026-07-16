import React from "react";
import { Link } from "react-router-dom";
import { type AvailabilityTracker } from "../../models/availability_tracker";
import "../../assets/css/TripCard.css";

interface Props {
  tracker: AvailabilityTracker;
  onDelete: (trackerId: string) => void;
  onEdit: (tracker: AvailabilityTracker) => void;
}
const AvailabilityTrackerCard: React.FC<Props> = ({
  tracker,
  onDelete,
  onEdit,
}) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${tracker.name}"?`)) {
      onDelete(tracker.id);
    }
  };

  return (
    <div className="card mb-4 shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start">
          <h3 className="mb-0">{tracker.name}</h3>
          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onEdit(tracker)}
              aria-label={`Edit tracker ${tracker.name}`}
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleDelete}
              aria-label={`Delete tracker ${tracker.name}`}
            >
              <i className="bi bi-trash3"></i>
            </button>
          </div>
        </div>
        <Link
          to={`/availability/${tracker.id}`}
          className="btn btn-outline-primary mt-3 align-self-start"
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default AvailabilityTrackerCard;
