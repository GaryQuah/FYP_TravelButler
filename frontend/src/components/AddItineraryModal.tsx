// A modal is a popup window that appears on top of the current page, allowing for user interaction without navigating away
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { type ItineraryCreationData } from "../models/api";

// Define a type for the form's internal state to allow for null dates
type ItineraryFormState = {
  activity_name: string;
  start_time: Date | null;
  end_time: Date | null;
  description: string;
};

interface Props {
  onClose: () => void;
  onSave: (itineraryData: ItineraryCreationData) => void;
}

const AddItineraryModal = ({ onClose }: Props) => {
  const [formData, setFormData] = useState({
    activity_name: "",
    start_time: null,
    end_time: null,
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

  const handleDateChange = (
    date: Date | null,
    fieldName: "start_time" | "end_time",
  ) => {
    setFormData({
      ...formData,
      [fieldName]: date,
    });
  };

  const handleSubmit = () => {
    // Ensure that start_time and end_time are not null before saving
    if (formData.start_time && formData.end_time) {
      onSave(formData as ItineraryCreationData);
      onClose(); // Close the modal on successful save
    } else {
      console.error("Please select a start and end time.");
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
            <h5>Add Itinerary</h5>

            <input
              className="form-control mb-2"
              name="activity_name"
              placeholder="Activity Name"
              value={formData.activity_name}
              onChange={handleChange}
            />

            <DatePicker
              className="form-control mb-2"
              selected={formData.start_time}
              onChange={(date: Date | null) =>
                handleDateChange(date, "start_time")
              }
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Start Time"
            />

            <DatePicker
              className="form-control mb-2"
              selected={formData.end_time}
              onChange={(date: Date | null) =>
                handleDateChange(date, "end_time")
              }
              showTimeSelect
              dateFormat="Pp"
              placeholderText="End Time"
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
