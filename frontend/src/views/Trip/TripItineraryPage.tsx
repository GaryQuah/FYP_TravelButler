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
import { addExpenditure, getTripBudget } from "../../api/budget.ts";
import type { Itinerary, ItineraryCreationData } from "../../models";

import "../..//assets/css/TripItineraryPage.css";

import "../..//assets/css/TripItineraryPage.css";

export function TripItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const { trip, loading: tripLoading } = useTripDetails();
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
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);
  const [showExpenditureModal, setShowExpenditureModal] = useState(false);
  const [expenditures, setExpenditures] = useState<
    Array<{
      amount: number;
      item: string;
      category: string;
      selectedCategory: string;
      customCategory: string;
    }>
  >([]);
  const [expenditureCount, setExpenditureCount] = useState(0);
  const [budgetCategories, setBudgetCategories] = useState<string[]>([]);
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
      setAlert({ message: "Itinerary analysis completed.", type: "success" });
    } catch (error) {
      console.error("Failed to analyze itinerary:", error);
      setAlert({
        message: "Failed to analyze itinerary. Please try again.",
        type: "danger",
      });
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

  const checkDescriptionForExpenditure = async (description: string) => {
    if (!description.includes("$")) return;

    try {
      const result = await analyzeDescription(description);
      const detectedExpenditures = result?.expenditures ??
        (result?.expenditure ? [result.expenditure] : []);
      if (detectedExpenditures.length === 0) {
        setAlert({
          message: "No expenses were detected in the description.",
          type: "success",
        });
        return;
      }

      const budget = tripId ? await getTripBudget(tripId) : null;
      const categories =
        budget?.categories.map((category: { name: string }) => category.name) ??
        [];
      setBudgetCategories(categories);
      setExpenditures(
        detectedExpenditures.map(
          (detectedExpenditure: {
            amount: number;
            item: string;
            category: string;
          }) => {
            const detectedCategory = detectedExpenditure.category?.trim() ?? "";
            const existingCategory = categories.find(
              (category: string) =>
                category.toLowerCase() === detectedCategory.toLowerCase(),
            );
            return {
              ...detectedExpenditure,
              selectedCategory: existingCategory ?? "__new__",
              customCategory: existingCategory ? "" : detectedCategory,
            };
          },
        ),
      );
      setExpenditureCount(detectedExpenditures.length);
      setShowExpenditureModal(true);
      setAlert({
        message: `${detectedExpenditures.length} expenditure${detectedExpenditures.length === 1 ? "" : "s"} found.`,
        type: "success",
      });
    } catch (error) {
      console.error("Failed to analyze itinerary description:", error);
      setAlert({
        message: "Unable to analyze the itinerary description.",
        type: "danger",
      });
    }
  };

  const handleSaveItinerary = async (data: ItineraryCreationData) => {
    if (!tripId) return;
    try {
      await addItinerary(data);
      setAlert({ message: "Activity added to itinerary!", type: "success" });
      await checkDescriptionForExpenditure(data.description);
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

      await checkDescriptionForExpenditure(itineraryData.description);
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

  const handleConfirmAddExpenditure = async (index: number) => {
    if (!tripId) return;
    const expenditure = expenditures[index];
    if (!expenditure) return;

    const category =
      expenditure.selectedCategory === "__new__"
        ? expenditure.customCategory.trim()
        : expenditure.selectedCategory;
    if (!category) return;

    try {
      await addExpenditure(tripId, {
        amount: expenditure.amount,
        item: expenditure.item,
        category,
      });
      setExpenditures((current) =>
        current.filter((_, expenditureIndex) => expenditureIndex !== index),
      );
      if (expenditures.length === 1) {
        setShowExpenditureModal(false);
        setAlert({
          message: "Expenditure created successfully.",
          type: "success",
        });
      } else {
        setAlert({
          message: "Expenditure created successfully.",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Failed to create expenditure:", error);
      setAlert({
        message: "Failed to create expenditure. Please try again.",
        type: "danger",
      });
    }
  };

  return (
    <>
      <LoadingOverlay show={tripLoading || itinerariesLoading} />
      <div>
        {alert && (
          <div
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert"
          >
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlert(null)}
            ></button>
          </div>
        )}
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

      {showExpenditureModal && expenditures.length > 0 && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-3">
              <h5>{expenditureCount} expenditures found</h5>
              <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
                {expenditures.map((expenditure, index) => (
                  <div className="card mb-3" key={`${expenditure.item}-${index}`}>
                    <div className="card-body">
                      <h6 className="card-title">Expenditure {index + 1}</h6>
                      <label className="form-label">Item</label>
                      <input
                        className="form-control mb-2"
                        value={expenditure.item}
                        onChange={(event) =>
                          setExpenditures((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, item: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                      <label className="form-label">Amount</label>
                      <input
                        className="form-control mb-2"
                        type="number"
                        min="0"
                        step="0.01"
                        value={expenditure.amount}
                        onChange={(event) =>
                          setExpenditures((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    amount: Number(event.target.value),
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                      <label className="form-label">Category</label>
                      <select
                        className="form-select mb-2"
                        value={expenditure.selectedCategory}
                        onChange={(event) =>
                          setExpenditures((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    selectedCategory: event.target.value,
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        {budgetCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                        <option value="__new__">Add new category...</option>
                      </select>
                      {expenditure.selectedCategory === "__new__" && (
                        <input
                          className="form-control mb-3"
                          placeholder="New category name"
                          value={expenditure.customCategory}
                          onChange={(event) =>
                            setExpenditures((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      customCategory: event.target.value,
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      )}
                      <button
                        className="btn btn-primary"
                        onClick={() => handleConfirmAddExpenditure(index)}
                        disabled={
                          !expenditure.item.trim() ||
                          !Number.isFinite(expenditure.amount) ||
                          expenditure.amount < 0 ||
                          !(
                            expenditure.selectedCategory &&
                            (expenditure.selectedCategory !== "__new__" ||
                              expenditure.customCategory.trim())
                          )
                        }
                      >
                        Create Expenditure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    setShowExpenditureModal(false);
                    setExpenditures([]);
                  }}
                >
                  Cancel
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
