import AddPollModal from "../../components/modals/AddPollModal";
import { useState } from "react";

export function TripPollPage() {
  //Modal Control
  const [showModal, setShowModal] = useState(false);
  const [showAddPollModal, setShowAddPollModal] = useState(false);
  const [addPollError, setAddPollError] = useState<string | null>(null);

  // const handleSavePoll = async (itineraryData: ItineraryCreationData) => {
  //   await addItinerary(itineraryData);
  //   setShowModal(false);
  // };

  // const handleAddPoll = async () => {
  //   if (!tripId) return;
  //   try {
  //     await inviteUserToTrip(tripId, email);
  //     setShowAddUserModal(false);
  //     setAddUserError(null);
  //     refreshTripDetails(); // Refresh the trip details and members
  //   } catch (error: any) {
  //     setAddUserError(error.message || "Failed to add user.");
  //   }
  // };

  return <></>;
}
