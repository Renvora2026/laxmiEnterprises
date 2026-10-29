import React, { useState, useMemo } from "react";
import {
  Truck, Plus, Search, Filter, Pencil, Trash2, Download,
  Phone, Mail, MapPin, Building2, CreditCard, MessageCircle,
  CheckCircle2, AlertTriangle, X, ShieldCheck, Milk, Tractor, Wheat, Store
} from "lucide-react";
import VendorModal from "./VendorModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ExportMenu from "./ExportMenu";
import { downloadCSV } from "../utils/exportUtils";
import { erpApi } from "../services/api";

export const normalizeVendorCategory = (cat) => {
  const c = String(cat || "").trim().toLowerCase();
  if (c.includes("feed") || c.includes("raw feed") || c.includes("animal")) return "Animal Feed Shop";
  if (c.includes("dairy") || c.includes("milk")) return "Dairy";
  if (c.includes("farm")) return "Farmers";
  return "Animal Feed Shop";
};

export default function VendorsPage({ vendors = [], onSaveVendors }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Auto-generate next vendor ID (e.g. VEN-001)
  const nextId = useMemo(() => {
    const nums = (vendors || [])
      .map(v => {
        const idStr = String(v.vendorId || v.id || "");
        const match = idStr.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = nums.length ? Math.max(...nums) : 0;
    return `VEN-${String(maxNum + 1).padStart(3, "0")}`;
  }, [vendors]);

  // Exactly the 3 agribusiness enterprise categories
  const categories = ["All", "Animal Feed Shop", "Dairy", "Farmers"];

  // Filtered vendors
  const filtered = useMemo(() => {
    return (vendors || []).filter(v => {
      const vCat = normalizeVendorCategory(v.category);
      const matchesCat = categoryFilter === "All" || vCat === categoryFilter;
      const q = search.toLowerCase().trim();
      if (!q) return matchesCat;

      const name = (v.name || "").toLowerCase();
      const comp = (v.companyName || "").toLowerCase();
      const id = (v.vendorId || v.id || "").toLowerCase();
      const phone = (v.phone || v.contact || "").toLowerCase();
      const person = (v.contactPerson || "").toLowerCase();
      const gstin = (v.gstin || "").toLowerCase();
      const city = (v.city || v.village || "").toLowerCase();

      const matchesSearch =
        name.includes(q) ||
        comp.includes(q) ||
        id.includes(q) ||
        phone.includes(q) ||
        person.includes(q) ||
        gstin.includes(q) ||
        city.includes(q);

      return matchesCat && matchesSearch;
    });
  }, [vendors, categoryFilter, search]);

  // Metric stats for the 3 agribusiness sectors
  const totalVendors = vendors.length;
  const feedSuppliers = vendors.filter(v => normalizeVendorCategory(v.category) === "Animal Feed Shop").length;
  const dairySuppliers = vendors.filter(v => normalizeVendorCategory(v.category) === "Dairy").length;
  const farmerSuppliers = vendors.filter(v => normalizeVendorCategory(v.category) === "Farmers").length;

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setModalOpen(true);
  };

  const handleSaveVendor = async (vendorData) => {
    if (editingVendor) {
      const targetId = vendorData.vendorId || vendorData.id;
      const updated = vendors.map(v =>
        (v.id === editingVendor.id || v.vendorId === editingVendor.vendorId) ? vendorData : v
      );
      onSaveVendors(updated);
      try {
        await erpApi.updateVendor(targetId, vendorData);
      } catch (err) {
        console.warn("Direct vendor update notice:", err.message);
      }
      showToast(`✓ Updated vendor ${vendorData.name}!`);
    } else {
      const exists = vendors.some(v =>
        String(v.vendorId || v.id).toLowerCase() === String(vendorData.vendorId || vendorData.id).toLowerCase()
      );
      if (exists) {
        showToast(`⚠️ Vendor ID ${vendorData.vendorId} already exists.`);
        return;
      }
      const updated = [vendorData, ...vendors];
      onSaveVendors(updated);
      try {
        await erpApi.createVendor(vendorData);
      } catch (err) {
        console.warn("Direct vendor create notice:", err.message);
      }
      showToast(`✓ Registered new vendor ${vendorData.name}!`);
    }
    setModalOpen(false);
    setEditingVendor(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVendor) return;
    const targetId = deletingVendor.vendorId || deletingVendor.id;
    const updated = vendors.filter(v => (v.vendorId || v.id) !== targetId);
    onSaveVendors(updated);
    try {
      await erpApi.deleteVendor(targetId);
    } catch (err) {
      console.warn("Direct vendor delete notice:", err.message);
    }
    showToast(`✓ Removed vendor ${deletingVendor.name}.`);
    setDeletingVendor(null);
  };

  const handleExportCSV = () => {
    const headers = [
      "Vendor_ID",
      "Vendor_Name",
      "Category",
      "Contact_Person",
      "Phone",
      "Email",
      "GSTIN",
      "City",
      "Payment_Terms",
      "Status"
    ];
    const rows = filtered.map(v => [
      v.vendorId || v.id,
      v.name,
      v.category || "General",
      v.contactPerson || "",
      v.phone || v.contact || "",
      v.email || "",
      v.gstin || "",
      v.city || v.village || "",
      v.paymentTerms || "Net 15 Days",
      v.status || "Active"
    ]);
    downloadCSV("Vendors_Directory_Laxmi_Enterprises", headers, rows);
    showToast("✓ Exported Vendor Directory to CSV!");
  };

  return (
    <div className="page">
      {/* Toast */}
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* QUICK STATS CARDS FOR THE 3 AGRIBUSINESS SECTORS */}
      <div className="module-quick-stats">
        <div className="client-stat-pill">
          <div className="client-stat-pill-icon"><Truck size={20} /></div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Total Suppliers</div>
            <div style={{ fontSize: "21px", fontWeight: 800 }}>{totalVendors} Vendors</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            <Wheat size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Animal Feed Shop</div>
            <div style={{ fontSize: "21px", fontWeight: 800 }}>{feedSuppliers} Suppliers</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "rgba(37,99,235,0.12)", color: "#2563eb" }}>
            <Milk size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Dairy Centers</div>
            <div style={{ fontSize: "21px", fontWeight: 800, color: "#2563eb" }}>{dairySuppliers} Dairies</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            <Tractor size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Direct Farmers</div>
            <div style={{ fontSize: "21px", fontWeight: 800, color: "var(--success)" }}>{farmerSuppliers} Farmers</div>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="page-actions" style={{ alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        {/* Exactly 3 Category Filter Pills */}
        <div className="filter-pills-bar" style={{ flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-pill ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginLeft: "auto" }}>
          <ExportMenu
            onExportCSV={handleExportCSV}
            onPrint={() => window.print()}
            label="Export Vendors"
          />
          <button className="primary" onClick={handleOpenAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="card table-card">
        <div className="table-toolbar">
          <div className="local-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search vendor name, ID, phone, GSTIN, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing {filtered.length} of {vendors.length} vendors
          </span>
        </div>

        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Truck size={28} /></div>
              <h4 style={{ fontSize: 16, color: "var(--text-main)", marginBottom: 6 }}>No Vendors Found</h4>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>
                {search ? "No vendors matched your search query." : "Register your raw material suppliers, dairy centers, and farm partners."}
              </p>
              <button className="primary" onClick={handleOpenAdd} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Plus size={15} /> Add First Vendor
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Vendor ID</th>
                  <th>Vendor / Trade Name</th>
                  <th>Procurement Category</th>
                  <th>Contact Person & Phone</th>
                  <th>GSTIN</th>
                  <th>City / District</th>
                  <th>Payment Terms</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const idStr = v.vendorId || v.id;
                  const isActive = (v.status || "Active") === "Active";
                  const cleanPhone = (v.phone || v.contact || "").replace(/\D/g, "");

                  return (
                    <tr key={idStr}>
                      <td>
                        <span style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          background: "var(--bg)",
                          padding: "2px 8px",
                          borderRadius: 4,
                          border: "1px solid var(--border)",
                        }}>
                          {idStr}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.88rem" }}>
                          {v.name}
                        </div>
                        {v.companyName && v.companyName !== v.name && (
                          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                            {v.companyName}
                          </div>
                        )}
                      </td>

                      <td>
                        <span style={{
                          fontSize: "0.78rem",
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "rgba(0,91,181,0.08)",
                          color: "var(--primary)",
                          fontWeight: 600,
                          display: "inline-block",
                        }}>
                          {normalizeVendorCategory(v.category)}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>
                          {v.contactPerson || "Sales Desk"}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Phone size={11} /> {v.phone || v.contact || "—"}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: v.gstin ? "var(--text-main)" : "var(--text-muted)" }}>
                          {v.gstin || "Unregistered"}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                          {v.city || v.village || "Maharashtra"}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          {v.paymentTerms || "Net 15 Days"}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${isActive ? "success" : "neutral"}`}>
                          <span className="badge-dot" />
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="row-actions" style={{ justifyContent: "center" }}>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat on WhatsApp"
                              style={{
                                color: "#059669",
                                display: "inline-flex",
                                alignItems: "center",
                                padding: 6,
                                borderRadius: 6,
                              }}
                            >
                              <MessageCircle size={15} />
                            </a>
                          )}
                          <button
                            title="Edit Vendor"
                            onClick={() => handleOpenEdit(v)}
                            style={{ padding: 6 }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            title="Delete Vendor"
                            onClick={() => setDeletingVendor(v)}
                            style={{ padding: 6 }}
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

      {/* VENDOR MODAL */}
      <VendorModal
        key={editingVendor ? editingVendor.id : "new-vendor"}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingVendor(null); }}
        onSave={handleSaveVendor}
        vendorToEdit={editingVendor}
        nextId={nextId}
        existingIds={vendors.map(v => v.vendorId || v.id)}
      />

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={!!deletingVendor}
        onClose={() => setDeletingVendor(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Vendor Removal"
        message={deletingVendor ? `Are you sure you want to remove ${deletingVendor.name} (${deletingVendor.vendorId || deletingVendor.id}) from the Vendor Directory?` : ""}
        details="This will delete the supplier record from active listings. Existing purchase vouchers referencing this vendor will remain preserved."
      />
    </div>
  );
}

