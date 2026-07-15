/*
Custom hook to manage trip data fetching and creation. 
It provides functions to fetch the list of trips and create new trips, as well as state variables to track the list of trips and loading status.
*/
import { useState, useEffect } from "react";
import {
  createTrip as apiCreateTrip,
  deleteTrip as apiDeleteTrip,
  getTrips as apiGetTrips,
  updateTrip as apiUpdateTrip,
} from "../api";

import { type Trip, type TripCreationData } from "../models";

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(window.localStorage.getItem("user") || "null");
      if (user && user.user_id) {
        const data = await apiGetTrips(user.user_id);
        setTrips(data);
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewTrip = async (
    tripData: Omit<TripCreationData, "user_ids">,
    userIds: string[],
  ): Promise<Trip | null> => {
    try {
      const completeTripData: TripCreationData = {
        ...tripData,
        user_ids: userIds,
      };
      const newTrip = await apiCreateTrip(completeTripData);
      // Refresh the list after creation
      fetchTrips();
      return newTrip;
    } catch (error) {
      console.error("Failed to create trip:", error);
      return null;
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
      // Optionally, show an error message to the user
    }
  };

  const updateTrip = async (
    tripId: string,
    tripData: Partial<TripCreationData>,
  ): Promise<Trip | null> => {
    try {
      const updatedTrip = await apiUpdateTrip(tripId, tripData);
      // Refresh the list after update
      fetchTrips();
      return updatedTrip;
    } catch (error) {
      console.error("Failed to update trip:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return {
    trips,
    loading,
    createNewTrip,
    deleteTrip,
    updateTrip,
    refreshTrips: fetchTrips,
  };
}
