import React, { useState } from "react";

interface Props {
  onClose: () => void;
  onSave: (trackerData: { name: string }) => void;
}

const AddAvailabilityTrackerModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name) {
      onSave({ name });
      onClose();
    } else {
      console.error("Please enter a name for the tracker.");
    }
  };

  return (
    <>
      {/* Dark Overlay */}
      <div
        className="modal d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content p-3">
            <h5>Add Availability Tracker</h5>

            <div className="mb-2">
              <label htmlFor="tracker_name" className="form-label">
                Tracker Name
              </label>
              <input
                type="text"
                className="form-control"
                id="tracker_name"
                name="tracker_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={onClose}>
                Cancel
              </button>

              <button className="btn btn-primary" onClick={handleSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddAvailabilityTrackerModal;
