import React from "react";
import { type ItineraryCreationData } from "../../models/itinerary";
import { formatTime } from "../../utils/dateUtils";

interface MiniItineraryCardProps {
  itinerary: ItineraryCreationData;
}

export const MiniItineraryCard: React.FC<MiniItineraryCardProps> = ({
  itinerary,
}) => {
  return (
    <div className="card mb-2">
      <div className="card-body">
        <h5 className="card-title">{itinerary.activity_name}</h5>
        <div className="mb-2 text-muted">
          {formatTime(itinerary.start_time)} - {formatTime(itinerary.end_time)}
        </div>
        <p className="card-text">{itinerary.description}</p>
        <div className="d-flex justify-content-between"></div>
      </div>
    </div>
  );
};
