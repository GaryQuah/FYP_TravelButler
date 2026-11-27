import { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { formatDateLabel } from "../../utils/dateUtils";

interface DateSelectionModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (dates: Record<string, string>) => void;
  itineraryDates: string[];
  minDate?: string;
  maxDate?: string;
}

export function DateSelectionModal({
  show,
  onHide,
  onSave,
  itineraryDates,
  minDate,
  maxDate,
}: DateSelectionModalProps) {
  const itineraryDatesKey = itineraryDates.join("|");
  const sourceDates = useMemo(
    () => [...new Set(itineraryDatesKey ? itineraryDatesKey.split("|") : [])].sort(),
    [itineraryDatesKey],
  );
  const initialDates = useMemo(() => {
    return Object.fromEntries(sourceDates.map((date) => [date, date]));
  }, [sourceDates]);

  const [selectedDates, setSelectedDates] =
    useState<Record<string, string>>(initialDates);

  useEffect(() => {
    setSelectedDates(initialDates);
  }, [initialDates]);

  const handleSave = () => {
    onSave(selectedDates);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Select a Date for Each Itinerary Day</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {sourceDates.map((sourceDate, index) => (
            <Form.Group className="mb-3" key={sourceDate}>
              <Form.Label>
                Day {index + 1} recommendations ({formatDateLabel(sourceDate)})
              </Form.Label>
              <Form.Control
                type="date"
                value={selectedDates[sourceDate] ?? ""}
                onChange={(event) =>
                  setSelectedDates((currentDates) => ({
                    ...currentDates,
                    [sourceDate]: event.target.value,
                  }))
                }
                min={minDate}
                max={maxDate}
              />
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={
            sourceDates.length === 0 ||
            sourceDates.some((sourceDate) => !selectedDates[sourceDate])
          }
        >
          Add Activities
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
