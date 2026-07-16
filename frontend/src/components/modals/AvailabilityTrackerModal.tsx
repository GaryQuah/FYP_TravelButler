import React, { useState, useEffect } from "react";
import type { AvailabilityTracker } from "../../models";

interface Props {
  onClose: () => void;
  onSave: (trackerData: { name: string }, trackerId?: string) => void;
  initialData?: AvailabilityTracker;
}

const AddAvailabilityTrackerModal: React.FC<Props> = ({
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (name) {
      onSave({ name }, initialData?.id);
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
            <h5>{initialData ? "Edit" : "Add"} Availability Tracker</h5>

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
