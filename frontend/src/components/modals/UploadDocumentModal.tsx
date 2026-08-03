import React, { useState } from "react";

interface UploadDocumentModalProps {
  onClose: () => void;
  onUpload: (file: File, name: string, description: string) => void;
}

export function UploadDocumentModal({
  onClose,
  onUpload,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleUpload = () => {
    if (file) {
      onUpload(file, name, description);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload Document</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
