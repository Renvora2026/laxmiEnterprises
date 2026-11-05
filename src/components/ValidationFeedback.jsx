import React, { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, X } from "lucide-react";

export function FieldError({ error }) {
  if (!error) return null;
  return (
    <span className="field-error-msg" role="alert">
      <AlertCircle size={12} />
      <span>{error}</span>
    </span>
  );
}

export function RequiredStar() {
  return <span className="required-star" aria-hidden="true">*</span>;
}

export function ValidationSummary({ errors = {}, title = "Please correct the following fields:" }) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const errorList = Object.entries(errors)
    .filter(([_, msg]) => Boolean(msg))
    .map(([field, msg]) => ({ field, msg }));

  // Re-show when new errors arrive
  useEffect(() => {
    if (errorList.length > 0) {
      setDismissed(false);
    }
  }, [errorList.length]);

  if (errorList.length === 0 || dismissed) return null;

  return (
    <div className="form-validation-summary mobile-compact-error" role="alert">
      <AlertTriangle size={16} className="form-validation-summary-icon" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div className="form-validation-summary-title" style={{ margin: 0, fontSize: "0.82rem" }}>
            {errorList.length === 1 ? errorList[0].msg : `${errorList.length} fields require attention`}
          </div>
          {errorList.length > 1 && (
            <button
              type="button"
              onClick={() => setExpanded(prev => !prev)}
              style={{
                background: "none",
                border: "none",
                color: "var(--danger, #ef4444)",
                fontSize: "0.74rem",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0
              }}
            >
              {expanded ? "Collapse" : "View all"}
            </button>
          )}
        </div>
        {expanded && (
          <ul className="form-validation-summary-list" style={{ marginTop: 6, fontSize: "0.78rem" }}>
            {errorList.map(({ field, msg }, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss error banner"
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          padding: 2,
          display: "flex",
          opacity: 0.7
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
