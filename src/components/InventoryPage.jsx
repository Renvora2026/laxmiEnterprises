import React, { useState, useMemo } from "react";
import {
  Boxes, Plus, Search, Filter, Pencil, Trash2, Download, AlertTriangle, Eye,
  ShoppingCart, Warehouse, Barcode, CheckCircle2, X
} from "lucide-react";
import InventoryModal from "./InventoryModal";
import InventoryViewDrawer from "./InventoryViewDrawer";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ExportMenu from "./ExportMenu";
import { downloadCSV } from "../utils/exportUtils";

export default function InventoryPage({ inventory, onSaveInventory, products }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [deletingInventory, setDeletingInventory] = useState(null);
  const [viewingInventory, setViewingInventory] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const nextId = useMemo(() => {
    const ids = inventory
      .map(i => {
        const match = i.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = ids.length ? Math.max(...ids) : 0;
    return `INV-${String(maxNum + 1).padStart(3, "0")}`;
  }, [inventory]);

  const filtered = useMemo(() => {
    return inventory.filter(i => {
      const matchesStatus = statusFilter === "All" || i.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchedProd = (products || []).find(p => String(p.id) === String(i.productId || i.id || i.sku)) || {};
      const pName = (i.product || i.productName || matchedProd.name || "").toLowerCase();
      const sCode = (i.sku || i.productId || matchedProd.id || i.id || "").toLowerCase();
      const iId = (i.id || "").toLowerCase();
      const loc = (i.location || i.warehouseLocation || "").toLowerCase();
      const matchesSearch = !q || (
        pName.includes(q) ||
        sCode.includes(q) ||
        iId.includes(q) ||
        loc.includes(q)
      );
      return matchesStatus && matchesSearch;
    });
  }, [inventory, products, search, statusFilter]);

  const totalIn = useMemo(() => inventory.reduce((sum, i) => {
    const matchedProd = (products || []).find(p => String(p.id) === String(i.productId || i.id || i.sku));
    const stockIn = Number(i.in ?? i.inwardStock ?? matchedProd?.inwardStock ?? 0);
    return sum + stockIn;
  }, 0), [inventory, products]);

  const totalOut = useMemo(() => inventory.reduce((sum, i) => {
    const matchedProd = (products || []).find(p => String(p.id) === String(i.productId || i.id || i.sku));
    const stockOut = Number(i.out ?? i.outwardStock ?? matchedProd?.outwardStock ?? 0);
    return sum + stockOut;
  }, 0), [inventory, products]);

  const totalBalance = useMemo(() => inventory.reduce((sum, i) => {
    const matchedProd = (products || []).find(p => String(p.id) === String(i.productId || i.id || i.sku));
    const balance = matchedProd && matchedProd.stock !== undefined ? Number(matchedProd.stock) : Number(i.stock ?? i.currentStock ?? 0);
    return sum + balance;
  }, 0), [inventory, products]);

  const lowCount = useMemo(() => inventory.filter(i => {
    const matchedProd = (products || []).find(p => String(p.id) === String(i.productId || i.id || i.sku));
    const balance = matchedProd && matchedProd.stock !== undefined ? Number(matchedProd.stock) : Number(i.stock ?? i.currentStock ?? 0);
    return i.status === "Low Stock" || i.status === "Out of Stock" || balance <= 10;
  }).length, [inventory, products]);

  const handleOpenAdd = () => {
    setEditingInventory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingInventory(item);
    setModalOpen(true);
  };

  const handleSaveInventory = (itemData) => {
    if (editingInventory) {
      const updated = inventory.map(i => i.id === editingInventory.id ? itemData : i);
      onSaveInventory(updated);
      showToast(`✓ Updated stock entry for ${itemData.product}!`);
    } else {
      const exists = inventory.some(i => i.id.toLowerCase() === itemData.id.toLowerCase());
      if (exists) {
        showToast(`⚠️ An inventory record with ID ${itemData.id} already exists.`);
        return;
      }
      const updated = [itemData, ...inventory];
      onSaveInventory(updated);
      showToast(`✓ Recorded stock movement for ${itemData.product}!`);
    }
    setModalOpen(false);
    setEditingInventory(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingInventory) return;
    const updated = inventory.filter(i => i.id !== deletingInventory.id);
    onSaveInventory(updated);
    showToast(`✓ Inventory entry ${deletingInventory.sku} removed.`);
    if (viewingInventory && viewingInventory.id === deletingInventory.id) {
      setViewingInventory(null);
    }
    setDeletingInventory(null);
  };

  const handleQuickAdjust = (item, adjustments) => {
    const updated = inventory.map(i => i.id === item.id ? { ...i, ...adjustments } : i);
    onSaveInventory(updated);
    if (viewingInventory && viewingInventory.id === item.id) {
      setViewingInventory(prev => ({ ...prev, ...adjustments }));
    }
  };

  const handleExportCSV = () => {
    const headers = ["Inventory_ID", "Product_Name", "SKU_Barcode", "Received_In", "Dispatched_Out", "Current_Balance", "Status", "Storage_Location"];
    const rows = filtered.map(i => [
      `"${i.id}"`,
      `"${i.product}"`,
      `"${i.sku}"`,
      i.in,
      i.out,
      i.stock,
      `"${i.status}"`,
      `"${i.location || 'Default Warehouse'}"`
    ]);
    downloadCSV(`laxmi_enterprises_inventory_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast("✓ Exported warehouse inventory ledger.");
  };

  return (
    <div className="page">
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="module-quick-stats">
        <div className="client-stat-pill">
          <div className="client-stat-pill-icon"><Boxes size={20} /></div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Total Inward (Received)</div>
            <div style={{ fontSize: "21px", fontWeight: 800 }}>+{totalIn.toLocaleString("en-IN")} Units</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            <ShoppingCart size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Total Outward (Dispatched)</div>
            <div style={{ fontSize: "21px", fontWeight: 800 }}>-{totalOut.toLocaleString("en-IN")} Units</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            <Warehouse size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Active Storage Balance</div>
            <div style={{ fontSize: "21px", fontWeight: 800, color: "var(--success)" }}>{totalBalance.toLocaleString("en-IN")} Units</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: lowCount > 0 ? "var(--warning-light)" : "var(--primary-light)", color: lowCount > 0 ? "var(--warning)" : "var(--primary)" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Low / Critical Stock</div>
            <div style={{ fontSize: "21px", fontWeight: 800, color: lowCount > 0 ? "var(--warning)" : "var(--text-main)" }}>{lowCount} SKUs</div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="page-actions" style={{ alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div className="filter-pills-bar">
          {["All", "In Stock", "Low Stock", "Out of Stock"].map(st => (
            <button
              key={st}
              className={`filter-pill ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st} ({st === "All" ? inventory.length : inventory.filter(i => i.status === st).length})
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <ExportMenu
            label="Export"
            category="Inventory"
            onExportCSV={handleExportCSV}
            showToast={showToast}
          />
          <button className="primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Stock Entry
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card table-card">
        <div className="table-toolbar">
          <div className="local-search">
            <Search size={16} />
            <input
              placeholder="Search by product, SKU, bay location..."
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
            Showing {filtered.length} of {inventory.length} records
          </span>
        </div>

        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Boxes size={26} /></div>
              <h4 style={{ fontSize: 16, color: "var(--text-main)", marginBottom: 6 }}>No Stock Records Found</h4>
              <p style={{ fontSize: 13, marginBottom: 16 }}>No inventory entries match your search query or filter.</p>
              <button className="primary" onClick={handleOpenAdd}><Plus size={15} /> Record Stock Entry</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Entry ID</th>
                  <th>Product Item</th>
                  <th>SKU Code</th>
                  <th>Stock In (+)</th>
                  <th>Stock Out (-)</th>
                  <th>Balance Units</th>
                  <th>Bay Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => {
                  const matchedProd = (products || []).find(p => String(p.id) === String(i.productId || i.id || i.sku)) || {};
                  const pName = i.product || i.productName || matchedProd.name || "Commercial Product";
                  const sCode = i.sku || i.productId || matchedProd.id || i.id;
                  const stockIn = Number(i.in ?? i.inwardStock ?? matchedProd.inwardStock ?? 0);
                  const stockOut = Number(i.out ?? i.outwardStock ?? matchedProd.outwardStock ?? 0);
                  const balance = Number(i.stock ?? i.currentStock ?? matchedProd.stock ?? 0);
                  const loc = i.location || i.warehouseLocation || "Warehouse A";
                  const isOut = i.status === "Out of Stock" || balance <= 0;
                  const isLow = i.status === "Low Stock" || (balance > 0 && balance <= 10);
                  return (
                    <tr key={i.id}>
                      <td>
                        <button
                          type="button"
                          onClick={() => setViewingInventory(i)}
                          title="Inspect item in slide-over drawer"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                        >
                          <code style={{
                            color: "var(--primary)",
                            fontWeight: 700,
                            background: "rgba(0, 91, 181, 0.08)",
                            padding: "3px 7px",
                            borderRadius: 4
                          }}>
                            {i.id}
                          </code>
                        </button>
                      </td>
                      <td>
                        <b
                          onClick={() => setViewingInventory(i)}
                          style={{ cursor: "pointer", color: "var(--text-main)" }}
                          title="Click to inspect stock details"
                        >
                          {pName}
                        </b>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "monospace", fontSize: 12 }}>
                          <Barcode size={13} style={{ color: "var(--text-muted)" }} /> {sCode}
                        </span>
                      </td>
                      <td style={{ color: "var(--success)", fontWeight: 700 }}>+{stockIn}</td>
                      <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>-{stockOut}</td>
                      <td>
                        <b style={{ color: isOut ? "var(--danger)" : isLow ? "var(--warning)" : "var(--text-main)" }}>
                          {balance}
                        </b>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Warehouse size={12} style={{ color: "var(--accent)" }} /> {loc}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isOut ? "danger" : isLow ? "warning" : "success"}`}>
                          <span
                            className={`badge-dot ${!isOut && !isLow ? "pulse" : ""}`}
                            style={{
                              background: isOut ? "#ef4444" : isLow ? "#f59e0b" : "#10b981",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              display: "inline-block",
                              marginRight: 6
                            }}
                          />
                          {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            title="Inspect Stock Telemetry & Warehouse Bay"
                            onClick={() => setViewingInventory(i)}
                            style={{ color: "var(--accent)" }}
                          >
                            <Eye size={14} />
                          </button>
                          <button title="Edit Stock Record" onClick={() => handleOpenEdit(i)}>
                            <Pencil size={14} />
                          </button>
                          <button title="Delete Record" onClick={() => setDeletingInventory(i)}>
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

      <InventoryModal
        key={editingInventory ? editingInventory.id : "new-inventory"}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingInventory(null); }}
        onSave={handleSaveInventory}
        inventoryToEdit={editingInventory}
        products={products}
        nextId={nextId}
        existingIds={inventory.map(i => i.id)}
      />

      <DeleteConfirmModal
        isOpen={!!deletingInventory}
        onClose={() => setDeletingInventory(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Inventory Deletion"
        message={deletingInventory ? `Are you sure you want to delete the stock movement ledger for ${deletingInventory.product} (${deletingInventory.sku})?` : ""}
        details={deletingInventory ? `Entry shows ${deletingInventory.in} received, ${deletingInventory.out} dispatched, and ${deletingInventory.stock} balance units.` : ""}
      />

      {/* SLIDE-OVER INSPECTION DRAWER & TELEMETRY */}
      <InventoryViewDrawer
        isOpen={!!viewingInventory}
        onClose={() => setViewingInventory(null)}
        inventoryItem={viewingInventory}
        inventoryList={filtered}
        onNavigateItem={(item) => setViewingInventory(item)}
        products={products}
        onEdit={(item) => {
          setViewingInventory(null);
          handleOpenEdit(item);
        }}
        onDelete={(item) => {
          setViewingInventory(null);
          setDeletingInventory(item);
        }}
        onQuickAdjust={handleQuickAdjust}
        showToast={showToast}
      />

    </div>
  );
}

// ==========================================================================
// REVENUE & FINANCIAL INTELLIGENCE DASHBOARD
// ==========================================================================
