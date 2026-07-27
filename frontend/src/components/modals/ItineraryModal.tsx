import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import type { ItineraryCreationData } from "../../models";

interface ItineraryModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (data: ItineraryCreationData) => void;
  itinerary: ItineraryCreationData | null;
  tripStartDate?: string;
  tripEndDate?: string;
}

export function ItineraryModal({
  show,
  onHide,
  onSave,
  itinerary,
  tripStartDate,
  tripEndDate,
}: ItineraryModalProps) {
  const [activityName, setActivityName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (itinerary && tripStartDate) {
      setActivityName(itinerary.activity_name);
      setDescription(itinerary.description);

      // 1. Establish the base date from the trip's start date.
      const baseTripDate = new Date(tripStartDate.replace(/-/g, "/"));
      if (isNaN(baseTripDate.getTime())) {
        return; // Cannot proceed with an invalid trip start date
      }

      // 2. Extract time from AI recommendation, with robust fallback.
      const aiStartDate = new Date(itinerary.start_time);
      const aiEndDate = new Date(itinerary.end_time);

      const startHours = !isNaN(aiStartDate.getTime())
        ? aiStartDate.getHours()
        : 9; // Default: 9 AM
      const startMinutes = !isNaN(aiStartDate.getTime())
        ? aiStartDate.getMinutes()
        : 0;

      const endHours = !isNaN(aiEndDate.getTime()) ? aiEndDate.getHours() : 10; // Default: 10 AM
      const endMinutes = !isNaN(aiEndDate.getTime())
        ? aiEndDate.getMinutes()
        : 0;

      // 3. Combine base date with extracted time.
      const newStartDate = new Date(baseTripDate.getTime());
      newStartDate.setHours(startHours, startMinutes, 0, 0);

      const newEndDate = new Date(baseTripDate.getTime());
      newEndDate.setHours(endHours, endMinutes, 0, 0);

      // Handle overnight activities
      if (newEndDate < newStartDate) {
        newEndDate.setDate(newEndDate.getDate() + 1);
      }

      // 4. Format for datetime-local input and set state.
      const formatForInput = (date: Date) => {
        // This function creates a YYYY-MM-DDTHH:mm string in the local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setStartTime(formatForInput(newStartDate));
      setEndTime(formatForInput(newEndDate));
    }
  }, [itinerary, tripStartDate]);

  const handleSave = () => {
    if (itinerary) {
      onSave({
        ...itinerary,
        activity_name: activityName,
        start_time: new Date(startTime),
        end_time: new Date(endTime),
        description,
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Finalize Itinerary</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Activity Name</Form.Label>
            <Form.Control
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min={tripStartDate ? `${tripStartDate}T00:00` : undefined}
              max={tripEndDate ? `${tripEndDate}T23:59` : undefined}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={tripStartDate ? `${tripStartDate}T00:00` : undefined}
              max={tripEndDate ? `${tripEndDate}T23:59` : undefined}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Body>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Body>
    </Modal>
  );
}
