/*
Custom hook to manage trip data fetching and creation. 
It provides functions to fetch the list of trips and create new trips, as well as state variables to track the list of trips and loading status.
*/
import { useState, useEffect } from "react";
import {
  createTrip as apiCreateTrip,
  type Trip,
  type TripCreationData,
} from "../models/api";

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trips");
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewTrip = async (
    tripData: Omit<TripCreationData, "user_ids">,
    userId: string,
  ) => {
    try {
      const completeTripData: TripCreationData = {
        ...tripData,
        user_ids: [userId],
      };
      await apiCreateTrip(completeTripData);
      // Refresh the list after creation
      fetchTrips();
    } catch (error) {
      console.error("Failed to create trip:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return { trips, loading, createNewTrip, refreshTrips: fetchTrips };
}
