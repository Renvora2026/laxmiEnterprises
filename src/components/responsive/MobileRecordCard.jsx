import React, { useState } from "react";
import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";

/**
 * MobileRecordCard
 * Touch-optimized card row matching the target reference design:
 * [Avatar/Icon] [Title & Subtitle] ... [Amount & Status Pill] [Chevron >]
 * Fully backwards compatible with primaryMetrics, expandedDetails, and actions.
 */
export default function MobileRecordCard({
  avatar = null,
  icon: Icon = null,
  iconColor = "var(--primary)",
  iconBg = "rgba(0, 91, 181, 0.08)",
  idBadge = null,
  title,
  subtitle = null,
  amount = null,
  amountSub = null,
  categoryBadge = null,
  statusBadge = null,
  primaryMetrics = [],
  expandedDetails = null,
  actions = null,
  onClick = null,
  showChevron = true,
  className = "",
  style = {},
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`mobile-record-card ${className}`}
      style={style}
    >
      {/* Main Touch Card Row */}
      <div
        className="mobile-record-row-main"
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        {/* Left: Avatar or Icon Thumbnail */}
        {avatar ? (
          <div className="mobile-record-avatar-slot">
            {avatar}
          </div>
        ) : Icon ? (
          <div
            className="mobile-record-avatar-icon"
            style={{ color: iconColor, background: iconBg }}
          >
            <Icon size={19} />
          </div>
        ) : null}

        {/* Center: Title & Subtitle */}
        <div className="mobile-record-title-slot">
          {(idBadge || categoryBadge) && (
            <div className="mobile-record-id-row">
              {idBadge && <span className="mobile-record-id-badge">{idBadge}</span>}
              {categoryBadge && <span className="mobile-record-cat-badge">{categoryBadge}</span>}
            </div>
          )}
          <h3 className="mobile-record-title">{title}</h3>
          {subtitle && <p className="mobile-record-subtitle">{subtitle}</p>}
        </div>

        {/* Right: Amount, Status Pill & Chevron */}
        <div className="mobile-record-right-slot">
          {amount && (
            <span className="mobile-record-amount-val">{amount}</span>
          )}
          {amountSub && (
            <span className="mobile-record-amount-sub">{amountSub}</span>
          )}
          {statusBadge && (
            <div className="mobile-record-status-wrap">
              {statusBadge}
            </div>
          )}
          {showChevron && onClick && (
            <ChevronRight size={17} className="mobile-record-chevron" />
          )}
        </div>
      </div>

      {/* Primary Metrics Grid (backward compatibility) */}
      {primaryMetrics && primaryMetrics.length > 0 && (
        <div className="mobile-record-metrics">
          {primaryMetrics.map((metric, idx) => (
            <div key={idx} className="mobile-record-metric-item">
              <span className="mobile-record-metric-label">{metric.label}</span>
              <span
                className={`mobile-record-metric-value ${metric.isMoney ? "money" : ""}`}
                style={{ color: metric.color || "inherit" }}
              >
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Collapsible Accordion for Full Details */}
      {expandedDetails && (
        <div className="mobile-record-expand-wrap">
          <button
            type="button"
            className="mobile-record-expand-btn"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? "Hide details" : "View full details"}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isExpanded && (
            <div className="mobile-record-expanded-content">
              {expandedDetails}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Footer */}
      {actions && (
        <div className="mobile-record-actions">
          {actions}
        </div>
      )}
    </div>
  );
}
