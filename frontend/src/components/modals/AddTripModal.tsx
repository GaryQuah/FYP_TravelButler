import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CountryDropdown } from "react-country-region-selector";
import { type TripCreationData } from "../../models";

// Use a specific type for the form's internal state to handle Date objects
type TripFormState = {
  trip_name: string;
  start_date: Date | null;
  end_date: Date | null;
  description: string;
  country: string;
};

interface Props {
  onClose: () => void;
  onSave: (
    tripData: Omit<TripCreationData, "user_ids">,
    imageFile: File | null,
  ) => Promise<void>;
  initialData?: Partial<TripFormState>;
}

const AddTripModal: React.FC<Props> = ({
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<TripFormState>({
    trip_name: initialData?.trip_name || "",
    start_date: initialData?.start_date || null,
    end_date: initialData?.end_date || null,
    description: initialData?.description || "",
    country: initialData?.country || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCountryChange = (val: string) => {
    setFormData({
      ...formData,
      country: val,
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

  const handleSubmit = async () => {
    if (formData.start_date && formData.end_date) {
      const tripDataToSave = {
        ...formData,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString(),
      };

      await onSave(tripDataToSave, imageFile);
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

            <CountryDropdown
              value={formData.country}
              onChange={handleCountryChange}
              className="form-control mb-2"
            />

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

            <div className="mb-3">
              <label htmlFor="trip-image" className="form-label">
                Trip Image (optional)
              </label>
              <input
                id="trip-image"
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
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

export default AddTripModal;
