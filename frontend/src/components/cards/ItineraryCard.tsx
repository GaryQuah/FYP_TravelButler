import { useState } from "react";
import { createSingleCalendarEvent } from "../../api";

interface ItineraryCardProps {
  id: string;
  activity_name: string;
  start_time: string;
  end_time: string;
  description: string;
  onDelete: (itineraryId: string) => void;
  onEdit: (itineraryId: string) => void;
  googleConnected?: boolean;
}

const ItineraryCard = ({
  id,
  activity_name,
  start_time,
  end_time,
  description,
  onDelete,
  onEdit,
  googleConnected = false,
}: ItineraryCardProps) => {
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  const [added, setAdded] = useState(false);

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${activity_name}"?`)) {
      onDelete(id);
    }
  };

  const handleAddToCalendar = async () => {
    if (!googleConnected) return;

    setAddingToCalendar(true);
    try {
      const eventData = {
        summary: activity_name,
        description: description,
        start: {
          dateTime: new Date(start_time).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(end_time).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      await createSingleCalendarEvent(eventData);
      setAdded(true);
    } catch (error) {
      console.error("Failed to add to calendar:", error);
    } finally {
      setAddingToCalendar(false);
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
          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onEdit(id)}
              aria-label={`Edit itinerary ${activity_name}`}
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleDelete}
              aria-label={`Delete itinerary ${activity_name}`}
            >
              <i className="bi bi-trash3"></i>
            </button>
          </div>
        </div>

        <div className="mb-2 text-muted">
          {formatTime(start_time)} - {formatTime(end_time)}
        </div>

        <p className="card-text mb-auto">{description}</p>

        {googleConnected && (
          <div className="mt-3">
            {added ? (
              <span className="badge bg-success">Added to Calendar</span>
            ) : (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={handleAddToCalendar}
                disabled={addingToCalendar}
              >
                {addingToCalendar ? "Adding..." : "Add to Google Calendar"}
              </button>
            )}
          </div>
        )}

        {/*TODO: Add image upload support for the trip card, and display the image here if it exists*/}
      </div>
    </div>
  );
};

export default ItineraryCard;
