import React, { useState, useMemo } from "react";
import {
  Users, Plus, Search, Filter, Pencil, Trash2, Receipt, Eye, X,
  Building2, Milk, Tractor, Wheat, Phone, Mail, MapPin, Download, AlertTriangle,
  IndianRupee, RotateCcw, CheckCircle2, Calendar
} from "lucide-react";
import ClientModal from "./ClientModal";
import ClientDetailsModal from "./ClientDetailsModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import InvoiceModal from "./InvoiceModal";
import ExportMenu from "./ExportMenu";
import { erpApi } from "../services/api";
import { downloadCSV } from "../utils/exportUtils";

export default function ClientsPage({ 
  clients, 
  onSaveClients, 
  invoices = [], 
  onSaveInvoices, 
  onCreateInvoice,
  products = [],
  company = {} 
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [invoiceForClient, setInvoiceForClient] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const nextId = useMemo(() => {
    const ids = clients
      .map(c => {
        const match = c.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = ids.length ? Math.max(...ids) : 0;
    return `CL-${String(maxNum + 1).padStart(3, "0")}`;
  }, [clients]);

  const feedShopCount = useMemo(() => clients.filter(c => c.clientType === "Animal Feed Shop").length, [clients]);
  const dairyCount = useMemo(() => clients.filter(c => c.clientType === "Dairy").length, [clients]);
  const farmersCount = useMemo(() => clients.filter(c => c.clientType === "Farmers").length, [clients]);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const matchesCategory = categoryFilter === "All" || c.clientType === categoryFilter;
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      const matchesTier = tierFilter === "All" || (c.tier || "Gold") === tierFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.clientType && c.clientType.toLowerCase().includes(q)) ||
        (c.village && c.village.toLowerCase().includes(q)) ||
        (c.taluka && c.taluka.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
        (c.contact && c.contact.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.productTypes && c.productTypes.toLowerCase().includes(q)) ||
        (c.companies && c.companies.toLowerCase().includes(q)) ||
        (c.brands && c.brands.toLowerCase().includes(q)) ||
        (c.animalDetails && c.animalDetails.toLowerCase().includes(q)) ||
        (c.gstin && c.gstin.toLowerCase().includes(q))
      );
      return matchesCategory && matchesStatus && matchesTier && matchesSearch;
    });
  }, [clients, search, categoryFilter, statusFilter, tierFilter]);

  const totalRevenue = useMemo(() => clients.reduce((sum, c) => sum + (Number(c.revenue) || 0), 0), [clients]);
  const totalOutstanding = useMemo(() => clients.reduce((sum, c) => sum + (Number(c.outstanding) || 0), 0), [clients]);
  const activeCount = useMemo(() => clients.filter(c => c.status === "Active").length, [clients]);

  const handleOpenAdd = (defaultType = "Animal Feed Shop") => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleSaveClient = (clientData) => {
    if (editingClient) {
      const updated = clients.map(c => c.id === editingClient.id ? clientData : c);
      onSaveClients(updated);
      showToast(`✓ Updated ${clientData.name} details successfully!`);
    } else {
      const exists = clients.some(c => c.id.toLowerCase() === clientData.id.toLowerCase());
      if (exists) {
        showToast(`⚠️ A client with ID ${clientData.id} already exists.`);
        return;
      }
      const updated = [clientData, ...clients];
      onSaveClients(updated);
      showToast(`✓ Added ${clientData.name} (${clientData.clientType}) to directory!`);
    }
    setModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingClient) return;
    const updated = clients.filter(c => c.id !== deletingClient.id);
    onSaveClients(updated);
    showToast(`✓ Client ${deletingClient.name} deleted.`);
    setDeletingClient(null);
  };

  const handleRefreshDb = () => {
    erpApi.getAllData().then(res => {
      if (res.data?.clients) {
        onSaveClients(res.data.clients);
        showToast("✓ Refreshed live clients from MySQL database!");
      }
    }).catch(err => {
      showToast("⚠️ Refresh notice: " + err.message);
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Client ID", "Category / Type", "Client Name", "Village (गाव)", "Taluka (तालुका)",
      "District (जिल्हा)", "Contact Number", "Email", "Date of Birth (DOB)", "Animal Feed - Products",
      "Animal Feed - Companies", "Animal Feed - Brands", "Dairy - Suppliers Count", "Dairy - Milk Quantity",
      "Farmers - Animals Count", "Farmers - Animal Details", "Tier", "Payment Terms", "Orders",
      "Revenue_INR", "Outstanding_INR", "Status"
    ];
    const rows = filtered.map(c => [
      `"${c.id}"`,
      `"${c.clientType || 'Animal Feed Shop'}"`,
      `"${c.name}"`,
      `"${c.village || ''}"`,
      `"${c.taluka || ''}"`,
      `"${c.district || c.city || ''}"`,
      `"${c.contact}"`,
      `"${c.email || ''}"`,
      `"${c.dob || ''}"`,
      `"${c.productTypes || ''}"`,
      `"${c.companies || ''}"`,
      `"${c.brands || ''}"`,
      c.numberOfSuppliers || '',
      `"${c.milkQuantity || ''}"`,
      c.numberOfAnimals || '',
      `"${c.animalDetails || ''}"`,
      `"${c.tier || 'Gold'}"`,
      `"${c.paymentTerms || 'Net 30'}"`,
      c.orders,
      c.revenue,
      c.outstanding || 0,
      `"${c.status}"`
    ]);
    downloadCSV(`laxmi_enterprises_clients_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast("✓ Exported clients directory spreadsheet.");
  };

  return (
    <div className="page">
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Summary KPI Cards across 3 Agribusiness Sectors */}
      <div className="module-quick-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="client-stat-pill" onClick={() => setCategoryFilter("All")} style={{ cursor: "pointer" }}>
          <div className="client-stat-pill-icon"><Users size={20} /></div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Total Registered Accounts</div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{clients.length} Clients</div>
          </div>
        </div>

        <div className="client-stat-pill" onClick={() => setCategoryFilter("Animal Feed Shop")} style={{ cursor: "pointer" }}>
          <div className="client-stat-pill-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}>
            <Wheat size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>1. Animal Feed Shops</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#059669" }}>{feedShopCount} Shops</div>
          </div>
        </div>

        <div className="client-stat-pill" onClick={() => setCategoryFilter("Dairy")} style={{ cursor: "pointer" }}>
          <div className="client-stat-pill-icon" style={{ background: "rgba(2, 132, 199, 0.12)", color: "#0284c7" }}>
            <Milk size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>2. Dairies / Centers</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#0284c7" }}>{dairyCount} Dairies</div>
          </div>
        </div>

        <div className="client-stat-pill" onClick={() => setCategoryFilter("Farmers")} style={{ cursor: "pointer" }}>
          <div className="client-stat-pill-icon" style={{ background: "rgba(217, 119, 6, 0.12)", color: "#d97706" }}>
            <Tractor size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>3. Farmers (शेतकरी)</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#d97706" }}>{farmersCount} Farmers</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "var(--badge-brand-bg)", color: "var(--primary)" }}>
            <IndianRupee size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Total Gross Billings</div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>₹{totalRevenue.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: totalOutstanding > 0 ? "rgba(239, 68, 68, 0.12)" : "var(--badge-brand-bg)", color: totalOutstanding > 0 ? "var(--danger)" : "var(--text-muted)" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Outstanding Balance</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: totalOutstanding > 0 ? "var(--danger)" : "inherit" }}>
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Action Header & Multi-Category Filters */}
      <div className="page-actions" style={{ alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          
          {/* Category Filter Pills (Animal Feed Shop, Dairy, Farmers) */}
          <div className="filter-pills-bar">
            <button
              className={`filter-pill ${categoryFilter === "All" ? "active" : ""}`}
              onClick={() => setCategoryFilter("All")}
            >
              All Clients ({clients.length})
            </button>
            <button
              className={`filter-pill ${categoryFilter === "Animal Feed Shop" ? "active" : ""}`}
              onClick={() => setCategoryFilter("Animal Feed Shop")}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <Wheat size={13} /> 🌾 Animal Feed Shop ({feedShopCount})
            </button>
            <button
              className={`filter-pill ${categoryFilter === "Dairy" ? "active" : ""}`}
              onClick={() => setCategoryFilter("Dairy")}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <Milk size={13} /> 🥛 Dairy ({dairyCount})
            </button>
            <button
              className={`filter-pill ${categoryFilter === "Farmers" ? "active" : ""}`}
              onClick={() => setCategoryFilter("Farmers")}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <Tractor size={13} /> 🚜 Farmers ({farmersCount})
            </button>
          </div>

          <div className="filter-pills-bar">
            {["All", "Active", "Inactive"].map(st => (
              <button
                key={st}
                className={`filter-pill ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st} ({st === "All" ? clients.length : clients.filter(c => c.status === st).length})
              </button>
            ))}
          </div>

          <div className="filter-pills-bar">
            {["All", "Platinum", "Gold", "Silver", "Bronze"].map(tier => (
              <button
                key={tier}
                className={`filter-pill ${tierFilter === tier ? "active" : ""}`}
                onClick={() => setTierFilter(tier)}
              >
                {tier === "All" ? "All Tiers" : tier}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button 
            type="button"
            className="outline" 
            onClick={handleRefreshDb} 
            title="Refresh live clients from MySQL database"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RotateCcw size={14} /> Refresh DB
          </button>
          <ExportMenu
            label="Export"
            category="Clients"
            onExportCSV={handleExportCSV}
            showToast={showToast}
          />
          <button className="primary" onClick={() => handleOpenAdd(categoryFilter !== "All" ? categoryFilter : "Animal Feed Shop")}>
            <Plus size={16} /> Add Client
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card table-card">
        <div className="table-toolbar">
          <div className="local-search">
            <Search size={16} />
            <input
              placeholder="Search by client name, village, taluka, district, products, brands, contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing {filtered.length} of {clients.length} enterprise records
          </span>
        </div>

        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={26} /></div>
              <h4 style={{ fontSize: 16, color: "var(--text-main)", marginBottom: 6 }}>No Clients Found</h4>
              <p style={{ fontSize: 13, marginBottom: 16 }}>
                {clients.length === 0 
                  ? "Your client directory currently has 0 records. Add your first client account or refresh from live MySQL database."
                  : "No client records match your current search query or filter selection."}
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                {clients.length === 0 && (
                  <button className="primary" onClick={handleRefreshDb}>
                    <RotateCcw size={15} /> Refresh Live Database
                  </button>
                )}
                <button className="outline" onClick={() => handleOpenAdd(categoryFilter !== "All" ? categoryFilter : "Animal Feed Shop")}><Plus size={15} /> Add New Client</button>
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Client ID & Category</th>
                  <th>Client / Firm & DOB</th>
                  <th>Location (Village / Taluka / Dist)</th>
                  <th>Contact & Email</th>
                  <th>Specific Information</th>
                  <th>Orders & Billings</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <code>{c.id}</code>
                      <div style={{ marginTop: 4 }}>
                        <span className={`client-type-badge ${
                          c.clientType === "Dairy" ? "dairy" :
                          c.clientType === "Farmers" ? "farmers" : "feed-shop"
                        }`}>
                          {c.clientType === "Dairy" ? <Milk size={11} /> :
                           c.clientType === "Farmers" ? <Tractor size={11} /> :
                           <Wheat size={11} />}
                          {c.clientType === "Dairy" ? "Dairy" :
                           c.clientType === "Farmers" ? "Farmer" : "Feed Shop"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="person">
                        <div className="mini-avatar" style={{
                          background: c.clientType === "Dairy" ? "rgba(2, 132, 199, 0.12)" :
                                      c.clientType === "Farmers" ? "rgba(217, 119, 6, 0.12)" : "rgba(16, 185, 129, 0.12)",
                          color: c.clientType === "Dairy" ? "#0284c7" :
                                 c.clientType === "Farmers" ? "#d97706" : "#059669"
                        }}>
                          {c.name ? c.name[0] : "C"}
                        </div>
                        <div>
                          <b 
                            style={{ cursor: "pointer", color: "var(--text-main)" }} 
                            onClick={() => setViewingClient(c)}
                            title="Click to view full client profile"
                          >
                            {c.name}
                          </b>
                          {c.contactPerson && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              Prop: {c.contactPerson}
                            </div>
                          )}
                          {c.dob && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                              <Calendar size={11} /> DOB: {c.dob}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                        <MapPin size={13} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 650, fontSize: "12.5px" }}>
                            {c.village || c.city || "-"}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {c.taluka ? `${c.taluka}, ` : ""}Dist: {c.district || c.city || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: 3 }}>
                        <a href={`tel:${c.contact}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "inherit", textDecoration: "none" }}>
                          <Phone size={11} style={{ color: "var(--primary)" }} /> {c.contact}
                        </a>
                        {c.email && (
                          <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", textDecoration: "none", fontSize: "11px" }}>
                            <Mail size={11} /> {c.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      {c.clientType === "Animal Feed Shop" && (
                        <div style={{ maxWidth: 260, fontSize: "11px", lineHeight: 1.4 }}>
                          {c.productTypes && (
                            <div style={{ color: "var(--text-main)", fontWeight: 600, marginBottom: 2 }}>
                              <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Products: </span>
                              {c.productTypes.length > 36 ? `${c.productTypes.slice(0, 36)}...` : c.productTypes}
                            </div>
                          )}
                          {c.brands && (
                            <div style={{ color: "var(--primary)" }}>
                              <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Brands: </span>
                              {c.brands.length > 30 ? `${c.brands.slice(0, 30)}...` : c.brands}
                            </div>
                          )}
                          {c.numberOfAnimals && (
                            <div style={{ color: "#059669", fontSize: "10.5px", marginTop: 2, fontWeight: 600 }}>
                              🐾 {c.numberOfAnimals}
                            </div>
                          )}
                        </div>
                      )}
                      {c.clientType === "Dairy" && (
                        <div style={{ fontSize: "11.5px", lineHeight: 1.4 }}>
                          <div style={{ color: "#0284c7", fontWeight: 700 }}>
                            🥛 {c.numberOfSuppliers || 0} Suppliers
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                            Qty: <b>{c.milkQuantity || "-"}</b>
                          </div>
                        </div>
                      )}
                      {c.clientType === "Farmers" && (
                        <div style={{ fontSize: "11.5px", lineHeight: 1.4 }}>
                          <div style={{ color: "#d97706", fontWeight: 700 }}>
                            🚜 {c.numberOfAnimals || 0} Animals
                          </div>
                          {c.animalDetails && (
                            <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                              {c.animalDetails.length > 32 ? `${c.animalDetails.slice(0, 32)}...` : c.animalDetails}
                            </div>
                          )}
                        </div>
                      )}
                      {!c.clientType && (
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>General Account</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: "12.5px" }}>
                        ₹{Number(c.revenue).toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {c.orders} orders • {c.paymentTerms || "Net 30"}
                      </div>
                    </td>
                    <td className="money" style={{ color: Number(c.outstanding) > 0 ? "var(--danger)" : "var(--text-muted)", fontWeight: Number(c.outstanding) > 0 ? 800 : 500 }}>
                      ₹{Number(c.outstanding || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className={`badge ${c.status === "Active" ? "success" : "muted"}`}>
                        <span
                          className={`badge-dot ${c.status === "Active" ? "pulse" : ""}`}
                          style={{
                            background: c.status === "Active" ? "#10b981" : "#94a3b8",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            display: "inline-block",
                            marginRight: 6
                          }}
                        />
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          title={`View Full Profile of ${c.name}`}
                          onClick={() => setViewingClient(c)}
                          style={{ color: "var(--accent)" }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title={`Create & Download Tax Invoice for ${c.name} to PC`}
                          onClick={() => setInvoiceForClient(c)}
                          style={{ color: "var(--primary)" }}
                        >
                          <Receipt size={14} />
                        </button>
                        <button title="Edit Client Information" onClick={() => handleOpenEdit(c)}>
                          <Pencil size={14} />
                        </button>
                        <button title="Delete Client" onClick={() => setDeletingClient(c)}>
                          <Trash2 size={14} style={{ color: "var(--danger)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ClientModal
        key={editingClient ? editingClient.id : "new-client"}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingClient(null); }}
        onSave={handleSaveClient}
        clientToEdit={editingClient}
        nextId={nextId}
        existingIds={clients.map(c => c.id)}
      />

      <ClientDetailsModal
        isOpen={!!viewingClient}
        onClose={() => setViewingClient(null)}
        client={viewingClient}
        onEdit={(c) => { setViewingClient(null); handleOpenEdit(c); }}
        onCreateInvoice={(c) => { setViewingClient(null); setInvoiceForClient(c); }}
        onDelete={(c) => {
          setViewingClient(null);
          setDeletingClient(c);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Account Deletion"
        message={deletingClient ? `Are you sure you want to remove ${deletingClient.name} (${deletingClient.id}) from the client directory?` : ""}
        details={deletingClient ? `This account has ${deletingClient.orders} orders and ₹${Number(deletingClient.revenue).toLocaleString("en-IN")} in recorded revenue.` : ""}
      />


      {invoiceForClient && (
        <InvoiceModal
          isOpen={!!invoiceForClient}
          onClose={() => setInvoiceForClient(null)}
          onSave={(newInv) => {
            if (onCreateInvoice) {
              onCreateInvoice(newInv);
            } else if (onSaveInvoices) {
              onSaveInvoices([newInv, ...(invoices || [])]);
            }
            showToast(`✓ Created and issued Invoice ${newInv.id} for ${invoiceForClient.name}`);
            setInvoiceForClient(null);
          }}
          clients={clients}
          products={products}
          nextId={`LE-INV-2026-${String((invoices?.length || 0) + 1).padStart(3, "0")}`}
          company={company}
          defaultClient={invoiceForClient}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ==========================================================================
// PRODUCT MODAL (ADD / EDIT) WITH SPECIFIC STOCK CALCULATION
// ==========================================================================
