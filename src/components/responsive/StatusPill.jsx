import React from "react";

/**
 * StatusPill
 * Design token compliant soft-tinted pill badge.
 * - green: paid, active, in stock, settled
 * - amber: partial, pending
 * - red: unpaid, low stock, out of stock, cancelled, inactive
 */
export default function StatusPill({ status, label = null, className = "", style = {} }) {
  const s = String(status || "").toLowerCase().trim();
  
  let type = "neutral";
  if (s.includes("paid") && !s.includes("unpaid")) type = "success";
  else if (s.includes("active") || s.includes("in stock") || s.includes("settled")) type = "success";
  else if (s.includes("partial") || s.includes("pending")) type = "warning";
  else if (s.includes("unpaid") || s.includes("low") || s.includes("out of stock") || s.includes("inactive") || s.includes("cancelled")) type = "danger";

  const displayLabel = label || status || "—";

  return (
    <span className={`status-pill status-pill-${type} ${className}`} style={style}>
      {displayLabel}
    </span>
  );
}

