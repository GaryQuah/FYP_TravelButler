import { useState, useEffect, useCallback } from "react";
import {
  deleteAvailabilityTracker as apiDeleteAvailabilityTracker,
  getAvailabilityTrackers as apiGetAvailabilityTrackers,
  updateAvailabilityTracker as apiUpdateAvailabilityTracker,
} from "../api/availability";
import type {
  AvailabilityTracker,
  AvailabilityTrackerCreationData,
} from "../models";
import { useUser } from "../models/UserContext";

export function useAvailabilityTrackers() {
  const [trackers, setTrackers] = useState<AvailabilityTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchTrackers = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await apiGetAvailabilityTrackers();
      setTrackers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteTracker = async (trackerId: string) => {
    try {
      await apiDeleteAvailabilityTracker(trackerId);
      setTrackers((prevTrackers) =>
        prevTrackers.filter((tracker) => tracker.id !== trackerId),
      );
    } catch (error) {
      console.error("Failed to delete availability tracker:", error);
    }
  };

  const updateTracker = async (
    trackerId: string,
    trackerData: Partial<AvailabilityTrackerCreationData>,
  ) => {
    try {
      const updatedTracker = await apiUpdateAvailabilityTracker(
        trackerId,
        trackerData,
      );
      setTrackers((prevTrackers) =>
        prevTrackers.map((tracker) =>
          tracker.id === trackerId ? updatedTracker : tracker,
        ),
      );
    } catch (error) {
      console.error("Failed to update availability tracker:", error);
    }
  };

  useEffect(() => {
    fetchTrackers();
  }, [fetchTrackers]);

  return {
    trackers,
    loading,
    refetchTrackers: fetchTrackers,
    deleteTracker,
    updateTracker,
  };
}
