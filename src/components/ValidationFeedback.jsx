import React from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";

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
  const errorList = Object.entries(errors)
    .filter(([_, msg]) => Boolean(msg))
    .map(([field, msg]) => ({ field, msg }));

  if (errorList.length === 0) return null;

  return (
    <div className="form-validation-summary" role="alert">
      <AlertTriangle size={18} className="form-validation-summary-icon" />
      <div style={{ flex: 1 }}>
        <div className="form-validation-summary-title">{title}</div>
        <ul className="form-validation-summary-list">
          {errorList.map(({ field, msg }, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
