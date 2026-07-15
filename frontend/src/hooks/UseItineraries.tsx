import { useState, useEffect, useCallback } from "react";
import {
  getItinerariesByIds,
  addItinerary as apiAddItinerary,
  deleteItinerary as apiDeleteItinerary,
  updateItinerary as apiUpdateItinerary,
} from "../api";

import { type Itinerary, type ItineraryCreationData } from "../models";

export function useItineraries(
  tripId: string | undefined,
  itineraryIds: string[] | undefined,
) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItineraries = useCallback(async () => {
    if (!itineraryIds || itineraryIds.length === 0) {
      setItineraries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const itinerariesData = await getItinerariesByIds(itineraryIds);
      setItineraries(itinerariesData);
    } catch (e) {
      setError("Failed to load itineraries.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [itineraryIds]);

  const addItinerary = async (itineraryData: ItineraryCreationData) => {
    if (!tripId) return;

    try {
      const newItinerary = await apiAddItinerary(tripId, itineraryData);
      setItineraries((prevItineraries) => [...prevItineraries, newItinerary]);
    } catch (e) {
      console.error("Failed to add itinerary:", e);
      // Optionally, set an error state to show in the UI
    }
  };

  const deleteItinerary = async (itineraryId: string) => {
    if (!tripId) return;

    try {
      await apiDeleteItinerary(tripId, itineraryId);
      setItineraries((prevItineraries) =>
        prevItineraries.filter((itinerary) => itinerary.id !== itineraryId),
      );
    } catch (e) {
      console.error("Failed to delete itinerary:", e);
      // Optionally, set an error state to show in the UI
    }
  };

  const updateItinerary = async (
    itineraryId: string,
    itineraryData: Partial<ItineraryCreationData>,
  ) => {
    if (!tripId) return;

    try {
      const updatedItinerary = await apiUpdateItinerary(
        tripId,
        itineraryId,
        itineraryData,
      );
      setItineraries((prevItineraries) =>
        prevItineraries.map((itinerary) =>
          itinerary.id === itineraryId ? updatedItinerary : itinerary,
        ),
      );
    } catch (e) {
      console.error("Failed to update itinerary:", e);
      // Optionally, set an error state to show in the UI
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  return {
    itineraries,
    loading,
    error,
    addItinerary,
    deleteItinerary,
    updateItinerary,
  };
}
