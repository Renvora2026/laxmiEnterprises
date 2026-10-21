import React, { useState, useMemo } from "react";
import {
  X, Send, CheckCircle2, MessageCircle, Users, ExternalLink,
  Copy, Download, Sparkles, Filter, Check, AlertCircle, ArrowRight,
  Play, Pause, RotateCcw, Smartphone, MapPin, Tag, FileText
} from "lucide-react";
import {
  WHATSAPP_TEMPLATES,
  renderWhatsAppMessage,
  getWhatsAppUrl,
  normalizeWhatsAppNumber,
  downloadVCardFile
} from "../services/whatsappService";
import { FieldError, RequiredStar, ValidationSummary } from "./ValidationFeedback";
import { validateRequiredText, validateMobile } from "../utils/validators";

export default function WhatsAppBulkModal({
  isOpen,
  onClose,
  leads = [],
  company = {},
  showToast
}) {
  if (!isOpen) return null;

  // Selected leads list
  const [selectedIds, setSelectedIds] = useState(() => new Set(leads.map(l => l.id)));
  const [selectedTemplateId, setSelectedTemplateId] = useState("stall_thank_you");
  const [customText, setCustomText] = useState(() => {
    const defaultTpl = WHATSAPP_TEMPLATES.find(t => t.id === "stall_thank_you");
    return defaultTpl ? defaultTpl.text : "";
  });
  const [errors, setErrors] = useState({});

  // Filter state inside modal
  const [sectorFilter, setSectorFilter] = useState("All");

  // Queue runner state
  const [queueIndex, setQueueIndex] = useState(0);
  const [sentSet, setSentSet] = useState(new Set());
  const [copiedLinkIndex, setCopiedLinkIndex] = useState(null);

  // Filtered recipients
  const filteredRecipients = useMemo(() => {
    return leads.filter(l => {
      if (sectorFilter !== "All" && l.category !== sectorFilter) return false;
      return true;
    });
  }, [leads, sectorFilter]);

  const selectedLeads = useMemo(() => {
    return leads.filter(l => selectedIds.has(l.id));
  }, [leads, selectedIds]);

  const handleTemplateChange = (tplId) => {
    setSelectedTemplateId(tplId);
    const found = WHATSAPP_TEMPLATES.find(t => t.id === tplId);
    if (found) {
      setCustomText(found.text);
    }
  };

  const handleInsertTag = (tag) => {
    setCustomText(prev => prev + ` ${tag} `);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecipients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecipients.map(l => l.id)));
    }
  };

  const toggleLead = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Preview lead
  const previewLead = selectedLeads[0] || leads[0] || {
    name: "Dattatray Shinde",
    village: "Baramati Rural",
    mobile: "9822456789",
    remark: "Needs 350 bags Godrej MilkMore feed with transport subsidy",
    expoName: "Kisan Agri Expo 2026"
  };

  const renderedPreview = useMemo(() => {
    return renderWhatsAppMessage(customText, previewLead, company);
  }, [customText, previewLead, company]);

  // Current queue target
  const currentQueueLead = selectedLeads[queueIndex];

  // Validate before actions
  const validateBulkAction = () => {
    const errs = {};
    if (!customText || !customText.trim()) {
      errs.customText = "WhatsApp message content cannot be empty.";
    }
    if (selectedLeads.length === 0) {
      errs.recipients = "Please select at least one recipient lead from the list.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Open single WhatsApp chat
  const handleLaunchWhatsApp = (lead) => {
    if (!customText || !customText.trim()) {
      setErrors(prev => ({ ...prev, customText: "Message content cannot be empty." }));
      return;
    }
    const mobileVal = validateMobile(lead.mobile, true);
    if (!mobileVal.isValid) {
      if (showToast) showToast(`Invalid mobile for ${lead.name}: ${lead.mobile}`);
      return;
    }
    const msg = renderWhatsAppMessage(customText, lead, company);
    const url = getWhatsAppUrl(lead.mobile, msg);
    window.open(url, "_blank", "noopener,noreferrer");
    setSentSet(prev => new Set(prev).add(lead.id));
    if (queueIndex < selectedLeads.length - 1) {
      setQueueIndex(prev => prev + 1);
    }
  };

  // Download VCF contacts file
  const handleDownloadVCF = () => {
    if (selectedLeads.length === 0) {
      setErrors(prev => ({ ...prev, recipients: "Please select at least 1 lead to download contacts." }));
      return;
    }
    downloadVCardFile(selectedLeads, `Laxmi_Enterprises_Expo_Leads_${selectedLeads.length}.vcf`);
    if (showToast) showToast(`✓ Downloaded ${selectedLeads.length} contacts for WhatsApp Broadcast`);
  };

  // Copy all phone numbers
  const handleCopyNumbers = () => {
    if (selectedLeads.length === 0) {
      setErrors(prev => ({ ...prev, recipients: "Please select at least 1 lead to copy numbers." }));
      return;
    }
    const nums = selectedLeads.map(l => normalizeWhatsAppNumber(l.mobile)).filter(Boolean).join(", ");
    navigator.clipboard.writeText(nums);
    if (showToast) showToast(`✓ Copied ${selectedLeads.length} WhatsApp numbers to clipboard`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 940, width: "95%", maxHeight: "94vh", display: "flex", flexDirection: "column" }}
      >
        {/* MODAL HEADER WITH WHATSAPP BRANDING */}
        <div className="modal-head" style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", background: "linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(18, 140, 126, 0.05) 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
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
            }}>
              <MessageCircle size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem", color: "var(--text-main)" }}>
                  WhatsApp Bulk Campaign & Follow-up
                </h3>
                <span className="badge" style={{ background: "rgba(37, 211, 102, 0.15)", color: "#128C7E", border: "1px solid rgba(37, 211, 102, 0.3)" }}>
                  WhatsApp Direct Integration
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Personalized broadcasts for Expo Leads with Name, Village, Note/Remark and 1-Click Dispatch
              </p>
            </div>
          </div>

          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          
          <ValidationSummary errors={errors} title="WhatsApp broadcast warning:" />

          {/* TOP AUDIENCE SUMMARY BAR */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18, background: "var(--table-hover)", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={18} style={{ color: "#25D366" }} />
              <div>
                <strong style={{ fontSize: "0.92rem", color: "var(--text-main)" }}>
                  Recipients Selected: {selectedIds.size} of {leads.length} Visitors
                </strong>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Sent: <b>{sentSet.size}</b> • Remaining in Queue: <b>{Math.max(0, selectedIds.size - sentSet.size)}</b>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Category Filter */}
              <div style={{ display: "flex", gap: 4 }}>
                {["All", "Animal Feed Shop", "Dairy", "Farmers"].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-pill ${sectorFilter === cat ? "active" : ""}`}
                    style={{ fontSize: "0.76rem", padding: "4px 8px" }}
                    onClick={() => setSectorFilter(cat)}
                  >
                    {cat === "All" ? "All" : cat === "Animal Feed Shop" ? "Feed" : cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="outline"
                style={{ fontSize: "0.78rem", padding: "5px 10px" }}
                onClick={toggleSelectAll}
              >
                {selectedIds.size === filteredRecipients.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>

          {/* TWO COLUMN WORKSPACE: TEMPLATE CONFIG & LIVE PREVIEW */}
          <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20, marginBottom: 20 }}>
            
            {/* COLUMN 1: TEMPLATE SELECTOR & MESSAGE COMPOSER */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 6, color: "var(--text-main)" }}>
                  Select Agribusiness Campaign Template:
                </label>
                <select
                  className="form-select"
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  style={{ width: "100%", fontSize: "0.85rem" }}
                >
                  {WHATSAPP_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DYNAMIC VARIABLE BUTTONS */}
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "block", marginBottom: 5 }}>
                  Click to insert live personalization tags:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[
                    { tag: "{{name}}", label: "Name" },
                    { tag: "{{village}}", label: "Village" },
                    { tag: "{{remark}}", label: "Note Remark" },
                    { tag: "{{expoName}}", label: "Expo Name" },
                    { tag: "{{companyName}}", label: "Company" }
                  ].map(({ tag, label }) => (
                    <button
                      key={tag}
                      type="button"
                      className="outline"
                      style={{ fontSize: "0.74rem", padding: "3px 8px", borderRadius: 4, background: "rgba(37, 211, 102, 0.08)", borderColor: "rgba(37, 211, 102, 0.3)", color: "#128C7E", fontWeight: 600 }}
                      onClick={() => handleInsertTag(tag)}
                    >
                      + {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MESSAGE TEXTAREA */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 6, color: "var(--text-main)" }}>
                  Message Content (WhatsApp Formatted): <RequiredStar />
                </label>
                <textarea
                  className={`form-input ${errors.customText ? "is-invalid" : ""}`}
                  rows={8}
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    if (errors.customText) setErrors(prev => ({ ...prev, customText: null }));
                  }}
                  style={{ width: "100%", fontFamily: "inherit", fontSize: "0.83rem", lineHeight: 1.45, resize: "vertical" }}
                  placeholder="Enter message text with {{name}}, {{village}}, {{remark}}..."
                />
                <FieldError error={errors.customText} />
                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                  💡 Tip: Use `*bold*` for bold text, `_italic_` for italics, and emoji in WhatsApp formatting.
                </span>
              </div>
            </div>

            {/* COLUMN 2: LIVE WHATSAPP PHONE CHAT PREVIEW */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Smartphone size={16} style={{ color: "#25D366" }} />
                  Live Preview on Recipient Phone
                </span>
                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                  Preview: {previewLead.name}
                </span>
              </div>

              {/* PHONE MOCKUP CHAT CONTAINER */}
              <div style={{
                background: "#EFEAE2",
                borderRadius: 14,
                border: "1px solid #d1d7db",
                padding: "16px 14px",
                minHeight: 260,
                maxHeight: 310,
                overflowY: "auto",
                boxShadow: "inset 0 1px 4px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column"
              }}>
                {/* Chat Top Banner */}
                <div style={{ background: "#075E54", color: "#fff", padding: "8px 12px", borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#25D366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                    L
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.82rem", display: "block", lineHeight: 1.2 }}>Laxmi Enterprises</strong>
                    <span style={{ fontSize: "0.68rem", opacity: 0.85 }}>Online • Verified Business</span>
                  </div>
                </div>

                {/* Recipient Chat Bubble */}
                <div style={{
                  background: "#DCF8C6",
                  color: "#111b21",
                  borderRadius: "8px 0px 8px 8px",
                  padding: "10px 12px",
                  fontSize: "0.82rem",
                  lineHeight: 1.4,
                  alignSelf: "flex-end",
                  maxWidth: "92%",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}>
                  {renderedPreview}
                  <div style={{ textAlign: "right", fontSize: "0.65rem", color: "rgba(0,0,0,0.45)", marginTop: 4, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
                    <span>Just now</span>
                    <span style={{ color: "#34B7F1", fontWeight: 700 }}>✓✓</span>
                  </div>
                </div>
              </div>

              {/* Preview Lead Meta Details */}
              <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", marginTop: 10, fontSize: "0.78rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Recipient: <b>{previewLead.name}</b></span>
                  <span>Village: <b>{previewLead.village}</b></span>
                </div>
                <div style={{ color: "#059669", marginTop: 2 }}>
                  📝 Note: <i>{previewLead.remark}</i>
                </div>
              </div>
            </div>

          </div>

          {/* DISPATCH CONTROLS & CAMPAIGN DISPATCHER */}
          <div style={{ background: "var(--table-hover)", padding: 18, borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h4 style={{ margin: "0 0 2px 0", fontSize: "0.95rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Send size={16} style={{ color: "#25D366" }} />
                  Automated Queue Dispatcher
                </h4>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  1-Click open WhatsApp with message pre-filled for each visitor in sequence
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="outline"
                  onClick={handleCopyNumbers}
                  style={{ fontSize: "0.78rem", padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}
                  title="Copy comma-separated phone numbers"
                >
                  <Copy size={13} /> Copy All Numbers
                </button>

                <button
                  type="button"
                  className="outline"
                  onClick={handleDownloadVCF}
                  style={{ fontSize: "0.78rem", padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, color: "#128C7E", borderColor: "#25D366" }}
                  title="Download vCard (.vcf) to import contacts into WhatsApp Broadcast"
                >
                  <Download size={13} /> Download .VCF for Broadcast List
                </button>
              </div>
            </div>

            {/* QUEUE LAUNCHER CARD */}
            {selectedLeads.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>
                Please select at least one recipient to launch the campaign.
              </div>
            ) : (
              <div>
                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 5 }}>
                    <span>Dispatch Progress ({sentSet.size} of {selectedLeads.length} Sent)</span>
                    <span style={{ fontWeight: 700, color: "#25D366" }}>
                      {Math.round((sentSet.size / selectedLeads.length) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(sentSet.size / selectedLeads.length) * 100}%`,
                      background: "#25D366",
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                </div>

                {/* CURRENT TARGET CARD & ACTION */}
                {currentQueueLead ? (
                  <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: sentSet.has(currentQueueLead.id) ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 211, 102, 0.15)",
                        color: sentSet.has(currentQueueLead.id) ? "#10b981" : "#128C7E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700
                      }}>
                        {queueIndex + 1}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                            {currentQueueLead.name}
                          </strong>
                          <span className="client-tag" style={{ margin: 0 }}>
                            {currentQueueLead.village}
                          </span>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            📞 {currentQueueLead.mobile}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                          Note: <i>{currentQueueLead.remark}</i>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        type="button"
                        className="outline"
                        style={{ fontSize: "0.78rem", padding: "6px 10px" }}
                        disabled={queueIndex === 0}
                        onClick={() => setQueueIndex(prev => Math.max(0, prev - 1))}
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        className="outline"
                        style={{ fontSize: "0.78rem", padding: "6px 10px" }}
                        disabled={queueIndex >= selectedLeads.length - 1}
                        onClick={() => setQueueIndex(prev => Math.min(selectedLeads.length - 1, prev + 1))}
                      >
                        Skip / Next
                      </button>

                      <button
                        type="button"
                        className="primary"
                        onClick={() => handleLaunchWhatsApp(currentQueueLead)}
                        style={{
                          background: "#25D366",
                          borderColor: "#25D366",
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          padding: "8px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <MessageCircle size={16} />
                        Send via WhatsApp
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 12, color: "var(--text-muted)" }}>
                    Queue complete! All selected messages sent.
                  </div>
                )}

              </div>
            )}
          </div>

          {/* RECIPIENTS CHECKLIST TABLE */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>
                Recipient Audience Checklist ({filteredRecipients.length} Visitors)
              </span>
              <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                Check / Uncheck contacts to include in this campaign
              </span>
            </div>

            <div className="table-wrap" style={{ maxHeight: 220, overflow: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
              <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr style={{ background: "var(--table-head)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ width: 40, textAlign: "center", padding: "6px" }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredRecipients.length && filteredRecipients.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th style={{ padding: "6px 10px" }}>Visitor Name</th>
                    <th style={{ padding: "6px 10px" }}>Village (गाव)</th>
                    <th style={{ padding: "6px 10px" }}>Mobile Number</th>
                    <th style={{ padding: "6px 10px" }}>Note / Remark</th>
                    <th style={{ width: 90, textAlign: "center", padding: "6px 10px" }}>Status</th>
                    <th style={{ width: 80, textAlign: "center", padding: "6px 10px" }}>Direct Chat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipients.map((lead) => {
                    const isSelected = selectedIds.has(lead.id);
                    const isSent = sentSet.has(lead.id);

                    return (
                      <tr key={lead.id} style={{ borderBottom: "1px solid var(--border)", background: isSelected ? "transparent" : "var(--table-hover)" }}>
                        <td style={{ textAlign: "center", padding: "6px" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleLead(lead.id)}
                          />
                        </td>
                        <td style={{ padding: "6px 10px", fontWeight: 600 }}>{lead.name}</td>
                        <td style={{ padding: "6px 10px", color: "var(--text-muted)" }}>{lead.village}</td>
                        <td style={{ padding: "6px 10px" }}><code>{lead.mobile}</code></td>
                        <td style={{ padding: "6px 10px", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                          {lead.remark && lead.remark.length > 40 ? `${lead.remark.slice(0, 40)}...` : lead.remark}
                        </td>
                        <td style={{ textAlign: "center", padding: "6px 10px" }}>
                          {isSent ? (
                            <span style={{ color: "#10b981", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
                              <CheckCircle2 size={12} /> Sent
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>Pending</span>
                          )}
                        </td>
                        <td style={{ textAlign: "center", padding: "6px 10px" }}>
                          <button
                            type="button"
                            onClick={() => handleLaunchWhatsApp(lead)}
                            style={{ background: "none", border: "none", color: "#25D366", cursor: "pointer", padding: 2 }}
                            title={`Chat with ${lead.name} on WhatsApp`}
                          >
                            <MessageCircle size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="modal-footer" style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
          <button type="button" className="outline" onClick={onClose}>
            Close Campaign
          </button>
          
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="outline"
              onClick={handleDownloadVCF}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}
            >
              <Download size={14} /> Download Contacts VCF
            </button>

            {currentQueueLead && (
              <button
                type="button"
                className="primary"
                style={{ background: "#25D366", borderColor: "#25D366", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => handleLaunchWhatsApp(currentQueueLead)}
              >
                <Send size={15} /> Send to Next ({currentQueueLead.name})
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
