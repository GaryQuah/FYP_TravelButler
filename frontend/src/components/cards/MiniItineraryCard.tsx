import React from "react";
import { type ItineraryCreationData } from "../../models/itinerary";
import { formatTimeFromString } from "../../utils/dateUtils";

interface MiniItineraryCardProps {
  itinerary: ItineraryCreationData;
  onAddToItinerary: (itinerary: ItineraryCreationData) => void;
}

export const MiniItineraryCard: React.FC<MiniItineraryCardProps> = ({
  itinerary,
  onAddToItinerary,
}) => {
  return (
    <div className="card mb-2">
      <div className="card-body">
        <h5 className="card-title">{itinerary.activity_name}</h5>
        <div className="mb-2 text-muted">
          {formatTimeFromString(itinerary.start_time)} -{" "}
          {formatTimeFromString(itinerary.end_time)}
        </div>
        <p className="card-text">{itinerary.description}</p>
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-primary"
            onClick={() => onAddToItinerary(itinerary)}
          >
            Add to Itinerary
          </button>
        </div>
      </div>
    </div>
  );
};
