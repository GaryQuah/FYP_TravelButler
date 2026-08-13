import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ItineraryCard from "../../components/cards/ItineraryCard";
import AddItineraryModal from "../../components/modals/AddItineraryModal";
import { useItineraries } from "../../hooks/UseItineraries";
import { useTripDetails } from "../../hooks/useTripDetails";
import {
  exportItinerariesToCalendar,
  getGoogleCalendarStatus,
} from "../../api";
import { analyzeDescription } from "../../api/gemini.ts";
import { addExpenditure } from "../../api/budget.ts";
import type { Itinerary, ItineraryCreationData } from "../../models";

export function TripItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, loading: tripLoading, error: tripError } = useTripDetails();
  const {
    itineraries,
    loading: itinerariesLoading,
    error: itinerariesError,
    addItinerary,
    deleteItinerary,
    updateItinerary,
  } = useItineraries(tripId, trip?.itinerary_ids);
  const [showModal, setShowModal] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expenditure, setExpenditure] = useState<{
    amount: number;
    item: string;
    category: string;
  } | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(
    null,
  );

  const handleEditItinerary = (itineraryId: string) => {
    const itineraryToEdit = itineraries.find((item) => item.id === itineraryId);
    if (itineraryToEdit) {
      setEditingItinerary(itineraryToEdit);
      setShowModal(true);
    }
  };

  const handleSaveItinerary = async (itineraryData: ItineraryCreationData) => {
    await addItinerary(itineraryData);
    setShowModal(false);
    if (itineraryData.description) {
      try {
        const result = await analyzeDescription(itineraryData.description);
        if (result && result.expenditure) {
          setExpenditure(result.expenditure);
          setShowConfirmation(true);
        }
      } catch (error) {
        console.error("Failed to analyze description:", error);
      }
    }
  };

  const handleUpdateItinerary = async (
    itineraryData: ItineraryCreationData,
  ) => {
    if (!editingItinerary) return;
    await updateItinerary(editingItinerary.id, itineraryData);
    setShowModal(false);
    setEditingItinerary(null);
  };

  const handleConfirmAddExpenditure = async () => {
    if (expenditure && tripId) {
      await addExpenditure(tripId, expenditure);
      setShowConfirmation(false);
      setExpenditure(null);
    }
  };

  if (tripLoading) {
    return <div>Loading trip details...</div>;
  }

  if (tripError) {
    return <div>{tripError}</div>;
  }

  useEffect(() => {
    checkGoogleCalendarStatus();
  }, []);

  const checkGoogleCalendarStatus = async () => {
    try {
      const status = await getGoogleCalendarStatus();
      setGoogleConnected(status.connected);
    } catch (err) {
      console.error("Failed to check Google Calendar status:", err);
    }
  };

  const handleExportEntireTrip = async () => {
    if (!itineraries || itineraries.length === 0) return;

    setExportLoading(true);
    setExportMessage(null);

    try {
      const itineraryIds = itineraries.map((item) => item.id);
      const result = await exportItinerariesToCalendar(itineraryIds);
      setExportMessage(
        `${result.message} ${result.created_events.length} events created.`,
      );
    } catch (err: any) {
      setExportMessage(`Export failed: ${err.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  if (!trip) {
    return <div>Trip not found.</div>;
  }

  return (
    <>
      <div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>Add Itinerary
        </button>
        {googleConnected && itineraries && itineraries.length > 0 && (
          <button
            className="btn btn-success ms-2"
            onClick={handleExportEntireTrip}
            disabled={exportLoading}
          >
            {exportLoading ? (
              "Exporting..."
            ) : (
              <>
                <i className="bi bi-calendar-plus me-2"></i>
                Export Entire Trip to Google Calendar
              </>
            )}
          </button>
        )}
        {exportMessage && (
          <div
            className={`mt-2 alert ${exportMessage.includes("failed") ? "alert-danger" : "alert-success"}`}
          >
            {exportMessage}
          </div>
        )}
        {!googleConnected && (
          <div className="mt-2 alert alert-info">
            <a href="/settings">Connect your Google Calendar</a> in settings to
            export itineraries.
          </div>
        )}
      </div>
      {showModal && (
        <AddItineraryModal
          onClose={() => {
            setShowModal(false);
            setEditingItinerary(null);
          }}
          onSave={async (itineraryData) => {
            if (editingItinerary) {
              await handleUpdateItinerary(itineraryData);
            } else {
              await handleSaveItinerary(itineraryData);
            }
          }}
          initialData={editingItinerary ?? undefined}
        />
      )}

      {showConfirmation && expenditure && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Add to Budget?</h5>
              <p>
                Would you like to add an expenditure of {expenditure.amount} for
                "{expenditure.item}" under the category "{expenditure.category}"
                to your budget?
              </p>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setShowConfirmation(false)}
                >
                  No
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmAddExpenditure}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          {itinerariesLoading && <p>Loading itinerary...</p>}
          {itinerariesError && (
            <p className="text-danger">{itinerariesError}</p>
          )}
          <div className="row">
            {(() => {
              if (!itineraries || itineraries.length === 0) {
                return (
                  !itinerariesLoading && (
                    <p>No itinerary items found. Add one to get started!</p>
                  )
                );
              }

              const sortedItineraries = [...itineraries].sort((a, b) => {
                const aDateTime = new Date(a.start_time).toISOString();
                const bDateTime = new Date(b.start_time).toISOString();
                return aDateTime.localeCompare(bDateTime);
              });

              let lastDate: string | null = null;

              return sortedItineraries.map((item) => {
                const itemDate = new Date(item.start_time).toLocaleDateString(
                  undefined,
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                );

                const showHeader = itemDate !== lastDate;
                if (showHeader) {
                  lastDate = itemDate;
                }

                return (
                  <React.Fragment key={item.id}>
                    {showHeader && (
                      <div className="col-12 mt-4">
                        <h2>{itemDate}</h2>
                        <hr />
                      </div>
                    )}
                    <div className="col-md-6 mb-4">
                      <ItineraryCard
                        id={item.id}
                        activity_name={item.activity_name}
                        start_time={item.start_time}
                        end_time={item.end_time}
                        description={item.description}
                        onDelete={deleteItinerary}
                        onEdit={handleEditItinerary}
                        googleConnected={googleConnected}
                      />
                    </div>
                  </React.Fragment>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </>
  );
}
