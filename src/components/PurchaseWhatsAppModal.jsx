import React, { useState, useMemo } from "react";
import {
  X, Send, CheckCircle2, MessageCircle, ExternalLink,
  Copy, Smartphone, Check, AlertCircle, FileText, Calendar
} from "lucide-react";
import {
  PURCHASE_WHATSAPP_TEMPLATES,
  renderPurchaseWhatsAppMessage,
  getPurchaseWhatsAppUrl,
  normalizeWhatsAppNumber
} from "../services/whatsappService";
import { FieldError, RequiredStar, ValidationSummary } from "./ValidationFeedback";
import { validateMobile } from "../utils/validators";

export default function PurchaseWhatsAppModal({
  isOpen,
  onClose,
  purchase = null,
  company = {},
  showToast
}) {
  if (!isOpen || !purchase) return null;

  const isPartial = purchase.paymentStatus === "Partial";
  const defaultTplId = isPartial ? "purchase_partial" : "purchase_receipt";

  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTplId);
  const [vendorContact, setVendorContact] = useState(purchase.contact || purchase.mobile || "");
  const [customText, setCustomText] = useState(() => {
    return renderPurchaseWhatsAppMessage(purchase, company);
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [errors, setErrors] = useState({});

  // When template changes, regenerate text
  const handleTemplateChange = (tplId) => {
    setSelectedTemplateId(tplId);
    const found = PURCHASE_WHATSAPP_TEMPLATES.find(t => t.id === tplId);
    if (found) {
      const generated = renderPurchaseWhatsAppMessage(
        { ...purchase, contact: vendorContact },
        company,
        found.text
      );
      setCustomText(generated);
    }
  };

  const handleLaunchWhatsApp = () => {
    const mobileVal = validateMobile(vendorContact, true);
    if (!mobileVal.isValid) {
      setErrors({ contact: mobileVal.error });
      return;
    }
    setErrors({});

    const url = getPurchaseWhatsAppUrl(
      { ...purchase, contact: vendorContact },
      company,
      customText
    );

    const win = window.open(url, "_blank");
    if (!win) {
      window.location.href = url;
    }
    if (showToast) {
      showToast(`✓ Opened WhatsApp for ${purchase.vendorName || "Supplier"}`);
    }
    onClose();
  };

  const handleCopyLink = () => {
    const url = getPurchaseWhatsAppUrl(
      { ...purchase, contact: vendorContact },
      company,
      customText
    );
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    if (showToast) showToast("✓ WhatsApp link copied to clipboard");
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(customText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
    if (showToast) showToast("✓ Message text copied to clipboard");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 920,
          width: "95%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* MODAL HEADER */}
        <div
          className="modal-head"
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid var(--border)",
            background: "linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(18, 140, 126, 0.05) 100%)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#25D366",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(37, 211, 102, 0.35)",
                flexShrink: 0
              }}
            >
              <MessageCircle size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem", color: "var(--text-main)" }}>
                  WhatsApp Purchase Receipt & Voucher
                </h3>
                <span
                  className="badge"
                  style={{
                    background: "rgba(37, 211, 102, 0.15)",
                    color: "#128C7E",
                    border: "1px solid rgba(37, 211, 102, 0.3)"
                  }}
                >
                  WhatsApp Direct Access
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                PO: <b>{purchase.id}</b> • Vendor: <b>{purchase.vendorName}</b> ({purchase.category})
              </p>
            </div>
          </div>

          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <ValidationSummary errors={errors} title="Please check contact details:" />

          <div
            className="responsive-two-col"
            style={{
              display: "grid",
              gridTemplateColumns: "1.25fr 1fr",
              gap: 22,
              alignItems: "start"
            }}
          >
            {/* COLUMN 1: VENDOR INFO, TEMPLATE & EDITOR */}
            <div>
              {/* Vendor & PO Summary Card */}
              <div
                style={{
                  background: "var(--table-hover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 16
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                      Supplier / Seller
                    </span>
                    <h4 style={{ margin: "2px 0", fontSize: "1rem", color: "var(--text-main)" }}>
                      {purchase.vendorName}
                    </h4>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Village: {purchase.village || "-"}, {purchase.taluka || "-"} (Dist: {purchase.district || "-"})
                    </span>
                  </div>
                  <span className={`badge ${purchase.paymentStatus === "Paid" ? "success" : purchase.paymentStatus === "Partial" ? "warning" : "muted"}`}>
                    {purchase.paymentStatus}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 14, fontSize: "0.8rem", marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 8, flexWrap: "wrap" }}>
                  <div>Total: <b>₹{(Number(purchase.totalAmount) || 0).toLocaleString("en-IN")}</b></div>
                  <div style={{ color: "#10b981" }}>
                    Paid (Day 1): <b>₹{(Number(purchase.paidAmount || purchase.day1Amount) || 0).toLocaleString("en-IN")}</b>
                  </div>
                  {(Number(purchase.balanceDue) > 0) && (
                    <div style={{ color: "var(--danger)" }}>
                      Due: <b>₹{Number(purchase.balanceDue).toLocaleString("en-IN")}</b>
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor Mobile Number Input */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  Supplier WhatsApp Number: <RequiredStar />
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="tel"
                    className={`form-input ${errors.contact ? "is-invalid" : ""}`}
                    value={vendorContact}
                    onChange={(e) => {
                      setVendorContact(e.target.value);
                      if (errors.contact) setErrors({});
                    }}
                    placeholder="Enter 10-digit mobile number (e.g. 9822456789)"
                  />
                </div>
                <FieldError error={errors.contact} />
                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: 3, display: "block" }}>
                  Standard Indian mobile numbers will automatically format with country code (+91).
                </span>
              </div>

              {/* Template Selector */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  Choose Receipt Notification Template:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  {PURCHASE_WHATSAPP_TEMPLATES.map(tpl => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => handleTemplateChange(tpl.id)}
                        style={{
                          border: isSelected ? "2px solid #25D366" : "1px solid var(--border)",
                          background: isSelected ? "rgba(37, 211, 102, 0.08)" : "var(--card-bg)",
                          padding: "10px 14px",
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "0.85rem", color: isSelected ? "#047857" : "var(--text-main)" }}>
                            {tpl.name}
                          </strong>
                          {isSelected && <Check size={14} style={{ color: "#059669" }} />}
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {tpl.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Content Editor */}
              <div className="form-group">
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  Message Content (WhatsApp Text):
                </label>
                <textarea
                  className="form-input"
                  rows={8}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.82rem",
                    lineHeight: 1.5,
                    resize: "vertical"
                  }}
                />
                <span style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                  💡 Tip: WhatsApp supports <code>*bold*</code>, <code>_italics_</code>, and emojis.
                </span>
              </div>
            </div>

            {/* COLUMN 2: LIVE WHATSAPP PHONE CHAT PREVIEW */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Smartphone size={16} style={{ color: "#25D366" }} />
                <h4 style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-main)" }}>
                  Live WhatsApp Chat Mockup
                </h4>
              </div>

              {/* Phone Frame */}
              <div
                style={{
                  background: "#0b141a",
                  borderRadius: 24,
                  padding: 10,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                  maxWidth: 360,
                  margin: "0 auto"
                }}
              >
                {/* Phone Top Bar */}
                <div
                  style={{
                    background: "#1f2c34",
                    borderRadius: "16px 16px 0 0",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#ffffff"
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#00a884",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.85rem"
                    }}
                  >
                    {(purchase.vendorName || "V")[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {purchase.vendorName || "Supplier"}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#8696a0" }}>
                      {vendorContact ? `+${normalizeWhatsAppNumber(vendorContact)}` : "WhatsApp Contact"}
                    </div>
                  </div>
                </div>

                {/* Chat Background & Message Bubble */}
                <div
                  style={{
                    background: "#0b141a",
                    backgroundImage: "radial-gradient(#1f2c34 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                    minHeight: 330,
                    maxHeight: 440,
                    overflowY: "auto",
                    padding: "16px 12px",
                    borderRadius: "0 0 16px 16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end"
                  }}
                >
                  <div
                    style={{
                      background: "#005c4b",
                      color: "#e9edef",
                      borderRadius: "8px 8px 2px 8px",
                      padding: "10px 12px",
                      fontSize: "0.78rem",
                      lineHeight: 1.5,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word"
                    }}
                  >
                    {customText}
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "0.65rem",
                        color: "#8696a0",
                        marginTop: 4,
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 3
                      }}
                    >
                      <span>12:30 PM</span>
                      <span style={{ color: "#53bdeb" }}>✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Copy Buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center" }}>
                <button
                  type="button"
                  className="outline"
                  onClick={handleCopyText}
                  style={{ fontSize: "0.76rem", padding: "6px 10px", display: "flex", alignItems: "center", gap: 5 }}
                >
                  {copiedText ? <Check size={13} style={{ color: "#10b981" }} /> : <Copy size={13} />}
                  <span>{copiedText ? "Copied Text!" : "Copy Text"}</span>
                </button>
                <button
                  type="button"
                  className="outline"
                  onClick={handleCopyLink}
                  style={{ fontSize: "0.76rem", padding: "6px 10px", display: "flex", alignItems: "center", gap: 5 }}
                >
                  {copiedLink ? <Check size={13} style={{ color: "#10b981" }} /> : <ExternalLink size={13} />}
                  <span>{copiedLink ? "Copied Link!" : "Copy WhatsApp Link"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          className="modal-footer"
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <button type="button" className="outline" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="primary"
            onClick={handleLaunchWhatsApp}
            style={{
              background: "#25D366",
              borderColor: "#25D366",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              fontWeight: 600
            }}
          >
            <Send size={16} />
            <span>Open & Send via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
