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

      const tripDatePart = tripStartDate.split("T")[0];

      const formatTimeFromString = (dateTimeString: string): string => {
        const timePart = dateTimeString.split("T")[1];
        if (timePart) {
          const [hours, minutes] = timePart.split(":");
          return `${hours}:${minutes}`;
        }
        return "09:00"; // Fallback
      };

      const startTime = formatTimeFromString(itinerary.start_time);
      const endTime = formatTimeFromString(itinerary.end_time);

      setStartTime(`${tripDatePart}T${startTime}`);
      setEndTime(`${tripDatePart}T${endTime}`);
    }
  }, [itinerary, tripStartDate]);

  const handleSave = () => {
    if (itinerary) {
      onSave({
        ...itinerary,
        activity_name: activityName,
        start_time: startTime,
        end_time: endTime,
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
