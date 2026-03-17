import React, { useState, useEffect } from "react";
import { getTripDetails, getTripMembers, type Trip, type User } from "../api";

export function useTripDetails(tripId: string | undefined) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async (currentTripId: string) => {
    setLoading(true);
    setError(null);
    try {
      const tripDetails = await getTripDetails(currentTripId);
      setTrip(tripDetails);

      const tripMembers = await getTripMembers(currentTripId);
      setMembers(tripMembers);
    } catch (e) {
      setError("Failed to load trip details.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchDetails(tripId);
    } else {
      setLoading(false);
    }
  }, [tripId]);

  const refresh = () => {
    if (tripId) {
      fetchDetails(tripId);
    }
  };

  const setTripDetails = (newTrip: Trip) => {
    setTrip(newTrip);
  };

  return { trip, members, loading, error, refresh, setTripDetails };
}
