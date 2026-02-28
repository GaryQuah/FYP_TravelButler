// A modal is a popup window that appears on top of the current page, allowing for user interaction without navigating away
import React, { useState } from "react";

interface Props {
  onClose: () => void;
}

const AddItineraryModal = ({ onClose }: Props) => {
  const [formData, setFormData] = useState({
    activity_name: "",
    start_time: "",
    end_time: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    console.log(formData); // later send to backend
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
            <h5>Add Itinerary</h5>

            <input
              className="form-control mb-2"
              name="activity_name"
              placeholder="Activity Name"
              value={formData.activity_name}
              onChange={handleChange}
            />

            <input
              className="form-control mb-2"
              name="start_time"
              placeholder="Start Time"
              value={formData.start_time}
              onChange={handleChange}
            />

            <input
              className="form-control mb-2"
              name="end_time"
              placeholder="End Time"
              value={formData.end_time}
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

export default AddItineraryModal;
