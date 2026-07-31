import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocuments, uploadDocument } from "../../api/document";
import { ImagePreview } from "./ImagePreview";
import { UploadDocumentModal } from "../../components/modals/UploadDocumentModal";
import "./TripDocumentPage.css";

interface Document {
  id: string;
  filename: string;
  name: string;
  description: string;
  content_type: string;
  gcs_url: string;
  created_at: string;
}

export function TripDocumentPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

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
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="row">
      {isModalOpen && (
        <UploadDocumentModal
          onClose={() => setIsModalOpen(false)}
          onUpload={handleUpload}
        />
      )}

      <div className="document-list mt-4">
        <div className="document-header">
          <h2 className="mb-0">Documents</h2>
          <button
            className="btn btn-primary btn-sm document-upload-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="bi bi-plus-circle me-1"></i>Upload
          </button>
        </div>
        <ul className="list-group">
          {documents.map((doc) => (
            <li key={doc.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {doc.content_type.startsWith("image/") ? (
                    <ImagePreview src={doc.gcs_url} alt={doc.name}>
                      <span className="fw-bold">{doc.name}</span>
                    </ImagePreview>
                  ) : (
                    <a
                      href={doc.gcs_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="fw-bold">{doc.name}</span>
                    </a>
                  )}
                  <p className="mb-0 text-muted">{doc.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
