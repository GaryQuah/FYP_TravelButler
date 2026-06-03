import { useState, useEffect, useCallback } from "react";
import { type AvailabilityTracker } from "../models/availability_tracker";
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
      const response = await fetch("/api/availability-trackers/", {
        headers: {
          "X-User-Id": user.user_id,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch availability trackers");
      }
      const data = await response.json();
      setTrackers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrackers();
  }, [fetchTrackers]);

  return { trackers, loading, refetchTrackers: fetchTrackers };
}
