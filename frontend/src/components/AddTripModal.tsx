import React, { useState } from "react";

interface Props {
  onClose: () => void;
}

const AddTripModal: React.FC<Props> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    trip_name: "",
    start_date: "",
    end_date: "",
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
            <h5>Add Trip</h5>

            <input
              className="form-control mb-2"
              name="trip_name"
              placeholder="Trip Name"
              value={formData.trip_name}
              onChange={handleChange}
            />

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
