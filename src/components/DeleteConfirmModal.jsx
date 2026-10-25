import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, details }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: "var(--danger-light)" }}>
          <h3 style={{ color: "var(--danger)" }}>
            <AlertTriangle size={19} /> {title}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={17} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: 14 }}>
          <p style={{ fontSize: 14, color: "var(--text-main)", lineHeight: 1.5 }}>
            {message}
          </p>
          {details && (
            <div style={{ background: "var(--border-subtle)", padding: 12, borderRadius: 10, fontSize: 12, color: "var(--text-muted)" }}>
              {details}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            <Trash2 size={15} /> Yes, Delete Record
          </button>
        </div>
      </div>
    </div>
  );
}
