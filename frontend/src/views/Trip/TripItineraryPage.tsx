import LoadingOverlay from "../../components/LoadingOverlay";
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import ItineraryCard from "../../components/cards/ItineraryCard";
import AddItineraryModal from "../../components/modals/AddItineraryModal";
import ItineraryAnalysisModal from "../../components/modals/ItineraryAnalysisModal";
import { ItineraryModal } from "../../components/modals/ItineraryModal";
import { DateSelectionModal } from "../../components/modals/DateSelectionModal";
import { useItineraries } from "../../hooks/UseItineraries";
import { useTripDetails } from "../../hooks/useTripDetails";
import {
  exportItinerariesToCalendar,
  getGoogleCalendarStatus,
} from "../../api";

import { analyzeDescription, analyzeItinerary } from "../../api/gemini.ts";
import { addExpenditure } from "../../api/budget.ts";
import type { Itinerary, ItineraryCreationData } from "../../models";

import "../..//assets/css/TripItineraryPage.css";

import "../..//assets/css/TripItineraryPage.css";

export function TripItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
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
  const [, setAlert] = useState<{ message: string; type: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expenditure, setExpenditure] = useState<{
    amount: number;
    item: string;
    category: string;
  } | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(
    null,
  );
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedItinerary, setSelectedItinerary] =
    useState<ItineraryCreationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  useEffect(() => {
    const checkGoogleCalendarStatus = async () => {
      try {
        const status = await getGoogleCalendarStatus();
        setGoogleConnected(status.connected);
      } catch (error) {
        console.error("Failed to check Google Calendar status:", error);
      }
    };

    checkGoogleCalendarStatus();
  }, []);

  const handleAddToItinerary = (item: ItineraryCreationData) => {
    setSelectedItinerary(item);
    setIsModalOpen(true);
  };

  const handleAddAllToItinerary = async () => {
    setIsDateModalOpen(true);
  };

  const handleSaveAllItineraries = async (date: Date) => {
    if (!tripId || !analysis?.recommendations) return;

    try {
      const dateString = formatDateForInput(date);
      if (!dateString) {
        setAlert({ message: "Invalid date selected.", type: "danger" });
        return;
      }

      const formatTimeFromString = (dateTimeString: string): string => {
        const timePart = dateTimeString.split("T")[1];
        if (timePart) {
          const [hours, minutes] = timePart.split(":");
          return `${hours}:${minutes}`;
        }
        return ""; // Fallback
      };

      const itineraryPromises = analysis.recommendations.map((rec: any) => {
        const startTime = formatTimeFromString(rec.gap_start_time);
        const endTime = formatTimeFromString(rec.gap_end_time);

        const newItem = {
          activity_name: rec.recommendation.activity_name,
          start_time: `${dateString}T${startTime}`,
          end_time: `${dateString}T${endTime}`,
          description: rec.recommendation.description,
        };
        return addItinerary(newItem);
      });

      await Promise.all(itineraryPromises);

      setIsDateModalOpen(false);
      setAlert({
        message:
          "All recommended activities have been added to your itinerary!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to add all itinerary items:", error);
      setAlert({
        message:
          "Failed to add all activities. Please check the console for details.",
        type: "danger",
      });
    }
  };

  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return undefined;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleAnalyzeItinerary = async () => {
    if (!itineraries || itineraries.length === 0) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeItinerary(itineraries);
      setAnalysis(result);
      setShowAnalysisModal(true);
    } catch (error) {
      console.error("Failed to analyze itinerary:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  const handleEditItinerary = (itineraryId: string) => {
    const itineraryToEdit = itineraries.find((item) => item.id === itineraryId);
    if (itineraryToEdit) {
      setEditingItinerary(itineraryToEdit);
      setShowModal(true);
    }
  };

  const handleSaveItinerary = async (data: ItineraryCreationData) => {
    if (!tripId) return;
    try {
      await addItinerary(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add itinerary item:", error);
    }
  };

  const handleExportEntireTrip = async () => {
    if (!itineraries?.length) return;

    setExportLoading(true);
    setExportMessage(null);
    try {
      const result = await exportItinerariesToCalendar(
        itineraries.map((itinerary) => itinerary.id),
      );
      setExportMessage(
        result.errors.length > 0
          ? `Export completed with ${result.errors.length} error(s).`
          : result.message || "Itineraries exported successfully.",
      );
    } catch (error) {
      console.error("Failed to export itineraries:", error);
      setExportMessage("Export failed. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleSaveRecommendedItinerary = async (
    itineraryData: ItineraryCreationData,
  ) => {
    try {
      await addItinerary(itineraryData);
      setIsModalOpen(false); // Correctly close the ItineraryModal

      // Remove the added itinerary from the analysis recommendations
      if (analysis && analysis.recommendations) {
        const updatedRecommendations = analysis.recommendations.filter(
          (rec: Itinerary) => rec.activity_name !== itineraryData.activity_name,
        );
        setAnalysis({ ...analysis, recommendations: updatedRecommendations });
      }

      // Handle expenditure analysis
      if (itineraryData.description) {
        const result = await analyzeDescription(itineraryData.description);
        if (result && result.expenditure) {
          setExpenditure(result.expenditure);
          setShowConfirmation(true);
        }
      }
    } catch (error) {
      console.error("Failed to save recommended itinerary:", error);
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

  if (tripError) {
    return <div>{tripError}</div>;
  }

  return (
    <>
      <LoadingOverlay show={tripLoading || itinerariesLoading} />
      <div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>Add Itinerary
        </button>
        <button
          className="btn btn-info ms-2 btn-itinerary-analysis"
          onClick={handleAnalyzeItinerary}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            "Analyzing..."
          ) : (
            <>
              <i className="bi bi-cpu me-2"></i>
              Itinerary Analysis
            </>
          )}
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

      {showAnalysisModal && (
        <ItineraryAnalysisModal
          onClose={() => setShowAnalysisModal(false)}
          analysis={analysis}
          onAddToItinerary={handleAddToItinerary}
          onAddAllToItinerary={handleAddAllToItinerary}
        />
      )}

      <ItineraryModal
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        onSave={handleSaveRecommendedItinerary}
        itinerary={selectedItinerary}
        tripStartDate={formatDateForInput(trip?.start_date)}
        tripEndDate={formatDateForInput(trip?.end_date)}
      />
      <DateSelectionModal
        show={isDateModalOpen}
        onHide={() => setIsDateModalOpen(false)}
        onSave={handleSaveAllItineraries}
        minDate={formatDateForInput(trip?.start_date)}
        maxDate={formatDateForInput(trip?.end_date)}
      />

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
                return a.start_time.localeCompare(b.start_time);
              });

              let lastDate: string | null = null;

              return sortedItineraries.map((item) => {
                const itemDate = item.start_time.split("T")[0];
                const formattedDate = new Date(
                  item.start_time,
                ).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                const showHeader = itemDate !== lastDate;
                if (showHeader) {
                  lastDate = itemDate;
                }

                return (
                  <React.Fragment key={item.id}>
                    {showHeader && (
                      <div
                        id={itemDate}
                        className="col-12 mt-4 date-header-anchor"
                      >
                        <h2>{formattedDate}</h2>
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
