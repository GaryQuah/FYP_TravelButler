import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  deleteDocument,
  getDocuments,
  uploadDocument,
  type Document,
} from "../../api/document";
import { analyzeDocument } from "../../api/gemini";
import { addItinerary } from "../../api/itinerary";
import { addExpenditure } from "../../api/budget";

import { UploadDocumentModal } from "../../components/modals/UploadDocumentModal";
import "./TripDocumentPage.css";

type AnalysisActionType = "itinerary" | "budget";

interface AnalysisAction {
  type: AnalysisActionType;
  payload: Record<string, unknown>;
}

interface ItineraryDraft {
  activity_name: string;
  start_time: string;
  end_time: string;
  description: string;
}

interface BudgetDraft {
  item: string;
  amount: string;
  category: string;
}

const EMPTY_ITINERARY_DRAFT: ItineraryDraft = {
  activity_name: "",
  start_time: "",
  end_time: "",
  description: "",
};

const EMPTY_BUDGET_DRAFT: BudgetDraft = {
  item: "",
  amount: "",
  category: "Miscellaneous",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStringValue(
  payload: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return "";
}

function formatForDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toDateTimeLocalString(payload: Record<string, unknown>): {
  start_time: string;
  end_time: string;
} {
  const startCandidate = getStringValue(payload, [
    "start_time",
    "departure_time",
    "datetime",
    "date",
  ]);
  const endCandidate = getStringValue(payload, ["end_time", "arrival_time"]);
  const timeCandidate = getStringValue(payload, ["time"]);

  const buildDate = (dateString: string): Date | null => {
    const parsed = new Date(dateString);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    return null;
  };

  let startDate = startCandidate ? buildDate(startCandidate) : null;
  if (!startDate && startCandidate && timeCandidate) {
    startDate = buildDate(`${startCandidate}T${timeCandidate}`);
  }

  let endDate = endCandidate ? buildDate(endCandidate) : null;
  if (!endDate && startDate) {
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  }

  return {
    start_time: startDate ? formatForDateTimeLocal(startDate) : "",
    end_time: endDate ? formatForDateTimeLocal(endDate) : "",
  };
}

function buildItineraryDraft(payload: Record<string, unknown>): ItineraryDraft {
  const { start_time, end_time } = toDateTimeLocalString(payload);
  const activity_name = getStringValue(payload, [
    "activity_name",
    "event",
    "title",
    "item",
    "flight",
    "flight_number",
  ]);
  const description = getStringValue(payload, [
    "description",
    "details",
    "route",
    "notes",
  ]);

  return {
    activity_name,
    start_time,
    end_time,
    description,
  };
}

function buildBudgetDraft(payload: Record<string, unknown>): BudgetDraft {
  const item = getStringValue(payload, ["item", "merchant", "name", "title"]);
  const amount = getStringValue(payload, ["amount", "total", "price"]);
  const category = getStringValue(payload, ["category"]) || "Miscellaneous";

  return {
    item,
    amount,
    category,
  };
}

function toRecordOrNull(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function buildAnalysisActions(analysis: unknown): AnalysisAction[] {
  if (!isRecord(analysis)) return [];

  const itineraryPayload =
    toRecordOrNull(analysis.itinerary) ??
    toRecordOrNull(analysis.itinerary_details) ??
    toRecordOrNull(analysis.ticket) ??
    toRecordOrNull(analysis.flight);

  const budgetPayload =
    toRecordOrNull(analysis.budget) ??
    toRecordOrNull(analysis.expenditure) ??
    toRecordOrNull(analysis.expense);

  const actions: AnalysisAction[] = [];

  const serialized = JSON.stringify(analysis).toLowerCase();
  const hasItinerarySignal =
    Boolean(itineraryPayload) ||
    analysis.itinerary_found === true ||
    analysis.ticket_found === true ||
    serialized.includes("ticket") ||
    serialized.includes("itinerary") ||
    serialized.includes("flight");

  const hasBudgetSignal =
    Boolean(budgetPayload) ||
    analysis.budget_found === true ||
    analysis.expenditure_found === true;

  if (hasItinerarySignal) {
    actions.push({
      type: "itinerary",
      payload: itineraryPayload ?? {},
    });
  }

  if (hasBudgetSignal) {
    actions.push({
      type: "budget",
      payload: budgetPayload ?? {},
    });
  }

  return actions;
}

export function TripDocumentPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analysisQueue, setAnalysisQueue] = useState<AnalysisAction[]>([]);
  const [activeAnalysisIndex, setActiveAnalysisIndex] = useState<number>(-1);
  const [itineraryDraft, setItineraryDraft] = useState<ItineraryDraft>(
    EMPTY_ITINERARY_DRAFT,
  );
  const [budgetDraft, setBudgetDraft] =
    useState<BudgetDraft>(EMPTY_BUDGET_DRAFT);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeAction =
    activeAnalysisIndex >= 0 ? analysisQueue[activeAnalysisIndex] : null;

  const fetchDocuments = async () => {
    if (!tripId) return;
    try {
      const data = await getDocuments(tripId);
      console.log("Fetched documents:", data);
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [tripId]);

  useEffect(() => {
    if (!activeAction) return;

    if (activeAction.type === "itinerary") {
      setItineraryDraft(buildItineraryDraft(activeAction.payload));
      return;
    }

    setBudgetDraft(buildBudgetDraft(activeAction.payload));
  }, [activeAction]);

  const moveToNextAnalysisAction = () => {
    const nextIndex = activeAnalysisIndex + 1;
    if (nextIndex < analysisQueue.length) {
      setActiveAnalysisIndex(nextIndex);
      return;
    }
    setAnalysisQueue([]);
    setActiveAnalysisIndex(-1);
  };

  const handleUpload = async (
    file: File,
    name: string,
    description: string,
  ) => {
    if (!tripId) {
      return;
    }

    try {
      await uploadDocument(tripId, file, name, description);
      console.log("File uploaded successfully");
      fetchDocuments();
      setIsModalOpen(false);

      if (file.type.startsWith("image/")) {
        handleImageAnalysis(file);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleImageAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeDocument(file);
      const actions = buildAnalysisActions(analysis);
      if (actions.length > 0) {
        setAnalysisQueue(actions);
        setActiveAnalysisIndex(0);
      }
    } catch (error) {
      console.error("Error analyzing document:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!tripId) return;
    if (
      !itineraryDraft.activity_name.trim() ||
      !itineraryDraft.start_time ||
      !itineraryDraft.end_time
    ) {
      setAlert({
        message: "Please complete activity name, start time, and end time.",
        type: "danger",
      });
      return;
    }

    try {
      await addItinerary(tripId, {
        activity_name: itineraryDraft.activity_name.trim(),
        start_time: new Date(itineraryDraft.start_time),
        end_time: new Date(itineraryDraft.end_time),
        description: itineraryDraft.description.trim(),
      });
      setAlert({
        message: "Itinerary item created successfully!",
        type: "success",
      });
      moveToNextAnalysisAction();
    } catch (error) {
      console.error("Failed to add itinerary item:", error);
      setAlert({
        message: "Failed to create itinerary item. Please try again.",
        type: "danger",
      });
    }
  };

  const handleSaveBudget = async () => {
    if (!tripId) return;

    const parsedAmount = Number(budgetDraft.amount);
    if (
      !budgetDraft.item.trim() ||
      !budgetDraft.category.trim() ||
      Number.isNaN(parsedAmount)
    ) {
      setAlert({
        message: "Please provide item, amount, and category.",
        type: "danger",
      });
      return;
    }

    try {
      await addExpenditure(tripId, {
        item: budgetDraft.item.trim(),
        amount: parsedAmount,
        category: budgetDraft.category.trim(),
      });
      setAlert({
        message: "Budget entry created successfully!",
        type: "success",
      });
      moveToNextAnalysisAction();
    } catch (error) {
      console.error("Failed to add expenditure:", error);
      setAlert({
        message: "Failed to create budget entry. Please try again.",
        type: "danger",
      });
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!tripId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this document?",
    );
    if (!confirmed) return;

    try {
      await deleteDocument(tripId, documentId);
      setAlert({ message: "Document deleted successfully!", type: "success" });
      await fetchDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
      setAlert({
        message: "Failed to delete document. Please try again.",
        type: "danger",
      });
    }
  };

  return (
    <div className="row">
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
      {isModalOpen && (
        <UploadDocumentModal
          onClose={() => setIsModalOpen(false)}
          onUpload={handleUpload}
        />
      )}

      {activeAction?.type === "itinerary" && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Itinerary Item</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={moveToNextAnalysisAction}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  We found itinerary-related details in your image. Please
                  confirm or edit before creating.
                </p>
                <input
                  className="form-control mb-2"
                  placeholder="Activity Name"
                  value={itineraryDraft.activity_name}
                  onChange={(e) =>
                    setItineraryDraft((prev) => ({
                      ...prev,
                      activity_name: e.target.value,
                    }))
                  }
                />
                <input
                  className="form-control mb-2"
                  type="datetime-local"
                  value={itineraryDraft.start_time}
                  onChange={(e) =>
                    setItineraryDraft((prev) => ({
                      ...prev,
                      start_time: e.target.value,
                    }))
                  }
                />
                <input
                  className="form-control mb-2"
                  type="datetime-local"
                  value={itineraryDraft.end_time}
                  onChange={(e) =>
                    setItineraryDraft((prev) => ({
                      ...prev,
                      end_time: e.target.value,
                    }))
                  }
                />
                <textarea
                  className="form-control"
                  placeholder="Description"
                  value={itineraryDraft.description}
                  onChange={(e) =>
                    setItineraryDraft((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={moveToNextAnalysisAction}
                >
                  Skip
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveItinerary}
                >
                  Create Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Analyzing your document...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="document-list mt-4">
        <div className="document-header">
          <h2 className="mb-0">Documents</h2>
          <div className="d-flex align-items-center">
            <div className="input-group me-2">
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="dropdown me-2">
              <button
                className="btn btn-outline-secondary dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                All Types
              </button>
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton1"
              >
                <li>
                  <a className="dropdown-item" href="#">
                    All Types
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Image
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    PDF
                  </a>
                </li>
              </ul>
            </div>
            <button
              className="btn btn-primary btn-sm document-upload-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="bi bi-plus-circle me-1"></i>Upload
            </button>
          </div>
        </div>
        <div className="row g-4 mt-2">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="col-lg-3 col-md-4 col-sm-6">
              <div className="card h-100 document-card">
                <a href={doc.gcs_url} target="_blank" rel="noopener noreferrer">
                  <div className="card-img-top-container">
                    {doc.content_type.startsWith("image/") ? (
                      <img
                        src={doc.gcs_url}
                        alt={doc.name}
                        className="card-img-top"
                      />
                    ) : (
                      <div className="card-img-top-placeholder">
                        <i className="bi bi-file-earmark-text display-1"></i>
                      </div>
                    )}
                  </div>
                </a>
                <div className="card-body">
                  <h5 className="card-title">{doc.name}</h5>
                  <p className="card-text">{doc.description}</p>
                  <span
                    className={`badge ${
                      doc.content_type.startsWith("image/")
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {doc.content_type.startsWith("image/") ? "Image" : "PDF"}
                  </span>
                  <p className="card-text text-muted mt-2">
                    Added on{" "}
                    {new Date(doc.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="card-footer bg-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Uploaded by {doc.uploaded_by}
                    </small>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
