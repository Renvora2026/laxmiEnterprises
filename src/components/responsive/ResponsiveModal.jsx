import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * ResponsiveModal
 * Dual-experience dialog:
 * - Desktop/Laptop: Centered modal dialog with backdrop
 * - Mobile: Ergonomic bottom sheet with drag handle & sticky action footer
 */
export default function ResponsiveModal({
  isOpen,
  onClose,
  title,
  subtitle = null,
  icon: Icon = null,
  badge = null,
  children,
  footer = null,
  maxWidth = 720,
  className = "",
}) {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open and manage modal-open class
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.classList.remove("modal-open");
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="responsive-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`responsive-modal-card ${className}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="mobile-sheet-handle-bar">
          <span className="mobile-sheet-handle" />
        </div>

        {/* Modal Header */}
        <div className="responsive-modal-header">
          <div className="responsive-modal-title-group" style={{ minWidth: 0 }}>
            {Icon && (
              <span className="responsive-modal-icon">
                <Icon size={19} />
              </span>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 className="responsive-modal-title">{title}</h3>
                {badge && <span className="responsive-modal-badge">{badge}</span>}
              </div>
              {subtitle && (
                <p className="responsive-modal-subtitle">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="responsive-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="responsive-modal-body">
          {children}
        </div>

        {/* Modal Footer (Sticky on Mobile) */}
        {footer && (
          <div className="responsive-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
