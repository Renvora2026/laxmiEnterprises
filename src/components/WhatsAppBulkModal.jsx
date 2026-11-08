import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X, Send, MessageCircle, Upload, Check, Smartphone, Copy,
  Image as ImageIcon, AlertTriangle, ChevronRight, ChevronLeft,
  Edit3, Users, RefreshCw, Zap
} from "lucide-react";
import {
  WHATSAPP_TEMPLATES,
  renderWhatsAppMessage,
  appendImageLink,
  getWhatsAppUrl,
  isValidWhatsAppNumber,
  downloadVCardFile
} from "../services/whatsappService";
import { uploadExpoImage, markBroadcastSent, getBroadcastConfig, sendBroadcast } from "../services/expoApi";

const CHUNK_SIZE = 20;

/** Pick a smart default template based on expo name + sector filter */
function smartDefaultTemplate(activeExpoName = "", activeSectorFilter = "") {
  const expo = (activeExpoName || "").toLowerCase();
  const sector = (activeSectorFilter || "").toLowerCase();

  if (sector.includes("dairy") || expo.includes("dairy") || expo.includes("milk")) return "dairy_procurement";
  if (sector.includes("farmer") || expo.includes("farmer") || expo.includes("shetkari") || expo.includes("krushi") || expo.includes("agri")) return "farmer_direct";
  if (sector.includes("feed") || expo.includes("feed") || expo.includes("pashu")) return "feed_shop_offer";
  return "stall_thank_you";
}

/** Variable insertion helper buttons */
const VARS = [
  { label: "{{name}}", title: "Visitor Name" },
  { label: "{{village}}", title: "Village" },
  { label: "{{expoName}}", title: "Expo Name" },
  { label: "{{remark}}", title: "Inquiry Note" },
  { label: "{{companyPhone}}", title: "Your Phone" },
];

function insertAtCursor(textareaRef, text, currentValue, onChange) {
  const el = textareaRef.current;
  if (!el) { onChange(currentValue + text); return; }
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const next = currentValue.slice(0, start) + text + currentValue.slice(end);
  onChange(next);
  // Restore cursor after render
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start + text.length, start + text.length);
  });
}

export default function WhatsAppBulkModal({
  isOpen,
  onClose,
  leads = [],
  company = {},
  showToast,
  onSent,
  activeExpoName = "",
  activeSectorFilter = "",
}) {
  // --- Step ---
  // "compose" = Step 1: edit template
  // "send"    = Step 2: send messages
  const [step, setStep] = useState("compose");

  // --- Backend config (auto mode) ---
  const [config, setConfig] = useState(null);
  const [cloudTemplateId, setCloudTemplateId] = useState("");
  const [resend, setResend] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [summary, setSummary] = useState(null);

  // --- Manual mode ---
  const [templateId, setTemplateId] = useState(() => smartDefaultTemplate(activeExpoName, activeSectorFilter));
  const [text, setText] = useState(() => {
    const id = smartDefaultTemplate(activeExpoName, activeSectorFilter);
    return WHATSAPP_TEMPLATES.find((t) => t.id === id)?.text || WHATSAPP_TEMPLATES[0].text;
  });
  const [sentIds, setSentIds] = useState(new Set());
  const [copied, setCopied] = useState(false);

  // --- Shared ---
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  // Reset everything when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setSentIds(new Set());
    setSummary(null);
    setSending(false);
    setProgress({ done: 0, total: 0 });
    setStep("compose");
    setImageUrl("");

    // Set smart default template based on current expo/sector filter
    const defaultId = smartDefaultTemplate(activeExpoName, activeSectorFilter);
    setTemplateId(defaultId);
    const tpl = WHATSAPP_TEMPLATES.find((t) => t.id === defaultId);
    if (tpl) setText(tpl.text);

    // Fetch backend config
    setConfig(null);
    getBroadcastConfig()
      .then((c) => {
        setConfig(c);
        if (c?.templates?.length) setCloudTemplateId((prev) => prev || c.templates[0].id);
      })
      .catch(() => setConfig({ configured: false, templates: [], dailyLimit: 0 }));
  }, [isOpen, activeExpoName, activeSectorFilter]);

  const eligible = useMemo(
    () => leads.filter((l) => l.whatsappConsent !== false && isValidWhatsAppNumber(l.mobile)),
    [leads]
  );
  const skipped = leads.length - eligible.length;

  const isAuto = !!config?.configured;
  const cloudTemplate = config?.templates?.find((t) => t.id === cloudTemplateId) || null;
  const autoTargets = useMemo(
    () => eligible.filter((l) => resend || !l.whatsappBroadcastSent),
    [eligible, resend]
  );
  const alreadySent = eligible.length - eligible.filter((l) => !l.whatsappBroadcastSent).length;
  const manualPending = eligible.filter((l) => !sentIds.has(l.id));

  const sample = { name: "[Lead Name]", village: "[Village]", remark: "[Inquiry Details]", expoName: activeExpoName || "[Agri Expo Event]" };
  const previewLead = (isAuto ? autoTargets[0] : manualPending[0]) || eligible[0] || sample;

  const buildManualMessage = (lead) => appendImageLink(renderWhatsAppMessage(text, lead, company), imageUrl);
  const previewText = isAuto
    ? renderWhatsAppMessage(cloudTemplate?.preview || "", previewLead, company)
    : buildManualMessage(previewLead);

  /* ---------- image upload ---------- */
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast?.("⚠ Only JPG, PNG or WEBP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast?.("⚠ Image must be smaller than 5 MB");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadExpoImage(file);
      setImageUrl(res.url);
      showToast?.("✓ Image uploaded");
    } catch (err) {
      showToast?.(`⚠ ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  /* ---------- template change ---------- */
  const handleTemplateChange = (e) => {
    const tpl = WHATSAPP_TEMPLATES.find((t) => t.id === e.target.value);
    setTemplateId(e.target.value);
    if (tpl) setText(tpl.text);
  };

  /* ---------- auto send ---------- */
  const handleAutoSend = async () => {
    if (!cloudTemplate || sending) return;
    if (cloudTemplate.imageHeader && !imageUrl) {
      showToast?.("⚠ Upload an image first (this template needs one)");
      return;
    }
    if (autoTargets.length === 0) return;
    if (!window.confirm(
      `Send "${cloudTemplate.label}" to ${autoTargets.length} visitors now?\n\nWhatsApp charges for each delivered marketing message.`
    )) return;

    setSending(true);
    setSummary(null);
    setProgress({ done: 0, total: autoTargets.length });
    const all = [];
    try {
      for (let i = 0; i < autoTargets.length; i += CHUNK_SIZE) {
        const chunk = autoTargets.slice(i, i + CHUNK_SIZE);
        const data = await sendBroadcast({
          ids: chunk.map((l) => l.id),
          templateId: cloudTemplate.id,
          imageUrl: cloudTemplate.imageHeader ? imageUrl : undefined,
          resend,
        });
        const results = data?.results || [];
        all.push(...results);
        onSent?.(data?.leads || []);
        setProgress({ done: Math.min(i + CHUNK_SIZE, autoTargets.length), total: autoTargets.length });
        if (results.some((r) => r.reason === "Daily limit reached")) break;
      }
    } catch (err) {
      showToast?.(`⚠ ${err.message}`);
    } finally {
      setSending(false);
      setSummary(all);
    }
  };

  /* ---------- manual open chat ---------- */
  const openChat = (lead) => {
    window.open(getWhatsAppUrl(lead.mobile, buildManualMessage(lead)), "_blank", "noopener,noreferrer");
    setSentIds((prev) => new Set(prev).add(lead.id));
    markBroadcastSent([lead.id])
      .then((updated) => onSent?.(Array.isArray(updated) ? updated : []))
      .catch(() => showToast?.("⚠ Opened chat, but could not log it in the database"));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildManualMessage(previewLead));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sentCount = summary ? summary.filter((r) => r.status === "sent").length : 0;
  const failed = summary ? summary.filter((r) => r.status === "failed") : [];
  const skippedResults = summary ? summary.filter((r) => r.status === "skipped") : [];

  const showImageBox = isAuto ? !!cloudTemplate?.imageHeader : true;

  if (!isOpen) return null;

  /* ================================================================
     STEP 1 — COMPOSE (Template picker + Editor + Preview)
  ================================================================ */
  const renderComposeStep = () => (
    <>
      {/* Not configured warning */}
      {config && !isAuto && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.35)", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: "0.82rem", lineHeight: 1.5 }}>
          <AlertTriangle size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
          <span>
            Automatic sending is not configured yet — messages will open one-by-one via WhatsApp Web. Add WhatsApp Cloud API keys to the backend for 1-click bulk sending.
          </span>
        </div>
      )}

      {config && (
        <>
          {/* ── Expo context banner ── */}
          {activeExpoName && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(37, 211, 102, 0.08)", border: "1px solid rgba(37, 211, 102, 0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: "0.82rem" }}>
              <Zap size={14} style={{ color: "#128C7E", flexShrink: 0 }} />
              <span>
                Campaign for <strong>{activeExpoName}</strong>
                {activeSectorFilter ? ` · ${activeSectorFilter}` : ""}
                {" "}— template auto-selected. You can change it below.
              </span>
            </div>
          )}

          {/* ── Template selector ── */}
          {isAuto ? (
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Approved WhatsApp Template</label>
              <select className="form-select" value={cloudTemplateId} onChange={(e) => setCloudTemplateId(e.target.value)}>
                {config.templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Message Template</label>
              <select className="form-select" value={templateId} onChange={handleTemplateChange}>
                {WHATSAPP_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* ── Message editor (manual mode only) ── */}
          {!isAuto && (
            <div className="form-group" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ margin: 0 }}>
                  <Edit3 size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                  Customise Message
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const tpl = WHATSAPP_TEMPLATES.find((t) => t.id === templateId);
                    if (tpl) setText(tpl.text);
                  }}
                  style={{ border: "none", background: "none", color: "var(--primary)", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}
                  title="Reset to original template text"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              </div>

              {/* Variable chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 7 }}>
                {VARS.map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    title={`Insert ${v.title}`}
                    onClick={() => insertAtCursor(textareaRef, v.label, text, setText)}
                    style={{ fontSize: "0.72rem", padding: "2px 8px", border: "1px solid var(--border)", borderRadius: 20, background: "var(--surface)", cursor: "pointer", fontFamily: "monospace", color: "var(--primary)" }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                className="form-input"
                rows={9}
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ fontFamily: "inherit", lineHeight: 1.6, fontSize: "0.84rem" }}
                placeholder="Type your message here..."
              />
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right", marginTop: 3 }}>
                {text.length} chars
              </div>
            </div>
          )}

          {/* ── Image upload ── */}
          {showImageBox && (
            <div style={{ border: "1px dashed var(--border)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <ImageIcon size={18} style={{ color: "var(--primary)" }} />
                <strong style={{ fontSize: "0.9rem" }}>
                  {isAuto ? "Offer poster (attached as the message header)" : "Attach image (sent as a link) — optional"}
                </strong>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} style={{ display: "none" }} />
                <button
                  type="button"
                  className="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", padding: "5px 10px" }}
                >
                  <Upload size={14} /> {uploading ? "Uploading..." : imageUrl ? "Change image" : "Upload image"}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    style={{ border: "none", background: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                  >
                    Remove
                  </button>
                )}
              </div>
              {imageUrl && (
                <img src={imageUrl} alt="Campaign" style={{ marginTop: 10, maxHeight: 120, borderRadius: 8, border: "1px solid var(--border)" }} />
              )}
            </div>
          )}

          {/* ── Live preview ── */}
          <div style={{ background: "rgba(37, 211, 102, 0.05)", border: "1px solid rgba(37, 211, 102, 0.3)", borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ fontSize: "0.88rem", color: "#128C7E" }}>
                📱 Preview — {previewLead.name}
              </strong>
              {!isAuto && (
                <button
                  type="button"
                  className="outline"
                  onClick={handleCopy}
                  style={{ fontSize: "0.76rem", padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />} Copy
                </button>
              )}
            </div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit", fontSize: "0.82rem", lineHeight: 1.5, color: "var(--text-main)", maxHeight: 220, overflowY: "auto" }}>
              {previewText || <span style={{ color: "var(--text-muted)" }}>Type your message above to see a preview...</span>}
            </pre>
          </div>
        </>
      )}

      {config === null && (
        <div style={{ padding: 20, textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Checking WhatsApp setup...
        </div>
      )}
    </>
  );

  /* ================================================================
     STEP 2 — SEND (Recipient list + send controls)
  ================================================================ */
  const renderSendStep = () => (
    <>
      {/* Recipient count summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120, background: "rgba(37, 211, 102, 0.08)", border: "1px solid rgba(37, 211, 102, 0.25)", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ready to send</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#128C7E" }}>
            {isAuto ? autoTargets.length : manualPending.length}
          </div>
        </div>
        {skipped > 0 && (
          <div style={{ flex: 1, minWidth: 120, background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Skipped</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#d97706" }}>{skipped}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>No number / no consent</div>
          </div>
        )}
        {isAuto && alreadySent > 0 && (
          <div style={{ flex: 1, minWidth: 120, background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.25)", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Already messaged</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#6366f1" }}>{alreadySent}</div>
          </div>
        )}
      </div>

      {/* Message summary (read-only) */}
      <div style={{ background: "rgba(37, 211, 102, 0.05)", border: "1px solid rgba(37, 211, 102, 0.3)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <strong style={{ fontSize: "0.85rem", color: "#128C7E" }}>Message to be sent</strong>
          <button
            type="button"
            onClick={() => setStep("compose")}
            style={{ border: "none", background: "none", color: "var(--primary)", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}
          >
            <Edit3 size={12} /> Edit message
          </button>
        </div>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit", fontSize: "0.8rem", lineHeight: 1.5, color: "var(--text-main)", maxHeight: 160, overflowY: "auto" }}>
          {previewText}
        </pre>
        {imageUrl && (
          <img src={imageUrl} alt="Campaign" style={{ marginTop: 10, maxHeight: 80, borderRadius: 6, border: "1px solid var(--border)" }} />
        )}
      </div>

      {/* Auto mode options */}
      {isAuto && (
        <>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", marginBottom: 12, cursor: "pointer" }}>
            <input type="checkbox" checked={resend} onChange={(e) => setResend(e.target.checked)} disabled={sending} />
            Also message visitors who already received a message
          </label>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
            Daily cap: <b style={{ color: "var(--text-main)" }}>{config?.dailyLimit}</b> messages per 24 hours.
          </div>

          {sending && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ height: 8, borderRadius: 6, background: "var(--border)", overflow: "hidden" }}>
                <div style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`, height: "100%", background: "#25D366", transition: "width .3s" }} />
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                Sending {progress.done} / {progress.total} — keep this window open.
              </div>
            </div>
          )}

          {summary && (
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: "0.84rem", lineHeight: 1.6 }}>
              <div><b style={{ color: "#128C7E" }}>{sentCount}</b> sent • <b style={{ color: "var(--danger)" }}>{failed.length}</b> failed • <b>{skippedResults.length}</b> skipped</div>
              {skippedResults.some((r) => r.reason === "Daily limit reached") && (
                <div style={{ color: "#d97706" }}>Daily limit reached. Continue tomorrow.</div>
              )}
              {failed.length > 0 && (
                <ul style={{ margin: "6px 0 0", paddingLeft: 18, maxHeight: 120, overflowY: "auto" }}>
                  {failed.map((r) => <li key={r.id}>{r.name}: {r.reason}</li>)}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {/* Manual mode — recipient list */}
      {!isAuto && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "8px 12px", background: "var(--table-hover)", fontSize: "0.8rem", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Recipients ({eligible.length})</span>
            <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>{sentIds.size} opened this session</span>
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {eligible.length === 0 && (
              <div style={{ padding: 14, fontSize: "0.84rem", color: "var(--text-muted)" }}>
                No visitors with a valid mobile number and WhatsApp consent.
              </div>
            )}
            {eligible.map((l) => {
              const done = sentIds.has(l.id);
              return (
                <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 12px", borderTop: "1px solid var(--border)", fontSize: "0.84rem" }}>
                  <div style={{ minWidth: 0 }}>
                    <b>{l.name}</b>{" "}
                    <span style={{ color: "var(--text-muted)" }}>· {l.village} · {l.mobile}</span>
                    {l.expoName && <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}> · {l.expoName}</span>}
                  </div>
                  <button
                    type="button"
                    className={done ? "outline" : "primary"}
                    onClick={() => openChat(l)}
                    style={done
                      ? { fontSize: "0.76rem", padding: "4px 10px", color: "#128C7E", borderColor: "#25D366", display: "flex", alignItems: "center", gap: 4 }
                      : { fontSize: "0.76rem", padding: "4px 10px", background: "#25D366", borderColor: "#25D366", color: "#fff", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {done ? <><Check size={12} /> Sent</> : <><MessageCircle size={12} /> Open</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div className="modal-backdrop" onClick={sending ? undefined : onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 780, width: "95%", maxHeight: "92vh", display: "flex", flexDirection: "column" }}
      >
        {/* ── HEAD ── */}
        <div className="modal-head" style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37, 211, 102, 0.15)", color: "#128C7E", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem" }}>
                WhatsApp Bulk Campaign
                {activeExpoName ? ` — ${activeExpoName}` : ""}
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {eligible.length} eligible
                {skipped > 0 ? ` · ${skipped} skipped` : ""}
                {isAuto ? ` · ${alreadySent} already messaged` : ` · ${sentIds.size} opened`}
                {" "}·{" "}
                <span style={{ fontWeight: 600, color: step === "compose" ? "var(--primary)" : "var(--text-muted)" }}>
                  Step 1: Compose
                </span>
                {" → "}
                <span style={{ fontWeight: 600, color: step === "send" ? "#128C7E" : "var(--text-muted)" }}>
                  Step 2: Send
                </span>
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={sending} aria-label="Close modal"><X size={18} /></button>
        </div>

        {/* ── BODY ── */}
        <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
          {step === "compose" ? renderComposeStep() : renderSendStep()}
        </div>

        {/* ── FOOTER ── */}
        <div className="modal-footer" style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="outline" onClick={sending ? undefined : onClose} disabled={sending}>
              Close
            </button>
            {step === "send" && (
              <button
                type="button"
                className="outline"
                onClick={() => { downloadVCardFile(eligible); showToast?.("✓ Downloaded contacts (.vcf)"); }}
                style={{ display: "flex", alignItems: "center", gap: 6, color: "#128C7E", borderColor: "#25D366" }}
              >
                <Smartphone size={14} /> Contacts (.vcf)
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {step === "send" && (
              <button
                type="button"
                className="outline"
                onClick={() => setStep("compose")}
                disabled={sending}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <ChevronLeft size={15} /> Back: Edit Message
              </button>
            )}

            {step === "compose" && config && (
              <button
                type="button"
                className="primary"
                onClick={() => setStep("send")}
                disabled={eligible.length === 0 || (!isAuto && !text.trim())}
                style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}
              >
                Next: Review & Send <ChevronRight size={15} />
              </button>
            )}

            {step === "send" && config && isAuto && (
              <button
                type="button"
                className="primary"
                onClick={handleAutoSend}
                disabled={sending || autoTargets.length === 0}
                style={{ background: "#25D366", borderColor: "#25D366", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
              >
                <Send size={15} />
                {sending ? "Sending..." : autoTargets.length === 0 ? "Nothing to send" : `Send to ${autoTargets.length} visitors`}
              </button>
            )}

            {step === "send" && config && !isAuto && (
              <button
                type="button"
                className="primary"
                onClick={() => manualPending[0] && openChat(manualPending[0])}
                disabled={manualPending.length === 0}
                style={{ background: "#25D366", borderColor: "#25D366", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
              >
                <Send size={15} />
                {manualPending.length === 0 ? "All opened ✓" : `Open next chat (${manualPending.length} left)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
