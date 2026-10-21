import React, { useState, useMemo } from "react";
import {
  Users, Plus, Search, MessageCircle, Download,
  Pencil, Trash2, MapPin, Phone, Calendar, CheckCircle2,
  AlertCircle, Sparkles, Filter, X, ExternalLink, Send, Building2,
  Wheat, Milk, Tractor, Smartphone, Tag, Eye
} from "lucide-react";
import ExpoLeadModal from "./ExpoLeadModal";
import ExpoLeadViewModal from "./ExpoLeadViewModal";
import WhatsAppBulkModal from "./WhatsAppBulkModal";
import { getWhatsAppUrl, renderWhatsAppMessage, downloadVCardFile } from "../services/whatsappService";

// Delete Confirmation Modal
function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(239, 68, 68, 0.12)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trash2 size={20} />
          </div>
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{title}</h3>
        </div>
        <p style={{ margin: "0 0 16px 0", fontSize: "0.88rem", color: "var(--text-main)" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="outline" onClick={onClose}>Cancel</button>
          <button type="button" className="primary" style={{ background: "var(--danger)" }} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExpoPage({
  expoLeads = [],
  onSaveExpoLeads,
  company = {},
  showToast
}) {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All"); // "All" | "Animal Feed Shop" | "Dairy" | "Farmers"
  const [eventFilter, setEventFilter] = useState("All");
  
  // Modals state
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);

  // Multi-select for campaign
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());

  // Compute next ID
  const nextLeadId = useMemo(() => {
    let maxNum = 0;
    (expoLeads || []).forEach(l => {
      const match = l.id && l.id.match(/\d+$/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    return `EXP-${String(maxNum + 1).padStart(3, "0")}`;
  }, [expoLeads]);

  // Unique Events List
  const availableEvents = useMemo(() => {
    const set = new Set((expoLeads || []).map(l => l.expoName).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [expoLeads]);

  // Unique Villages Count
  const uniqueVillagesCount = useMemo(() => {
    const set = new Set((expoLeads || []).map(l => (l.village || "").toLowerCase().trim()).filter(Boolean));
    return set.size;
  }, [expoLeads]);

  const followedUpCount = useMemo(() => {
    return (expoLeads || []).filter(l => l.status === "Followed Up" || l.status === "Converted").length;
  }, [expoLeads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return (expoLeads || []).filter(lead => {
      if (sectorFilter !== "All" && lead.category !== sectorFilter) return false;
      if (eventFilter !== "All" && lead.expoName !== eventFilter) return false;

      const q = search.toLowerCase().trim();
      if (!q) return true;

      return (
        (lead.name && lead.name.toLowerCase().includes(q)) ||
        (lead.village && lead.village.toLowerCase().includes(q)) ||
        (lead.mobile && lead.mobile.toLowerCase().includes(q)) ||
        (lead.remark && lead.remark.toLowerCase().includes(q)) ||
        (lead.expoName && lead.expoName.toLowerCase().includes(q)) ||
        (lead.taluka && lead.taluka.toLowerCase().includes(q)) ||
        (lead.district && lead.district.toLowerCase().includes(q))
      );
    });
  }, [expoLeads, sectorFilter, eventFilter, search]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingLead(null);
    setLeadModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
    setLeadModalOpen(true);
  };

  const handleSaveLead = (saved) => {
    let updated;
    if (editingLead) {
      updated = expoLeads.map(l => l.id === saved.id ? saved : l);
      if (showToast) showToast(`✓ Updated details for ${saved.name}`);
    } else {
      updated = [saved, ...expoLeads];
      if (showToast) showToast(`✓ Added Expo Lead: ${saved.name} (${saved.village})`);
    }
    if (onSaveExpoLeads) onSaveExpoLeads(updated);
    setLeadModalOpen(false);
    setEditingLead(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingLead) return;
    const updated = expoLeads.filter(l => l.id !== deletingLead.id);
    if (onSaveExpoLeads) onSaveExpoLeads(updated);
    if (showToast) showToast(`✓ Removed ${deletingLead.name} from Expo Registry`);
    setDeletingLead(null);
    if (viewingLead && viewingLead.id === deletingLead.id) {
      setViewingLead(null);
    }
  };

  const handleStatusChange = (leadId, newStatus) => {
    const updated = expoLeads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
    if (onSaveExpoLeads) onSaveExpoLeads(updated);
    if (viewingLead && viewingLead.id === leadId) {
      setViewingLead(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Direct 1-click WhatsApp message
  const handleDirectWhatsApp = (lead) => {
    const text = `Namaskar ${lead.name} ji! 🙏\n\nThank you for visiting the Laxmi Enterprises stall at *${lead.expoName || "Agri Expo"}*.\n\n📝 *Your Inquiry Remark:* ${lead.remark || "Cattle Feed & Agro Supplies"}\n\nOur team is pleased to connect with you from ${lead.village}. Please let us know how we can assist you with product catalogues and wholesale rates!\n\n*Laxmi Enterprises* | 📞 +91 98765 43210`;
    const url = getWhatsAppUrl(lead.mobile, text);
    window.open(url, "_blank");

    // Auto mark as followed up
    if (lead.status === "New Lead") {
      const updated = expoLeads.map(l => l.id === lead.id ? { ...l, status: "Followed Up" } : l);
      if (onSaveExpoLeads) onSaveExpoLeads(updated);
    }
  };

  const handleDownloadVCF = () => {
    downloadVCardFile(expoLeads, `Laxmi_Enterprises_Expo_Contacts.vcf`);
    if (showToast) showToast("✓ Downloaded vCard (.vcf) for WhatsApp Broadcast Lists");
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === filteredLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const toggleSelectLead = (id) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="page-content" style={{ padding: "20px 24px" }}>
      
      {/* TOP HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "1.4rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#25D366",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <MessageCircle size={20} />
            </span>
            Expo Details & WhatsApp Broadcast
          </h2>
          <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-muted)" }}>
            Kisan Mela & Agri Expo visitor registry: Name, Village, Mobile & Note Remark with 1-Click WhatsApp Bulk Campaigns
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="outline"
            onClick={handleDownloadVCF}
            style={{ color: "#128C7E", borderColor: "#25D366" }}
            title="Download .vcf to import contacts into WhatsApp Broadcast"
          >
            <Smartphone size={14} style={{ marginRight: 6 }} /> Export VCF
          </button>

          {/* WHATSAPP BULK CAMPAIGN PRIMARY BUTTON */}
          <button
            type="button"
            className="primary"
            onClick={() => setWhatsAppModalOpen(true)}
            style={{
              background: "#25D366",
              borderColor: "#25D366",
              color: "#fff",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Send size={15} /> WhatsApp Bulk Message
          </button>

          <button
            type="button"
            className="primary"
            onClick={handleOpenAdd}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={16} /> Record Expo Visitor
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        
        {/* KPI 1: Total Visitors */}
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Expo Visitors</span>
            <div className="stat-icon" style={{ background: "rgba(0, 91, 181, 0.12)", color: "var(--primary)" }}>
              <Users size={19} />
            </div>
          </div>
          <div className="stat-value">{expoLeads.length}</div>
          <div className="trend positive">
            <span>Registered at Stall Registry</span>
          </div>
        </div>

        {/* KPI 2: Villages Covered */}
        <div className="stat-card">
          <div className="stat-top">
            <span>Villages (गावे) Covered</span>
            <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
              <MapPin size={19} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {uniqueVillagesCount}
          </div>
          <div className="trend positive">
            <span>Rural Outreach Footprint</span>
          </div>
        </div>

        {/* KPI 3: WhatsApp Follow-ups */}
        <div className="stat-card">
          <div className="stat-top">
            <span>WhatsApp Follow-ups</span>
            <div className="stat-icon" style={{ background: "rgba(37, 211, 102, 0.15)", color: "#128C7E" }}>
              <MessageCircle size={19} />
            </div>
          </div>
          <div className="stat-value" style={{ color: "#128C7E" }}>
            {followedUpCount}
          </div>
          <div className="trend positive">
            <span>{expoLeads.length > 0 ? Math.round((followedUpCount / expoLeads.length) * 100) : 0}% Engagement Rate</span>
          </div>
        </div>

        {/* KPI 4: Sector Categories */}
        <div className="stat-card">
          <div className="stat-top">
            <span>Sectors Profiled</span>
            <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#d97706" }}>
              <Building2 size={19} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <div>
              <small style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Feed Shop</small>
              <strong style={{ fontSize: "1.05rem", color: "#059669" }}>
                {expoLeads.filter(l => l.category === "Animal Feed Shop").length}
              </strong>
            </div>
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 8 }}>
              <small style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Dairy</small>
              <strong style={{ fontSize: "1.05rem", color: "#0284c7" }}>
                {expoLeads.filter(l => l.category === "Dairy").length}
              </strong>
            </div>
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 8 }}>
              <small style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Farmers</small>
              <strong style={{ fontSize: "1.05rem", color: "#d97706" }}>
                {expoLeads.filter(l => l.category === "Farmers").length}
              </strong>
            </div>
          </div>
          <div className="trend positive" style={{ marginTop: 6 }}>
            <span>Agri Expos & Melas</span>
          </div>
        </div>

      </div>

      {/* TABLE CARD */}
      <div className="card table-card">
        
        {/* CARD HEAD WITH FILTER TABS, EVENT SELECTOR & SEARCH */}
        <div className="card-head" style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          
          {/* SECTOR FILTER TABS */}
          <div className="filter-pills-bar" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className={`filter-pill ${sectorFilter === "All" ? "active" : ""}`}
              onClick={() => setSectorFilter("All")}
            >
              All Visitors ({expoLeads.length})
            </button>

            <button
              className={`filter-pill ${sectorFilter === "Animal Feed Shop" ? "active" : ""}`}
              onClick={() => setSectorFilter("Animal Feed Shop")}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <Wheat size={13} style={{ color: "#059669" }} />
              Feed Shop ({expoLeads.filter(l => l.category === "Animal Feed Shop").length})
            </button>

            <button
              className={`filter-pill ${sectorFilter === "Dairy" ? "active" : ""}`}
              onClick={() => setSectorFilter("Dairy")}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <Milk size={13} style={{ color: "#0284c7" }} />
              Dairy Centers ({expoLeads.filter(l => l.category === "Dairy").length})
            </button>

            <button
              className={`filter-pill ${sectorFilter === "Farmers" ? "active" : ""}`}
              onClick={() => setSectorFilter("Farmers")}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <Tractor size={13} style={{ color: "#d97706" }} />
              Farmers ({expoLeads.filter(l => l.category === "Farmers").length})
            </button>
          </div>

          {/* EVENT SELECTOR & SEARCH */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select
              className="form-select"
              style={{ maxWidth: 220, fontSize: "0.82rem", padding: "6px 10px" }}
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              {availableEvents.map(ev => (
                <option key={ev} value={ev}>
                  {ev === "All" ? "All Exhibitions" : ev}
                </option>
              ))}
            </select>

            <div className="search-bar" style={{ width: 260 }}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Search name, village, mobile, note..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* SELECTED ACTIONS BAR (If user checked any rows) */}
        {selectedLeadIds.size > 0 && (
          <div style={{ background: "rgba(37, 211, 102, 0.12)", borderBottom: "1px solid rgba(37, 211, 102, 0.3)", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#128C7E", display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={16} /> {selectedLeadIds.size} Visitors Selected for Follow-up
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="primary"
                onClick={() => setWhatsAppModalOpen(true)}
                style={{ background: "#25D366", borderColor: "#25D366", fontSize: "0.8rem", padding: "5px 12px" }}
              >
                <Send size={14} style={{ marginRight: 5 }} /> Launch WhatsApp Broadcast to Selected ({selectedLeadIds.size})
              </button>
              <button
                type="button"
                className="outline"
                onClick={() => setSelectedLeadIds(new Set())}
                style={{ fontSize: "0.8rem", padding: "5px 10px" }}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* TABLE WRAPPER */}
        <div className="table-wrapper">
          {filteredLeads.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
              <MessageCircle size={38} style={{ opacity: 0.3, marginBottom: 12, color: "#25D366" }} />
              <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-main)" }}>No Expo Visitors Found</h4>
              <p style={{ margin: "4px 0 16px 0", fontSize: "0.84rem" }}>
                {search ? `No visitor records match "${search}". Try resetting the search.` : "No expo visitors recorded yet."}
              </p>
              <button type="button" className="primary" onClick={handleOpenAdd} style={{ fontSize: "0.84rem" }}>
                <Plus size={14} style={{ marginRight: 6 }} /> Record Expo Visitor
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.size === filteredLeads.length && filteredLeads.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th style={{ width: 220 }}>Visitor Name & Sector</th>
                  <th style={{ width: 180 }}>Village (गाव) & Location</th>
                  <th style={{ width: 170 }}>Mobile Number & WhatsApp</th>
                  <th>Note / Remark (Inquiry Details)</th>
                  <th style={{ width: 160 }}>Exhibition Event</th>
                  <th style={{ width: 110, textAlign: "center" }}>Follow-up</th>
                  <th style={{ width: 100, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const isFeed = lead.category === "Animal Feed Shop";
                  const isDairy = lead.category === "Dairy";
                  const isFarmer = lead.category === "Farmers";
                  const isSelected = selectedLeadIds.has(lead.id);

                  return (
                    <tr key={lead.id} style={{ background: isSelected ? "rgba(37, 211, 102, 0.04)" : "transparent" }}>
                      {/* Checkbox */}
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectLead(lead.id)}
                        />
                      </td>

                      {/* Visitor Name & Category */}
                      <td>
                        <div className="person">
                          <div className="mini-avatar" style={{
                            background: isDairy ? "rgba(2, 132, 199, 0.12)" :
                                        isFarmer ? "rgba(217, 119, 6, 0.12)" : "rgba(16, 185, 129, 0.12)",
                            color: isDairy ? "#0284c7" :
                                   isFarmer ? "#d97706" : "#059669"
                          }}>
                            {(lead.name || "V")[0]}
                          </div>
                          <div>
                            <b
                              style={{ color: "var(--text-main)", fontSize: "13px", cursor: "pointer" }}
                              onClick={() => setViewingLead(lead)}
                              title={`View full details of ${lead.name}`}
                            >
                              {lead.name}
                            </b>
                            <div style={{ marginTop: 3 }}>
                              <span className={`client-type-badge ${
                                isDairy ? "dairy" : isFarmer ? "farmers" : "feed-shop"
                              }`}>
                                {isDairy ? <Milk size={11} /> : isFarmer ? <Tractor size={11} /> : <Wheat size={11} />}
                                {lead.category || "Visitor"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Village (गाव) & Location */}
                      <td>
                        <div style={{ fontSize: "12.5px", lineHeight: 1.4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-main)", fontWeight: 650 }}>
                            <MapPin size={13} style={{ color: "var(--primary)" }} />
                            <span>{lead.village}</span>
                          </div>
                          {(lead.taluka || lead.district) && (
                            <div style={{ color: "var(--text-muted)", fontSize: "11px", paddingLeft: 18 }}>
                              {lead.taluka ? `${lead.taluka}, ` : ""}{lead.district || "Maharashtra"}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Mobile Number & Direct WhatsApp Button */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <code style={{ fontSize: "12px", fontWeight: 700 }}>
                            {lead.mobile}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleDirectWhatsApp(lead)}
                            style={{
                              background: "#25D366",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4
                            }}
                            title={`Send direct WhatsApp message to ${lead.name}`}
                          >
                            <MessageCircle size={13} /> Chat
                          </button>
                        </div>
                      </td>

                      {/* Note / Remark */}
                      <td>
                        <div style={{
                          background: "var(--table-hover)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          padding: "6px 10px",
                          fontSize: "12px",
                          lineHeight: 1.4,
                          color: "var(--text-main)"
                        }}>
                          💬 <b>Note:</b> {lead.remark}
                        </div>
                      </td>

                      {/* Exhibition Event & Date */}
                      <td style={{ fontSize: "12px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {lead.expoName}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 2 }}>
                          {lead.date}
                        </div>
                      </td>

                      {/* Follow-up Status */}
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge ${
                          lead.status === "Converted" ? "success" :
                          lead.status === "Followed Up" ? "warning" : "muted"
                        }`}>
                          {lead.status || "New Lead"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "center" }}>
                        <div className="row-actions" style={{ justifyContent: "center" }}>
                          <button
                            title={`View Full Details of ${lead.name}`}
                            onClick={() => setViewingLead(lead)}
                            style={{ color: "var(--accent)" }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            title={`Chat with ${lead.name} on WhatsApp`}
                            onClick={() => handleDirectWhatsApp(lead)}
                            style={{ color: "#25D366" }}
                          >
                            <MessageCircle size={15} />
                          </button>
                          <button
                            title="Edit Visitor Entry"
                            onClick={() => handleOpenEdit(lead)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            title="Delete Visitor"
                            onClick={() => setDeletingLead(lead)}
                          >
                            <Trash2 size={14} style={{ color: "var(--danger)" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD / EDIT EXPO LEAD */}
      <ExpoLeadModal
        key={editingLead ? editingLead.id : "new-expo-lead"}
        isOpen={leadModalOpen}
        onClose={() => { setLeadModalOpen(false); setEditingLead(null); }}
        onSave={handleSaveLead}
        leadToEdit={editingLead}
        nextId={nextLeadId}
        company={company}
      />

      {/* MODAL 2: WHATSAPP BULK CAMPAIGN MODAL */}
      <WhatsAppBulkModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        leads={selectedLeadIds.size > 0 ? expoLeads.filter(l => selectedLeadIds.has(l.id)) : expoLeads}
        company={company}
        showToast={showToast}
      />

      {/* MODAL 3: DELETE CONFIRMATION */}
      <DeleteConfirmModal
        isOpen={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Lead Removal"
        message={deletingLead ? `Are you sure you want to remove ${deletingLead.name} (${deletingLead.village}) from the Expo visitor registry?` : ""}
      />

      {/* MODAL 4: VIEW EXPO LEAD RECORD */}
      <ExpoLeadViewModal
        isOpen={!!viewingLead}
        onClose={() => setViewingLead(null)}
        lead={viewingLead}
        company={company}
        onEdit={(lead) => {
          setViewingLead(null);
          handleOpenEdit(lead);
        }}
        onDelete={(lead) => {
          setViewingLead(null);
          setDeletingLead(lead);
        }}
        onStatusChange={handleStatusChange}
        showToast={showToast}
      />

    </div>
  );
}
