import React from "react";
import { Download, FileText } from "lucide-react";

export default function ExportMenu({
  label = "Export CSV",
  onExportCSV,
}) {
  const handleClick = () => {
    if (onExportCSV) onExportCSV();
  };

  return (
    <button
      type="button"
      className="outline export-btn"
      onClick={handleClick}
      style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 110 }}
      title="Export records to CSV"
    >
      <Download size={15} />
      <span>{label}</span>
    </button>
  );
}
