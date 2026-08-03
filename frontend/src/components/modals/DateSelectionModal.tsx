import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface DateSelectionModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (date: Date) => void;
  minDate?: string;
  maxDate?: string;
}

export function DateSelectionModal({
  show,
  onHide,
  onSave,
  minDate,
  maxDate,
}: DateSelectionModalProps) {
  const getInitialDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const min = minDate ? new Date(minDate.replace(/-/g, "/")) : null;
    const max = maxDate ? new Date(maxDate.replace(/-/g, "/")) : null;

    if (min && min > today) {
      return min; // If the trip is in the future, start with the first day of the trip
    }

    const isTodayInRange = (!min || today >= min) && (!max || today <= max);

    if (isTodayInRange) {
      return today; // If today is within the trip's range, start with today
    } else if (min) {
      return min; // Otherwise, default to the first day of the trip
    }

    return today; // Fallback to today if no minDate is provided
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());

  useEffect(() => {
    setSelectedDate(getInitialDate());
  }, [minDate, maxDate]);

  const handleSave = () => {
    onSave(selectedDate);
  };

  const isValidDate = (date: Date) => date && !isNaN(date.getTime());

  const toInputFormat = (date: Date) => {
    if (!isValidDate(date)) return "";
    // Manually format to YYYY-MM-DD to avoid timezone issues with toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Select a Date</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={toInputFormat(selectedDate)}
              onChange={(e) =>
                setSelectedDate(new Date(e.target.value.replace(/-/g, "/")))
              }
              min={minDate}
              max={maxDate}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
