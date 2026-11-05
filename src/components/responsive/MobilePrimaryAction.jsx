import React from "react";
import { Plus } from "lucide-react";

/**
 * MobilePrimaryAction
 * Fixed pill-shaped primary action button positioned above the bottom navigation dock.
 * Always reachable and never clipped or hidden behind the bottom bar.
 */
export default function MobilePrimaryAction({
  onClick,
  label,
  icon: Icon = Plus,
  id = undefined,
  className = "",
  style = {},
}) {
  // Strip any leading '+' character from label so only one icon + is rendered
  const cleanLabel = String(label || "").replace(/^\+\s*/, "").trim();

  return (
    <div className="mobile-primary-action-dock mobile-only">
      <button
        type="button"
        id={id}
        className={`mobile-primary-action-btn ${className}`}
        onClick={onClick}
        style={style}
      >
        {Icon && <Icon size={17} className="mobile-primary-action-icon" style={{ strokeWidth: 2.4 }} />}
        <span>{cleanLabel}</span>
      </button>
    </div>
  );
}

