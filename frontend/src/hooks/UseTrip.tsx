/*
Custom hook to manage trip data fetching and creation. 
It provides functions to fetch the list of trips and create new trips, as well as state variables to track the list of trips and loading status.
*/
import { useState, useEffect } from "react";
import {
  createTrip as apiCreateTrip,
  deleteTrip as apiDeleteTrip,
  getTrips as apiGetTrips,
  inviteUserToTrip as apiInviteUserToTrip,
  type Trip,
  type TripCreationData,
} from "../models/api";

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await apiGetTrips();
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

  const deleteTrip = async (tripId: string) => {
    try {
      await apiDeleteTrip(tripId);
      // Remove the trip from the local state to update the UI
      setTrips((prevTrips) =>
        prevTrips.filter((trip) => trip.trip_id !== tripId),
      );
    } catch (error) {
      console.error("Failed to delete trip:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const getTripById = (tripId: string): Trip | undefined => {
    return trips.find((trip) => trip.trip_id === tripId);
  };

  const inviteUserToTrip = async (tripId: string, email: string) => {
    try {
      await apiInviteUserToTrip(tripId, email);
    } catch (error) {
      console.error("Failed to invite user:", error);
      throw error;
    }
  };

  return {
    trips,
    loading,
    createNewTrip,
    deleteTrip,
    getTripById,
    inviteUserToTrip,
    refreshTrips: fetchTrips,
  };
}
