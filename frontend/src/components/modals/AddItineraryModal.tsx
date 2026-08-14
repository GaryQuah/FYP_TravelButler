import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { type Itinerary, type ItineraryCreationData } from "../../models";

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
  initialData?: Itinerary;
}

const AddItineraryModal: React.FC<Props> = ({
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<ItineraryFormState>({
    activity_name: initialData?.activity_name || "",
    start_time: initialData?.start_time
      ? new Date(initialData.start_time)
      : null,
    end_time: initialData?.end_time ? new Date(initialData.end_time) : null,
    description: initialData?.description || "",
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

  const formatToLocalISOString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = () => {
    // Ensure that start_time and end_time are not null before saving
    if (formData.start_time && formData.end_time) {
      const itineraryData = {
        ...formData,
        start_time: formatToLocalISOString(formData.start_time),
        end_time: formatToLocalISOString(formData.end_time),
      };
      onSave(itineraryData as any);
      onClose();
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
