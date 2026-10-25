import React, { useState, useMemo } from "react";
import {
  Receipt, Download, Plus, Search, X, Trash2,
  CheckCircle2, AlertTriangle, TrendingUp, IndianRupee, Clock,
  Eye, RefreshCw, Printer, ShieldCheck, Filter, ArrowUpRight
} from "lucide-react";
import { generateInvoicePDF } from "../services/pdfService";
import { erpApi } from "../services/api";
import InvoiceViewModal from "./InvoiceViewModal";
import InvoiceModal from "./InvoiceModal";

export default function InvoicesPage({
  invoices = [],
  onSaveInvoices,
  onCreateInvoice,
  clients = [],
  products = [],
  company = {},
  showToast,
  onOpenCreateInvoice
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [localToast, setLocalToast] = useState(null);

  const nextInvoiceId = useMemo(() => {
    const ids = (invoices || [])
      .map(inv => {
        const match = inv.id.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = ids.length ? Math.max(...ids) : 0;
    return `LE-INV-2026-${String(maxNum + 1).padStart(3, "0")}`;
  }, [invoices]);

  const handleAddInvoice = (newInv) => {
    if (onCreateInvoice) {
      onCreateInvoice(newInv);
    } else if (onSaveInvoices) {
      onSaveInvoices([newInv, ...invoices]);
    }
    setIsCreateModalOpen(false);
    notify(`✓ Created invoice ${newInv.id} for ${newInv.clientName}`);
  };

  const notify = (msg) => {
    if (showToast) {
      showToast(msg);
    } else {
      setLocalToast(msg);
      setTimeout(() => setLocalToast(null), 3000);
    }
  };

  // High-Level Commercial KPIs
  const grossInvoiced = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (Number(inv.total ?? inv.grandTotal ?? 0) || 0), 0);
  }, [invoices]);

  const realizedCollections = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      const invTotal = Number(inv.total ?? inv.grandTotal ?? 0);
      if (inv.paidAmount !== undefined && inv.paidAmount !== null && inv.paidAmount !== "") {
        return sum + (Number(inv.paidAmount) || 0);
      }
      return sum + (inv.status === "Paid" ? invTotal : 0);
    }, 0);
  }, [invoices]);

  const pendingReceivables = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      const invTotal = Number(inv.total ?? inv.grandTotal ?? 0);
      if (inv.balanceDue !== undefined && inv.balanceDue !== null && inv.balanceDue !== "") {
        return sum + (Number(inv.balanceDue) || 0);
      }
      return sum + (inv.status !== "Paid" ? invTotal : 0);
    }, 0);
  }, [invoices]);

  const overdueCount = useMemo(() => {
    return invoices.filter(inv => inv.status === "Overdue").length;
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        inv.id.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q) ||
        (inv.clientId && inv.clientId.toLowerCase().includes(q)) ||
        (inv.category && inv.category.toLowerCase().includes(q)) ||
        (inv.paymentMethod && inv.paymentMethod.toLowerCase().includes(q))
      );
      return matchesStatus && matchesSearch;
    });
  }, [invoices, search, statusFilter]);

  // Handle single invoice PDF download directly to PC
  const handleDownloadPDF = (invoice) => {
    try {
      const client = clients.find(c => c.id === invoice.clientId || c.name === invoice.clientName);
      const { fileName } = generateInvoicePDF(invoice, company, client || {});
      notify(`✓ Downloaded ${fileName} to your PC`);
    } catch (err) {
      console.error("PDF download failed:", err);
      notify("⚠️ Failed to download PDF: " + err.message);
    }
  };


  // Toggle invoice status (Paid -> Pending -> Overdue -> Paid)
  const handleToggleStatus = (invoice) => {
    const order = ["Paid", "Pending", "Overdue"];
    const currentIdx = order.indexOf(invoice.status);
    const nextStatus = order[(currentIdx + 1) % order.length];
    const updated = invoices.map(inv => inv.id === invoice.id ? { ...inv, status: nextStatus } : inv);
    if (onSaveInvoices) onSaveInvoices(updated);
    notify(`✓ Updated ${invoice.id} status to ${nextStatus}`);
  };

  // Delete an invoice
  const handleDeleteInvoice = (id) => {
    if (window.confirm(`Are you sure you want to delete invoice ${id}?`)) {
      const updated = invoices.filter(inv => inv.id !== id && inv.invoiceNumber !== id && inv.invoiceNo !== id);
      if (onSaveInvoices) onSaveInvoices(updated);
      erpApi.deleteInvoice(id).catch(() => {});
      notify(`✓ Invoice ${id} deleted.`);
    }
  };

  return (
    <div className="page invoices-page">
      {localToast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{localToast}</span>
        </div>
      )}

      {/* TOP HEADER & ACTION BUTTONS */}
      <div className="page-actions" style={{ alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
            Commercial Tax Invoices & Billing Ledger
          </h2>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
            Download GST tax invoice PDFs and manage digital billing directly
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>

          {/* Create New Invoice */}
          <button
            type="button"
            className="primary"
            onClick={() => onOpenCreateInvoice ? onOpenCreateInvoice() : setIsCreateModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={16} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-top">
            <span>Gross Invoiced YTD</span>
            <div className="stat-icon" style={{ background: "rgba(0, 91, 181, 0.12)", color: "var(--primary)" }}>
              <IndianRupee size={19} />
            </div>
          </div>
          <div className="stat-value">₹{grossInvoiced.toLocaleString("en-IN")}</div>
          <div className="trend positive">
            <TrendingUp size={14} />
            <span>{invoices.length} Total Invoices</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Realized Collections</span>
            <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
              <CheckCircle2 size={19} />
            </div>
          </div>
          <div className="stat-value">₹{realizedCollections.toLocaleString("en-IN")}</div>
          <div className="trend positive">
            <CheckCircle2 size={14} />
            <span>{invoices.filter(i => i.status === "Paid").length} Paid & Verified</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Pending Receivables</span>
            <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" }}>
              <Clock size={19} />
            </div>
          </div>
          <div className="stat-value">₹{pendingReceivables.toLocaleString("en-IN")}</div>
          <div className="trend negative">
            <Clock size={14} />
            <span>{invoices.filter(i => i.status === "Pending").length} In Clearance</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Overdue Invoices</span>
            <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
              <AlertTriangle size={19} />
            </div>
          </div>
          <div className="stat-value">{overdueCount}</div>
          <div className="trend negative">
            <AlertTriangle size={14} />
            <span>Follow-up Required</span>
          </div>
        </div>
      </div>

      {/* INVOICE TABLE CARD */}
      <div className="card table-card">
        {/* Card Header & Status Filter Pills */}
        <div className="card-head" style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3>Tax Invoices Registry</h3>
            <p>1-Click instant PDF generation and printable invoices</p>
          </div>

          <div className="filter-pills-bar">
            {["All", "Paid", "Pending", "Overdue"].map(st => (
              <button
                key={st}
                className={`filter-pill ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st} ({st === "All" ? invoices.length : invoices.filter(i => i.status === st).length})
              </button>
            ))}
          </div>
        </div>

        {/* Search & Counter Toolbar */}
        <div className="table-toolbar">
          <div className="local-search">
            <Search size={16} />
            <input
              placeholder="Search by invoice #, client name, account ID, category, payment mode..."
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
              Showing {filteredInvoices.length} of {invoices.length} commercial tax invoices
            </span>
          </div>
        </div>

        {/* Invoices Table Body */}
        <div className="table-wrap">
          {filteredInvoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Receipt size={28} /></div>
              <h4 style={{ fontSize: 16, color: "var(--text-main)", marginBottom: 6 }}>No Invoices Found</h4>
              <p style={{ fontSize: 13, marginBottom: 16, maxWidth: 450 }}>
                {invoices.length === 0
                  ? "Your commercial ledger is empty. Click below to create your first invoice."
                  : "No invoice records match your current search query or status filter."}
              </p>
              <button className="primary" onClick={() => onOpenCreateInvoice ? onOpenCreateInvoice() : setIsCreateModalOpen(true)}>
                <Plus size={15} /> Create Tax Invoice
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Client Account</th>
                  <th>Category & Settlement</th>
                  <th>Date Issued</th>
                  <th>Payment Due</th>
                  <th>Taxable (₹)</th>
                  <th>GST (18%)</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Download / Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const client = clients.find(c => c.id === inv.clientId || c.name === inv.clientName);
                  const isOverdue = inv.status === "Overdue";

                  return (
                    <tr key={inv.id}>
                      {/* Invoice ID */}
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          title="Click to preview & print invoice"
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
                            padding: "3px 8px",
                            borderRadius: 4
                          }}>
                            {inv.id}
                          </code>
                        </button>
                      </td>

                      {/* Client Account */}
                      <td>
                        <div className="person">
                          <div className="mini-avatar" style={{ background: "rgba(0, 91, 181, 0.12)", color: "var(--primary)" }}>
                            {inv.clientName ? inv.clientName[0] : "C"}
                          </div>
                          <div>
                            <b style={{ color: "var(--text-main)" }}>{inv.clientName}</b>
                            {inv.clientId && (
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                Acc: {inv.clientId} {client?.clientType ? `• ${client.clientType}` : ""} {client?.taluka ? `• ${client.taluka}` : (client?.city ? `• ${client.city}` : "")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Payment Mode */}
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "12.5px" }}>{inv.category || "Hardware"}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{inv.paymentMethod || "NEFT / RTGS"}</div>
                        </div>
                      </td>

                      {/* Invoice Date */}
                      <td style={{ fontSize: "12.5px" }}>{inv.date}</td>

                      {/* Due Date */}
                      <td style={{ fontSize: "12.5px" }}>
                        <span style={{
                          color: isOverdue ? "var(--danger)" : "inherit",
                          fontWeight: isOverdue ? 700 : "normal"
                        }}>
                          {inv.dueDate}
                        </span>
                      </td>

                      {/* Taxable Amount */}
                      <td className="money" style={{ color: "var(--text-muted)" }}>
                        ₹{Number(inv.amount || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Tax */}
                      <td className="money" style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                        ₹{Number(inv.tax || Math.round(Number(inv.amount || 0) * 0.18)).toLocaleString("en-IN")}
                      </td>

                      {/* Grand Total */}
                      <td className="money">
                        <b style={{ color: "var(--primary)", fontSize: "13.5px" }}>
                          ₹{Number(inv.total || 0).toLocaleString("en-IN")}
                        </b>
                      </td>

                      {/* Status Badge */}
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(inv)}
                          title="Click to cycle status: Paid -> Pending -> Overdue"
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
                        >
                          <span className={`badge ${
                            inv.status === "Paid"
                              ? "paid"
                              : inv.status === "Pending"
                                ? "pending-payment"
                                : "overdue"
                          }`}>
                            <span
                              className={`badge-dot ${inv.status === "Paid" ? "pulse" : ""}`}
                              style={{
                                background: inv.status === "Paid" ? "#10b981" : inv.status === "Pending" ? "#f59e0b" : "#ef4444",
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                display: "inline-block",
                                marginRight: 6
                              }}
                            />
                            {inv.status}
                          </span>
                        </button>
                      </td>

                      {/* ACTION BUTTONS: Direct Download PDF, View */}
                      <td>
                        <div className="row-actions" style={{ justifyContent: "center", gap: 6 }}>
                          {/* 1. Direct PDF Download Button */}
                          <button
                            type="button"
                            onClick={() => handleDownloadPDF(inv)}
                            title="Download PDF directly to PC"
                            style={{
                              background: "rgba(0, 91, 181, 0.08)",
                              color: "var(--primary)",
                              border: "1px solid rgba(0, 91, 181, 0.25)",
                              borderRadius: 6,
                              padding: "4px 8px",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: "11.5px",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            <Download size={13} />
                            <span>PDF</span>
                          </button>


                          {/* 3. View / Print Modal Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            title="Preview & Print Invoice"
                            style={{
                              background: "none",
                              border: "1px solid var(--border)",
                              borderRadius: 6,
                              padding: 5,
                              color: "var(--text-main)",
                              cursor: "pointer"
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          {/* 4. Delete Invoice */}
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv.id)}
                            title="Delete Invoice Record"
                            style={{
                              background: "none",
                              border: "none",
                              padding: 5,
                              color: "var(--danger)",
                              cursor: "pointer"
                            }}
                          >
                            <Trash2 size={14} />
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

      {/* INVOICE PREVIEW & PRINT MODAL */}
      <InvoiceViewModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        company={company}
        client={clients.find(c => c.id === selectedInvoice?.clientId || c.name === selectedInvoice?.clientName)}
        onDelete={(inv) => {
          setSelectedInvoice(null);
          handleDeleteInvoice(inv.id);
        }}
        showToast={notify}
      />

      {/* CREATE INVOICE MODAL */}
      <InvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleAddInvoice}
        clients={clients}
        products={products}
        nextId={nextInvoiceId}
        company={company}
        showToast={notify}
      />
    </div>
  );
}
