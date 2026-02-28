import React, { useState } from "react";
import { type TripCreationData } from "../models/api";

type TripFormData = Omit<TripCreationData, "user_ids">;

interface Props {
  onClose: () => void;
  onSave: (tripData: TripFormData) => void;
}

const AddTripModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<TripFormData>({
    trip_name: "",
    start_date: "",
    end_date: "",
    description: "",
    budget: 0,
  });

  // When there is a change in form data, update accordingly.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      // Handle budget as a number, and all other fields as strings
      [name]: name === "budget" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
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
            <h5>Add Trip</h5>

            <div className="mb-2">
              <label htmlFor="trip_name" className="form-label">
                Trip Name
              </label>
              <input
                type="text"
                className="form-control"
                id="trip_name"
                name="trip_name"
                value={formData.trip_name}
                onChange={handleChange}
                required
              />
            </div>

            <input
              className="form-control mb-2"
              name="start_date"
              placeholder="Start Date"
              value={formData.start_date}
              onChange={handleChange}
            />

            <input
              className="form-control mb-2"
              name="end_date"
              placeholder="End Date"
              value={formData.end_date}
              onChange={handleChange}
            />

            <textarea
              className="form-control mb-3"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
            />

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

export default AddTripModal;
