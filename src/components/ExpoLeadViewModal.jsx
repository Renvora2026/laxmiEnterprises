import React, { useRef, useState } from "react";
import {
  X, MessageCircle, Phone, MapPin, Calendar,
  Wheat, Milk, Tractor, Store, Smartphone,
  Printer, Pencil, Send, Tag, Copy, Check, UserCheck
} from "lucide-react";
import {
  getWhatsAppUrl,
  downloadVCardFile,
  normalizeWhatsAppNumber
} from "../services/whatsappService";

export default function ExpoLeadViewModal({
  isOpen,
  onClose,
  lead,
  company = {},
  onEdit,
  onStatusChange,
  onConvertToClient,
  showToast
}) {
  const printRef = useRef(null);
  const [copiedMobile, setCopiedMobile] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen || !lead) return null;

  const isFeed = lead.category === "Animal Feed Shop";
  const isDairy = lead.category === "Dairy";
  const isFarmer = lead.category === "Farmers";

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Converted":
        return "success";
      case "Interested":
      case "Followed Up":
        return "warning";
      default:
        return "muted";
    }
  };

  const personalizedMessage = `Namaskar ${lead.name} ji! 🙏\n\nThank you for visiting the ${company.name || "Laxmi Enterprises"} stall at *${lead.expoName || "Agri Expo"}*.\n\n📝 *Your Inquiry Remark:* ${lead.remark || "Cattle Feed & Agro Supplies"}\n\nOur team is pleased to connect with you from ${lead.village || "your village"}. Please let us know how we can assist you with product catalogues and wholesale rates!\n\n*${company.name || "Laxmi Enterprises"}* | 📞 ${company.phone || "+91 98765 43210"}`;

  const handleLaunchWhatsApp = () => {
    const url = getWhatsAppUrl(lead.mobile, personalizedMessage);
    window.open(url, "_blank", "noopener,noreferrer");
    if (onStatusChange && (lead.status === "New Lead" || lead.status === "New")) {
      onStatusChange(lead.id, "Followed Up");
    }
    if (showToast) {
      showToast(`✓ Opened WhatsApp chat with ${lead.name}`);
    }
  };

  const handleDownloadSingleVCF = () => {
    downloadVCardFile([lead], `${(lead.name || "Expo_Lead").replace(/\s+/g, "_")}_Contact.vcf`);
    if (showToast) {
      showToast(`✓ Downloaded vCard (.vcf) for ${lead.name}`);
    }
  };

  const handleCopyMobile = () => {
    const num = normalizeWhatsAppNumber(lead.mobile);
    navigator.clipboard.writeText(num || lead.mobile);
    setCopiedMobile(true);
    setTimeout(() => setCopiedMobile(false), 2000);
    if (showToast) showToast(`✓ Copied phone number to clipboard`);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(personalizedMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
    if (showToast) showToast(`✓ Copied WhatsApp message template`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusSelect = (e) => {
    const newStatus = e.target.value;
    if (onStatusChange) {
      onStatusChange(lead.id, newStatus);
      if (showToast) showToast(`✓ Status updated to ${newStatus}`);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 840, width: "95%", maxHeight: "92vh", display: "flex", flexDirection: "column" }}
      >
        {/* MODAL HEAD */}
        <div className="modal-head" style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              flexShrink: 0,
              background: isDairy ? "rgba(2, 132, 199, 0.15)" :
                          isFarmer ? "rgba(217, 119, 6, 0.15)" :
                          isFeed ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 211, 102, 0.15)",
              color: isDairy ? "#0284c7" :
                     isFarmer ? "#d97706" :
                     isFeed ? "#059669" : "#128C7E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {isDairy ? <Milk size={20} /> : isFarmer ? <Tractor size={20} /> : isFeed ? <Wheat size={20} /> : <Store size={20} />}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Visitor Lead: <span style={{ color: "var(--primary)" }}>{lead.name}</span>
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {lead.village || "Maharashtra"} • {lead.expoName}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span className={`client-type-badge ${isDairy ? "dairy" : isFarmer ? "farmers" : "feed-shop"} hide-on-mobile`}>
              {isDairy ? <Milk size={11} /> : isFarmer ? <Tractor size={11} /> : <Wheat size={11} />}
              {lead.category || "Visitor"}
            </span>
            <span className={`badge ${getStatusBadgeClass(lead.status)}`} style={{ fontSize: "0.72rem" }}>
              {lead.status || "New Lead"}
            </span>

            {/* Desktop Print button */}
            <div className="desktop-flex">
              <button
                type="button"
                className="outline"
                onClick={handlePrint}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", fontSize: "0.82rem" }}
                title="Print Lead Summary"
              >
                <Printer size={15} />
              </button>
            </div>

            <button type="button" className="icon-btn modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="modal-body" ref={printRef} style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>
          {/* Desktop Lead View (>= 768px) */}
          <div className="desktop-only">
            {/* VISITOR MAIN PROFILE BANNER */}
          <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 18,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: isDairy ? "rgba(2, 132, 199, 0.15)" :
                            isFarmer ? "rgba(217, 119, 6, 0.15)" : "rgba(16, 185, 129, 0.15)",
                color: isDairy ? "#0284c7" :
                       isFarmer ? "#d97706" : "#059669",
                fontSize: "1.4rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--border)"
              }}>
                {(lead.name || "V")[0]}
              </div>

              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", color: "var(--text-main)" }}>
                  {lead.name}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--primary)", fontWeight: 600, fontSize: "0.88rem" }}>
                    <MapPin size={14} />
                    <span>{lead.village}</span>
                  </div>
                  {(lead.taluka || lead.district) && (
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      ({lead.taluka ? `${lead.taluka}, ` : ""}{lead.district || "Maharashtra"})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status Selector */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)" }}>
                Lead Pipeline Stage:
              </span>
              <select
                className="form-select"
                value={lead.status || "New Lead"}
                onChange={handleStatusSelect}
                style={{
                  fontSize: "0.82rem",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <option value="New Lead">⚪ New Lead</option>
                <option value="Followed Up">🟡 Followed Up</option>
                <option value="Interested">🟠 Interested</option>
                <option value="Converted">🟢 Converted / Customer</option>
              </select>
            </div>
          </div>

          {/* TWO COLUMN GRID: CONTACT INFO & EVENT DETAILS */}
          <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>

            {/* COLUMN 1: CONTACT DETAILS */}
            <div style={{ background: "var(--table-hover)", padding: 16, borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Phone size={16} style={{ color: "var(--primary)" }} />
                <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-main)" }}>
                  Contact Information
                </h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.84rem" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>
                    Mobile Number (Primary):
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <strong style={{ fontSize: "1.05rem", color: "var(--text-main)", letterSpacing: "0.5px" }}>
                      +91 {lead.mobile}
                    </strong>
                    <button
                      type="button"
                      onClick={handleCopyMobile}
                      className="icon-btn"
                      title="Copy Mobile Number"
                      style={{ padding: 4, width: 24, height: 24 }}
                    >
                      {copiedMobile ? <Check size={13} style={{ color: "#10b981" }} /> : <Copy size={13} />}
                    </button>
                    <a
                      href={`tel:${lead.mobile}`}
                      className="icon-btn"
                      title="Direct Call"
                      style={{ padding: 4, width: 24, height: 24, color: "var(--primary)" }}
                    >
                      <Phone size={13} />
                    </a>
                  </div>
                </div>

                {lead.email && (
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>
                      Email Address:
                    </span>
                    <a
                      href={`mailto:${lead.email}`}
                      style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}
                    >
                      {lead.email}
                    </a>
                  </div>
                )}

                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>
                    Full Geographic Address:
                  </span>
                  <span style={{ color: "var(--text-main)" }}>
                    {lead.village}{lead.taluka ? `, Taluka: ${lead.taluka}` : ""}{lead.district ? `, District: ${lead.district}` : ""}, Maharashtra
                  </span>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>
                    WhatsApp Consent:
                  </span>
                  <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                    {lead.whatsappConsent === false ? "No, do not message" : "Yes, agreed to receive updates"}
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: EXHIBITION & SECTOR INTEL */}
            <div style={{ background: "var(--table-hover)", padding: 16, borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Calendar size={16} style={{ color: "var(--primary)" }} />
                <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-main)" }}>
                  Exhibition & Sector Intel
                </h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.84rem" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>
                    Exhibition / Agri Mela Name:
                  </span>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
                    {lead.expoName}
                  </strong>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>
                    Stall Interaction Date:
                  </span>
                  <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                    📅 {lead.date}
                  </span>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>
                    Agribusiness Classification:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span className={`client-type-badge ${isDairy ? "dairy" : isFarmer ? "farmers" : "feed-shop"}`}>
                      {isDairy ? <Milk size={12} /> : isFarmer ? <Tractor size={12} /> : <Wheat size={12} />}
                      {lead.category || "General Agri Visitor"}
                    </span>
                  </div>
                </div>

                {lead.whatsappSentAt && (
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>
                      Last WhatsApp Sent:
                    </span>
                    <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                      {new Date(lead.whatsappSentAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* VISITOR NOTE & INQUIRY REMARK CARD */}
          <div style={{
            background: "rgba(245, 158, 11, 0.05)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: 10,
            padding: 18,
            marginBottom: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tag size={17} style={{ color: "#d97706" }} />
                <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-main)" }}>
                  Visitor Inquiry & Requirement Remark
                </h4>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Recorded Note
              </span>
            </div>

            <div style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "14px 16px",
              fontSize: "0.92rem",
              lineHeight: 1.6,
              color: "var(--text-main)",
              fontStyle: "italic"
            }}>
              "{lead.remark}"
            </div>
          </div>

          {/* DIRECT WHATSAPP PREVIEW */}
          <div style={{
            background: "rgba(37, 211, 102, 0.05)",
            border: "1px solid rgba(37, 211, 102, 0.3)",
            borderRadius: 10,
            padding: 18
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MessageCircle size={18} style={{ color: "#25D366" }} />
                <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#128C7E" }}>
                  Personalized WhatsApp Message Preview
                </h4>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="outline"
                  onClick={handleCopyMessage}
                  style={{ fontSize: "0.78rem", padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}
                >
                  {copiedMessage ? <Check size={12} style={{ color: "#10b981" }} /> : <Copy size={12} />}
                  Copy Text
                </button>
              </div>
            </div>

            <pre style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 12,
              fontSize: "0.82rem",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "inherit",
              color: "var(--text-main)",
              margin: 0
            }}>
              {personalizedMessage}
            </pre>
          </div>
        </div>

        {/* ── MOBILE STRUCTURED EXPO VISITOR VIEW ── */}
        <div className="mobile-only" style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {/* Card 1: Visitor Profile & Pipeline Stage */}
          <div className="mobile-invoice-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: isDairy ? "rgba(2, 132, 199, 0.15)" :
                              isFarmer ? "rgba(217, 119, 6, 0.15)" : "rgba(16, 185, 129, 0.15)",
                  color: isDairy ? "#0284c7" :
                         isFarmer ? "#d97706" : "#059669",
                  fontSize: 18,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--border)"
                }}>
                  {(lead.name || "V")[0]}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)" }}>
                    {lead.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--primary)", fontSize: 12, marginTop: 2 }}>
                    <MapPin size={12} />
                    <span>{lead.village}</span>
                    {(lead.taluka || lead.district) && (
                      <span style={{ color: "var(--text-muted)" }}>
                        ({lead.taluka ? `${lead.taluka}, ` : ""}{lead.district || "Maharashtra"})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className={`badge ${getStatusBadgeClass(lead.status)}`} style={{ fontSize: 10.5 }}>
                {lead.status || "New Lead"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
              <span className={`client-type-badge ${isDairy ? "dairy" : isFarmer ? "farmers" : "feed-shop"}`} style={{ fontSize: 10.5 }}>
                {isDairy ? <Milk size={11} /> : isFarmer ? <Tractor size={11} /> : <Wheat size={11} />}
                {lead.category || "Visitor"}
              </span>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                📅 <b>{lead.date}</b> • {lead.expoName}
              </div>
            </div>

            {/* Pipeline Stage Quick Dropdown */}
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "8px 10px", borderRadius: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Lead Stage:
              </span>
              <select
                className="form-select"
                value={lead.status || "New Lead"}
                onChange={handleStatusSelect}
                style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, fontWeight: 600 }}
              >
                <option value="New Lead">⚪ New Lead</option>
                <option value="Followed Up">🟡 Followed Up</option>
                <option value="Interested">🟠 Interested</option>
                <option value="Converted">🟢 Converted / Customer</option>
              </select>
            </div>
          </div>

          {/* Card 2: Contact Information */}
          <div className="mobile-invoice-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Phone size={13} style={{ color: "var(--primary)" }} />
              <span>Contact Information</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Mobile Number</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <strong style={{ fontSize: 13.5, color: "var(--text-main)" }}>+91 {lead.mobile}</strong>
                <button
                  type="button"
                  onClick={handleCopyMobile}
                  className="icon-btn"
                  title="Copy Mobile"
                  style={{ padding: 4, width: 26, height: 26 }}
                >
                  {copiedMobile ? <Check size={13} style={{ color: "#10b981" }} /> : <Copy size={13} />}
                </button>
                <a
                  href={`tel:${lead.mobile}`}
                  className="icon-btn"
                  title="Direct Call"
                  style={{ padding: 4, width: 26, height: 26, color: "var(--primary)" }}
                >
                  <Phone size={13} />
                </a>
              </div>
            </div>

            {lead.email && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Email</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary)" }}>{lead.email}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Address</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)", textAlign: "right" }}>
                {lead.village}{lead.taluka ? `, ${lead.taluka}` : ""}{lead.district ? `, ${lead.district}` : ""}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>WhatsApp Consent</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: lead.whatsappConsent === false ? "#ef4444" : "#10b981" }}>
                {lead.whatsappConsent === false ? "No, do not message" : "✓ Agreed to receive updates"}
              </span>
            </div>
          </div>

          {/* Card 3: Visitor Inquiry Remark */}
          <div className="mobile-invoice-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Tag size={13} style={{ color: "#d97706" }} />
              <span>Visitor Requirement Remark</span>
            </div>
            <div style={{
              background: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 12.5,
              lineHeight: 1.5,
              color: "#92400e",
              fontStyle: "italic"
            }}>
              "{lead.remark || "No specific requirement note recorded."}"
            </div>
          </div>

          {/* Card 4: WhatsApp Message Preview */}
          <div className="mobile-invoice-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                <MessageCircle size={13} style={{ color: "#25D366" }} />
                <span>WhatsApp Message Template</span>
              </div>
              <button
                type="button"
                className="outline"
                onClick={handleCopyMessage}
                style={{ fontSize: 11, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}
              >
                {copiedMessage ? <Check size={11} style={{ color: "#10b981" }} /> : <Copy size={11} />}
                <span>Copy</span>
              </button>
            </div>

            <pre style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 10,
              fontSize: 11.5,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "inherit",
              color: "var(--text-main)",
              margin: 0
            }}>
              {personalizedMessage}
            </pre>
          </div>
        </div>
      </div>

      {/* ── MODAL FOOTER (EXACTLY ONE BUTTON FOR EACH ACTION) ── */}
      <div className="modal-footer invoice-modal-footer">
        {/* Primary Action Button: Chat on WhatsApp */}
        <button
          type="button"
          className="primary invoice-download-btn"
          onClick={handleLaunchWhatsApp}
          style={{
            background: "#25D366",
            borderColor: "#25D366",
            color: "#ffffff"
          }}
          title={`Chat directly with ${lead.name} on WhatsApp`}
        >
          <MessageCircle size={16} />
          <span>Chat on WhatsApp</span>
        </button>

        {/* Secondary Action Row */}
        <div className="invoice-secondary-actions">
          <button
            type="button"
            className="outline invoice-edit-btn"
            onClick={handleDownloadSingleVCF}
            title="Download vCard (.vcf) contact file"
          >
            <Smartphone size={14} />
            <span>vCard</span>
          </button>

          {onEdit && (
            <button
              type="button"
              className="outline invoice-edit-btn"
              onClick={() => {
                onClose();
                onEdit(lead);
              }}
              title="Edit Visitor"
            >
              <Pencil size={14} />
              <span>Edit</span>
            </button>
          )}

          {onConvertToClient && lead.status !== "Converted" && (
            <button
              type="button"
              className="outline invoice-pay-btn"
              onClick={() => {
                onClose();
                onConvertToClient(lead);
              }}
              style={{
                background: "rgba(0, 91, 181, 0.08)",
                borderColor: "var(--primary)",
                color: "var(--primary)"
              }}
              title="Convert this lead into a registered Client in Customer Master"
            >
              <UserCheck size={14} />
              <span>Convert</span>
            </button>
          )}
        </div>
      </div>

      </div>
    </div>
  );
}