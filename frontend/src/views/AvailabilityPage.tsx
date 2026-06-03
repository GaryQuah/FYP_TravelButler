import React, { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import { useUser } from "../models/UserContext";
import type { User } from "../models";
import { inviteUserToTracker } from "../api/user";
import { getTrackerMembers } from "../api/availability";
import AddUserModal from "../components/modals/AddUserModal";
import AddTripModal from "../components/modals/AddTripModal";
import { useTrips } from "../hooks/UseTrip";

// Type definitions
interface AvailabilityMap {
  [userId: string]: string[];
}

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

function AvailabilityPage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const navigate = useNavigate();
  const { createNewTrip } = useTrips();
  const { user: currentUser } = useUser();
  const [tracker, setTracker] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [minConsecutiveDays, setMinConsecutiveDays] = useState(3);
  const [selectedWindow, setSelectedWindow] = useState<string[] | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrackerData = async () => {
    if (!trackerId || !currentUser) return;
    setLoading(true);
    try {
      // Fetch tracker details (you might still need this for other info)
      const trackerResponse = await fetch(
        `/api/availability-trackers/${trackerId}`,
        {
          headers: {
            "X-User-Id": currentUser.user_id,
          },
        },
      );
      const trackerData = await trackerResponse.json();
      setTracker(trackerData);

      // Fetch all members in one go
      const fetchedUsers = await getTrackerMembers(trackerId);
      setUsers(fetchedUsers);
      setSelectedUserIds(fetchedUsers.map((u) => u.user_id));

      setAvailability(trackerData.availability || {});
      setDraft(trackerData.availability?.[currentUser.user_id] || []);
    } catch (error) {
      console.error("Failed to fetch tracker data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, [trackerId, currentUser]);

  const handleAddUser = async (email: string) => {
    if (!trackerId) return;
    try {
      await inviteUserToTracker(trackerId, email);
      setShowAddUserModal(false);
      setAddUserError(null);
      fetchTrackerData(); // Refresh data to show the new user
    } catch (error: any) {
      setAddUserError(error.message || "Failed to add user.");
    }
  };

  const currentUserDates = editMode
    ? draft
    : (currentUser && availability[currentUser.user_id]) || [];

  const handleSelect = (dates: Date[] | undefined) => {
    if (!dates || !editMode) return;
    setDraft(dates.map(formatDate));
  };

  const saveChanges = async () => {
    if (!trackerId || !currentUser) return;
    try {
      await fetch(
        `/api/availability-trackers/${trackerId}/availability/${currentUser.user_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      setAvailability((prev: AvailabilityMap) => ({
        ...prev,
        [currentUser.user_id]: draft,
      }));
      setEditMode(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  };

  const cancelChanges = () => {
    setDraft((currentUser && availability[currentUser.user_id]) || []);
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

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <style>{`
        .window-item:hover {
          background-color: #f1f3f5;
          cursor: pointer;
          transition: 0.2s;
        }
      `}</style>

        {showAddUserModal && (
          <AddUserModal
            onClose={() => setShowAddUserModal(false)}
            onAddUser={handleAddUser}
            error={addUserError}
          />
        )}

        {showAddTripModal && selectedFormWindow && tracker && (
          <AddTripModal
            onClose={() => setShowAddTripModal(false)}
            initialData={{
              trip_name: tracker.name,
              start_date: parseDate(selectedFormWindow[0]),
              end_date: parseDate(
                selectedFormWindow[selectedFormWindow.length - 1],
              ),
              description: `Trip planned from ${tracker.name} availability tracker.`,
            }}
            onSave={async (tripData) => {
              const newTrip = await createNewTrip(tripData, tracker.user_ids);
              if (newTrip) {
                setShowAddTripModal(false);
                navigate(`/trip/${newTrip.trip_id}`);
              }
            }}
          />
        )}

        <div className="d-flex justify-content-between mb-3">
          <div>
            <h2 className="fw-bold">
              Availability Planner{tracker ? `: ${tracker.name}` : ""}
            </h2>
            <p className="text-muted mb-0">
              Plan trips based on overlapping availability
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowAddUserModal(true)}
            >
              Add User
            </button>
            {!editMode ? (
              <button
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
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
        </div>

        <div className="row g-4">
          {/* USERS */}
          <div className="col-md-3">
            <div className="card p-3">
              <h5>Users</h5>

              {users.map((u) => (
                <div
                  key={u.user_id}
                  className="d-flex justify-content-between border rounded p-2 mb-2"
                >
                  <div>
                    <div className="fw-semibold">{u.name}</div>
                    {currentUser && u.user_id === currentUser.user_id && (
                      <small className="text-primary">You</small>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u.user_id)}
                    onChange={() => toggleUserVisibility(u.user_id)}
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
              <h5>Finalize Trip</h5>

              <div className="mb-2">
                <b>Start:</b>{" "}
                {selectedFormWindow
                  ? formatDisplayDate(selectedFormWindow[0])
                  : "-"}
              </div>
              <div className="mb-2">
                <b>End:</b>{" "}
                {selectedFormWindow
                  ? formatDisplayDate(
                      selectedFormWindow[selectedFormWindow.length - 1],
                    )
                  : "-"}
              </div>

              <button
                className="btn btn-primary mt-2"
                onClick={() => setShowAddTripModal(true)}
                disabled={!selectedFormWindow}
              >
                Create Trip
              </button>
            </div>

            {/* INDIVIDUAL AVAILABILITY */}
            <div className="card p-3">
              <h5>Individual Availability</h5>

              {users.map((u) => (
                <div key={u.user_id} className="mb-3">
                  <div className="fw-bold">{u.name}</div>
                  <div className="d-flex flex-wrap gap-2">
                    {(availability[u.user_id] || []).map((d) => (
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
    </>
  );
}

export default AvailabilityPage;
