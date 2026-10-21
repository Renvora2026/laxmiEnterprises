import React, { useState, useRef, useEffect } from "react";
import {
  Download, FileText, CloudUpload, Check,
  ChevronDown, RefreshCw
} from "lucide-react";
import { uploadFileToDrive } from "../services/googleDriveService";

export default function ExportMenu({
  label = "Export",
  onExportCSV,
  onSaveToDrive,
  category = "Report",
  showToast
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [savingToDrive, setSavingToDrive] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCSVClick = () => {
    setIsOpen(false);
    if (onExportCSV) onExportCSV();
  };

  const handleDriveClick = async () => {
    setIsOpen(false);
    setSavingToDrive(true);
    try {
      if (onSaveToDrive) {
        await onSaveToDrive();
      }
    } catch (err) {
      console.error("Failed to save to Drive:", err);
      if (showToast) showToast("Error saving file to Google Drive");
    } finally {
      setSavingToDrive(false);
    }
  };

  return (
    <div className="export-menu-container" ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="outline export-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={savingToDrive}
        style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 110 }}
      >
        {savingToDrive ? (
          <>
            <RefreshCw size={14} className="spin" />
            <span>Syncing...</span>
          </>
        ) : (
          <>
            <Download size={15} />
            <span>{label}</span>
            <ChevronDown size={14} style={{ opacity: 0.7 }} />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className="export-dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "var(--shadow-lg)",
            minWidth: 230,
            zIndex: 100,
            overflow: "hidden",
            padding: "6px"
          }}
        >
          <div style={{
            padding: "6px 10px",
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--text-muted)",
            letterSpacing: "0.05em"
          }}>
            Export & Cloud Options
          </div>

          <button
            type="button"
            className="export-option-item"
            onClick={handleCSVClick}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              background: "transparent",
              border: "none",
              borderRadius: 6,
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.86rem",
              color: "var(--text-main)",
              transition: "background 0.15s ease"
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <FileText size={16} />
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "0.85rem" }}>CSV Spreadsheet (.csv)</strong>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Standard raw table export</span>
            </div>
          </button>

          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

          <button
            type="button"
            className="export-option-item"
            onClick={handleDriveClick}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              background: "transparent",
              border: "none",
              borderRadius: 6,
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.86rem",
              color: "var(--text-main)",
              transition: "background 0.15s ease"
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <CloudUpload size={16} />
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "0.85rem", color: "#2563eb" }}>
                Save to Google Drive
              </strong>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                Direct cloud backup to folder
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
