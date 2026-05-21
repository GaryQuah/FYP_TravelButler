import React, { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface User {
  id: string;
  name: string;
}

interface AvailabilityMap {
  [userId: string]: string[];
}

const users: User[] = [
  { id: "1", name: "Gary" },
  { id: "2", name: "Sarah" },
  { id: "3", name: "John" },
  { id: "4", name: "Emily" },
];

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDate = (dateString: string) => {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDisplayDate = (dateString: string) => {
  const [y, m, d] = dateString.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
};

const addDay = (date: Date) => {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d;
};

const isNextDay = (a: string, b: string) => {
  const da = parseDate(a);
  const db = parseDate(b);
  return addDay(da).getTime() === db.getTime();
};

const initialAvailability: AvailabilityMap = {
  "1": [
    "2026-06-01",
    "2026-06-02",
    "2026-06-03",
    "2026-06-05",
    "2026-06-06",
    "2026-06-07",
    "2026-06-09",
  ],
  "2": [
    "2026-06-01",
    "2026-06-02",
    "2026-06-03",
    "2026-06-04",
    "2026-06-06",
    "2026-06-07",
    "2026-06-08",
  ],
  "3": [
    "2026-06-01",
    "2026-06-02",
    "2026-06-03",
    "2026-06-05",
    "2026-06-06",
    "2026-06-08",
    "2026-06-09",
  ],
  "4": [
    "2026-06-01",
    "2026-06-02",
    "2026-06-03",
    "2026-06-04",
    "2026-06-05",
    "2026-06-06",
    "2026-06-07",
  ],
};

const currentUserId = "1";

export default function TravelAvailabilityPlanner() {
  const [availability, setAvailability] =
    useState<AvailabilityMap>(initialAvailability);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    users.map((u) => u.id),
  );

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<string[]>(availability[currentUserId]);
  const [minConsecutiveDays, setMinConsecutiveDays] = useState(3);

  const [selectedWindow, setSelectedWindow] = useState<string[] | null>(null);

  const currentUserDates = editMode ? draft : availability[currentUserId];

  const handleSelect = (dates: Date[] | undefined) => {
    if (!dates || !editMode) return;
    setDraft(dates.map(formatDate));
  };

  const saveChanges = () => {
    setAvailability((prev) => ({ ...prev, [currentUserId]: draft }));
    setEditMode(false);
  };

  const cancelChanges = () => {
    setDraft(availability[currentUserId]);
    setEditMode(false);
  };

  const toggleUserVisibility = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const availabilityCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    selectedUserIds.forEach((id) => {
      (availability[id] || []).forEach((d) => {
        counts[d] = (counts[d] || 0) + 1;
      });
    });

    return counts;
  }, [availability, selectedUserIds]);

  const fullyAvailableDates = Object.entries(availabilityCounts)
    .filter(([_, v]) => v === selectedUserIds.length)
    .map(([d]) => d)
    .sort();

  const partialAvailableDates = Object.entries(availabilityCounts)
    .filter(([_, v]) => v > 0 && v < selectedUserIds.length)
    .map(([d]) => parseDate(d));

  const consecutiveWindows = useMemo(() => {
    const windows: string[][] = [];
    let current: string[] = [];

    for (let i = 0; i < fullyAvailableDates.length; i++) {
      const date = fullyAvailableDates[i];

      if (!current.length) {
        current.push(date);
        continue;
      }

      const prev = current[current.length - 1];

      if (isNextDay(prev, date)) current.push(date);
      else {
        windows.push(current);
        current = [date];
      }
    }

    if (current.length) windows.push(current);

    return windows.filter((w) => w.length >= minConsecutiveDays);
  }, [fullyAvailableDates, minConsecutiveDays]);

  const bestWindow = useMemo(() => {
    if (!consecutiveWindows.length) return null;
    return consecutiveWindows.reduce((best, curr) =>
      curr.length > best.length ? curr : best,
    );
  }, [consecutiveWindows]);

  const selectedDates = currentUserDates.map(parseDate);
  const selectedFormWindow = selectedWindow || bestWindow;

  const formData = {
    startDate: selectedFormWindow?.[0] || null,
    endDate: selectedFormWindow?.[selectedFormWindow.length - 1] || null,
    userIds: selectedUserIds,
  };

  const submitForm = () => {
    console.log("Submitting trip plan:", formData);
    alert("Submitted (check console)");
  };

  return (
    <div className="container py-4">
      <style>{`
        .window-item:hover {
          background-color: #f1f3f5;
          cursor: pointer;
          transition: 0.2s;
        }
      `}</style>

      <div className="d-flex justify-content-between mb-3">
        <div>
          <h2 className="fw-bold">Travel Availability Planner</h2>
          <p className="text-muted mb-0">
            Plan trips based on overlapping availability
          </p>
        </div>

        {!editMode ? (
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            Edit
          </button>
        ) : (
          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={saveChanges}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={cancelChanges}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* USERS */}
        <div className="col-md-3">
          <div className="card p-3">
            <h5>Users</h5>

            {users.map((u) => (
              <div
                key={u.id}
                className="d-flex justify-content-between border rounded p-2 mb-2"
              >
                <div>
                  <div className="fw-semibold">{u.name}</div>
                  {u.id === currentUserId && (
                    <small className="text-primary">You</small>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(u.id)}
                  onChange={() => toggleUserVisibility(u.id)}
                />
              </div>
            ))}

            <hr />

            <label className="form-label fw-semibold">
              Min consecutive days
            </label>
            <input
              type="number"
              className="form-control"
              value={minConsecutiveDays}
              min={1}
              onChange={(e) => setMinConsecutiveDays(Number(e.target.value))}
            />

            <hr />

            <h6>Legend</h6>
            <div className="d-flex flex-column gap-1">
              <div>
                <span className="badge bg-success">■</span> Fully available
              </div>
              <div>
                <span className="badge bg-warning text-dark">■</span> Partial
                overlap
              </div>
              <div>
                <span className="badge border border-primary">■</span> Your
                selection
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="col-md-9">
          {/* CALENDAR */}
          <div className="card mb-3 p-3">
            <h5>Calendar</h5>

            <DayPicker
              mode="multiple"
              selected={selectedDates}
              onSelect={handleSelect}
              disabled={!editMode}
              modifiers={{
                fully: fullyAvailableDates.map(parseDate),
                partial: partialAvailableDates,
                mine: selectedDates,
              }}
              modifiersClassNames={{
                fully: "bg-success text-white rounded-circle",
                partial: "bg-warning text-dark rounded-circle",
                mine: "border border-primary rounded-circle",
              }}
            />
          </div>

          {/* WINDOWS */}
          <div className="card mb-3 p-3">
            <h5>Best Available Windows</h5>

            {consecutiveWindows.length ? (
              consecutiveWindows.map((w, i) => (
                <div
                  key={i}
                  className={`window-item mb-2 p-2 border rounded ${
                    selectedWindow === w ? "bg-light border-success" : ""
                  }`}
                  onClick={() => setSelectedWindow(w)}
                >
                  <span className="badge bg-success">
                    {formatDisplayDate(w[0])} →{" "}
                    {formatDisplayDate(w[w.length - 1])}
                  </span>
                  <small className="ms-2 text-muted">({w.length} days)</small>
                </div>
              ))
            ) : (
              <p className="text-muted">No valid windows found</p>
            )}
          </div>

          {/* FORWARD FORM */}
          <div className="card mb-3 p-3">
            <h5>Forward Trip Form</h5>

            <div className="mb-2">
              <b>Start:</b> {formData.startDate || "-"}
            </div>
            <div className="mb-2">
              <b>End:</b> {formData.endDate || "-"}
            </div>
            <div className="mb-2">
              <b>User IDs:</b> {formData.userIds.join(", ")}
            </div>

            <button className="btn btn-primary mt-2" onClick={submitForm}>
              Submit Trip
            </button>
          </div>

          {/* INDIVIDUAL AVAILABILITY */}
          <div className="card p-3">
            <h5>Individual Availability</h5>

            {users.map((u) => (
              <div key={u.id} className="mb-3">
                <div className="fw-bold">{u.name}</div>
                <div className="d-flex flex-wrap gap-2">
                  {(availability[u.id] || []).map((d) => (
                    <span key={d} className="badge bg-light text-dark border">
                      {formatDisplayDate(d)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
