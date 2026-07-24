import { useState, useEffect, createContext, useContext } from "react";
import { getTripDetails, getTripMembers } from "../api";
import type { Trip, User, Itinerary } from "../models";

// Create a context for trip details
const TripDetailsContext = createContext<ReturnType<
  typeof useProvideTripDetails
> | null>(null);

export const useTripDetails = () => {
  const context = useContext(TripDetailsContext);
  if (!context) {
    throw new Error("useTripDetails must be used within a TripDetailsProvider");
  }
  return context;
};

export const TripDetailsProvider: React.FC<{
  tripId: string | undefined;
  children: React.ReactNode;
}> = ({ tripId, children }) => {
  const tripDetails = useProvideTripDetails(tripId);
  return (
    <TripDetailsContext.Provider value={tripDetails}>
      {children}
    </TripDetailsContext.Provider>
  );
};

function useProvideTripDetails(tripId: string | undefined) {
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

  const addItineraryItem = (newItem: Itinerary) => {
    if (trip) {
      setTrip({
        ...trip,
        itinerary_ids: [...(trip.itinerary_ids || []), newItem.id],
      });
    }
  };

  return {
    trip,
    members,
    loading,
    error,
    refresh,
    setTripDetails,
    addItineraryItem,
  };
}
