import React from "react";
import { Link } from "react-router-dom";
import { type AvailabilityTracker } from "../../models/availability_tracker";

interface Props {
  tracker: AvailabilityTracker;
}
const AvailabilityTrackerCard: React.FC<Props> = ({ tracker }) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{tracker.name}</h5>
        <Link to={`/availability/${tracker.id}`} className="btn btn-primary">
          View
        </Link>
      </div>
    </div>
  );
};

export default AvailabilityTrackerCard;
