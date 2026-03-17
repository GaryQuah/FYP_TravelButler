import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { type TripCreationData } from "../../models";

// Use a specific type for the form's internal state to handle Date objects
type TripFormState = {
  trip_name: string;
  start_date: Date | null;
  end_date: Date | null;
  description: string;
};

interface Props {
  onClose: () => void;
  // The onSave prop should expect the data in the format required by the API.
  onSave: (tripData: Omit<TripCreationData, "user_ids">) => void;
}

const AddTripModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<TripFormState>({
    trip_name: "",
    start_date: null,
    end_date: null,
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (
    date: Date | null,
    fieldName: "start_date" | "end_date",
  ) => {
    setFormData({
      ...formData,
      [fieldName]: date,
    });
  };

  const handleSubmit = () => {
    if (formData.start_date && formData.end_date) {
      const tripDataToSave = {
        ...formData,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString(),
      };
      onSave(tripDataToSave);
      onClose();
    } else {
      // Optionally, handle the case where dates are not selected
      console.error("Please select a start and end date.");
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

            <DatePicker
              className="form-control mb-2"
              selected={formData.start_date}
              onChange={(date: Date | null) =>
                handleDateChange(date, "start_date")
              }
              selectsStart
              startDate={formData.start_date}
              endDate={formData.end_date}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Start Date"
            />

            <DatePicker
              className="form-control mb-2"
              selected={formData.end_date}
              onChange={(date: Date | null) =>
                handleDateChange(date, "end_date")
              }
              selectsEnd
              startDate={formData.start_date}
              endDate={formData.end_date}
              minDate={formData.start_date ?? undefined}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="End Date"
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
