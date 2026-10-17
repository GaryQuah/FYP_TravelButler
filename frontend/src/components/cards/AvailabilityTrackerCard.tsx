import React, { useState } from "react";
import { Link } from "react-router-dom";
import { type AvailabilityTracker } from "../../models/availability_tracker";
import ConfirmationModal from "../modals/ConfirmationModal";
import "../../assets/css/TripCard.css";

const formatDisplayDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const getBestCurrentWindow = (tracker: AvailabilityTracker): string[] => {
  if (!tracker.user_ids.length) return [];

  const availabilityCounts: Record<string, number> = {};
  tracker.user_ids.forEach((userId) => {
    (tracker.availability[userId] || []).forEach((date) => {
      availabilityCounts[date] = (availabilityCounts[date] || 0) + 1;
    });
  });

  const commonDates = Object.entries(availabilityCounts)
    .filter(([, count]) => count === tracker.user_ids.length)
    .map(([date]) => date)
    .sort();

  const windows: string[][] = [];
  let currentWindow: string[] = [];
  commonDates.forEach((date) => {
    if (!currentWindow.length) {
      currentWindow = [date];
      return;
    }

    const previousDate = new Date(`${currentWindow.at(-1)}T00:00:00`);
    const currentDate = new Date(`${date}T00:00:00`);
    const differenceInDays =
      (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);

    if (differenceInDays === 1) {
      currentWindow.push(date);
    } else {
      windows.push(currentWindow);
      currentWindow = [date];
    }
  });

  if (currentWindow.length) windows.push(currentWindow);
  const eligibleWindows = windows.filter(
    (window) => window.length >= tracker.min_consecutive_days,
  );
  return eligibleWindows.reduce(
    (best, window) => (window.length > best.length ? window : best),
    [],
  );
};

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDelete = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(tracker.id);
    setShowConfirmModal(false);
  };

  const bestWindow = getBestCurrentWindow(tracker);

  return (
    <>
      <div className="card mb-4 shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h3 className="mb-0">
                <i className="bi bi-calendar-check me-2"></i>
                {tracker.name}
              </h3>
              {bestWindow.length ? (
                <div
                  className="d-block mt-2 p-2 best-window-available rounded"
                  style={{ fontSize: "1em", fontWeight: "bold" }}
                >
                  {`Best available: ${formatDisplayDate(
                    bestWindow[0],
                  )} - ${formatDisplayDate(bestWindow.at(-1)!)}`}
                </div>
              ) : (
                <div
                  className="d-block mt-2 p-2 best-window-unavailable rounded"
                  style={{ fontSize: "1em", fontWeight: "bold" }}
                >
                  <i className="bi bi-clock me-2"></i>
                  Dates not aligned yet
                </div>
              )}
              <small className="d-block text-muted mt-1">
                Find {tracker.min_consecutive_days} dates that align with
                everyone
              </small>
            </div>
            <div className="btn-group">
              <Link
                to={`/availability/${tracker.id}`}
                className="btn btn-sm btn-outline-primary"
                aria-label={`View tracker ${tracker.name}`}
              >
                View tracker
              </Link>
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
          {tracker.user_names && tracker.user_names.length > 0 && (
            <small className="text-muted">
              <i className="bi bi-people me-2"></i>
              {tracker.user_names.map((name) => name.split(" ")[0]).join(", ")}
            </small>
          )}
        </div>
      </div>
      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        body={`Are you sure you want to delete "${tracker.name}"?`}
      />
    </>
  );
};

export default AvailabilityTrackerCard;
