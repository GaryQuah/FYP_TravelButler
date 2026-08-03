import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ActionModalProps {
  analysisResult: any;
  onClose: () => void;
  onAddToItinerary: (details: any) => void;
  onAddToBudget: (details: any) => void;
}

export function ActionModal({
  analysisResult,
  onClose,
  onAddToItinerary,
  onAddToBudget,
}: ActionModalProps) {
  const { itinerary, budget } = analysisResult;

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add to Trip</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          We found some details in your uploaded document. Would you like to add
          them to your trip?
        </p>
        {itinerary && (
          <div>
            <h5>Itinerary Details</h5>
            <p>Event: {itinerary.event}</p>
            <p>Date: {itinerary.date}</p>
            <p>Time: {itinerary.time}</p>
            <Button onClick={() => onAddToItinerary(itinerary)}>
              Add to Itinerary
            </Button>
          </div>
        )}
        {budget && (
          <div className="mt-3">
            <h5>Budget Details</h5>
            <p>Item: {budget.item}</p>
            <p>Amount: {budget.amount}</p>
            <p>Category: {budget.category}</p>
            <Button onClick={() => onAddToBudget(budget)}>Add to Budget</Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
