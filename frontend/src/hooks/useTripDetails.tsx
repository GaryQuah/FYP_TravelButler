import React, { useState, useEffect } from "react";
import {
  getTripDetails,
  getTripMembers,
  type Trip,
  type User,
} from "../models/api";

export function useTripDetails(tripId: string | undefined) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const tripDetails = await getTripDetails(tripId);
        setTrip(tripDetails);

        const tripMembers = await getTripMembers(tripId);
        setMembers(tripMembers);
      } catch (e) {
        setError("Failed to load trip details.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [tripId]);

  return { trip, members, loading, error };
}
