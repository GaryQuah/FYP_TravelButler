import React from "react";
import { MiniItineraryCard } from "../cards/MiniItineraryCard";
import type { ItineraryCreationData } from "../../models";

interface Props {
  onClose: () => void;
  analysis: any | null;
  onAddToItinerary: (item: ItineraryCreationData) => void;
  onAddAllToItinerary: () => void;
}

const ItineraryAnalysisModal: React.FC<Props> = ({
  onClose,
  analysis,
  onAddToItinerary,
  onAddAllToItinerary,
}) => {
  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-3">
          <h5>Itinerary Analysis</h5>
          {analysis &&
          analysis.recommendations &&
          analysis.recommendations.length > 0 ? (
            <div>
              <button
                className="btn btn-primary mb-3"
                onClick={onAddAllToItinerary}
              >
                Add All to Itinerary
              </button>
              {analysis.recommendations.map((rec: any, index: number) => {
                const itinerary: ItineraryCreationData = {
                  activity_name: rec.activity_name,
                  start_time: rec.start_time,
                  end_time: rec.end_time,
                  description: rec.description,
                };
                return (
                  <MiniItineraryCard
                    key={index}
                    itinerary={itinerary}
                    onAddToItinerary={onAddToItinerary}
                  />
                );
              })}
            </div>
          ) : (
            <p>No items to recommend.</p>
          )}
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryAnalysisModal;
