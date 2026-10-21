import React, { useState, useEffect } from "react";
import {
  Receipt, X, Save, Download, Plus, Trash2,
  CheckCircle2, Building2, Calendar, CreditCard, Layers, AlertCircle
} from "lucide-react";
import { generateInvoicePDF } from "../services/pdfService";
import { FieldError, RequiredStar, ValidationSummary } from "./ValidationFeedback";
import {
  validateRequiredText,
  validateDate,
  validatePositiveNumber,
  validateInvoiceItems
} from "../utils/validators";

export default function InvoiceModal({
  isOpen,
  onClose,
  onSave,
  clients = [],
  nextId = "LE-INV-2026-001",
  company = {},
  defaultClient = null,
  showToast
}) {
  if (!isOpen) return null;

  const initialClient = defaultClient || (clients.length > 0 ? clients[0] : null);

  const [form, setForm] = useState({
    id: nextId,
    clientName: initialClient ? initialClient.name : "",
    clientId: initialClient ? initialClient.id : "",
    date: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    category: "Piping & Conduit",
    status: "Paid",
    paymentMethod: "UPI Commercial / NEFT"
  });

  const [isItemized, setIsItemized] = useState(true);

  const [items, setItems] = useState([
    {
      description: "Industrial GI Pipes Class B - 2 inch (Heavy Commercial)",
      hsn: "7306",
      qty: 50,
      unit: "Mtrs",
      rate: 950,
      taxable: 47500,
      gstRate: 18,
      total: 56050
    },
    {
      description: "Heavy Duty Conduit Fittings, Elbows & Couplings",
      hsn: "7307",
      qty: 120,
      unit: "Nos",
      rate: 250,
      taxable: 30000,
      gstRate: 18,
      total: 35400
    },
    {
      description: "High-Pressure Ball Valves & Cast Iron Flanges (ISI Certified)",
      hsn: "8481",
      qty: 25,
      unit: "Nos",
      rate: 820,
      taxable: 20500,
      gstRate: 18,
      total: 24190
    }
  ]);

  const [simpleAmount, setSimpleAmount] = useState(98000);
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState([]);

  useEffect(() => {
    if (defaultClient) {
      setForm(prev => ({
        ...prev,
        clientName: defaultClient.name,
        clientId: defaultClient.id
      }));
    }
  }, [defaultClient]);

  // Recalculate totals
  const taxableAmount = isItemized
    ? items.reduce((sum, it) => sum + (Number(it.taxable) || 0), 0)
    : Number(simpleAmount) || 0;

  const gstTax = Math.round(taxableAmount * 0.18);
  const grandTotal = taxableAmount + gstTax;
  const cgst = Math.round(gstTax / 2);
  const sgst = gstTax - cgst;

  const handleClientChange = (clientName) => {
    const found = clients.find(c => c.name === clientName);
    setForm(prev => ({
      ...prev,
      clientName,
      clientId: found ? found.id : prev.clientId
    }));
    if (errors.clientName) {
      setErrors(prev => ({ ...prev, clientName: null }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === "qty" || field === "rate" || field === "gstRate") {
      const q = Number(field === "qty" ? value : item.qty) || 0;
      const r = Number(field === "rate" ? value : item.rate) || 0;
      const gst = Number(field === "gstRate" ? value : item.gstRate) || 18;
      item.taxable = Math.round(q * r);
      const tax = Math.round(item.taxable * (gst / 100));
      item.total = item.taxable + tax;
    }

    updated[index] = item;
    setItems(updated);

    // Clear item-level errors on edit
    if (itemErrors[index] && itemErrors[index][field]) {
      const updatedItemErrs = [...itemErrors];
      updatedItemErrs[index] = { ...updatedItemErrs[index], [field]: null };
      setItemErrors(updatedItemErrs);
    }
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        description: "Industrial Supplies & Hardware Item",
        hsn: "7318",
        qty: 10,
        unit: "Nos",
        rate: 500,
        taxable: 5000,
        gstRate: 18,
        total: 5900
      }
    ]);
    setItemErrors(prev => [...prev, {}]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      setErrors(prev => ({ ...prev, items: "At least one line item is required in the invoice." }));
      return;
    }
    setItems(items.filter((_, i) => i !== index));
    setItemErrors(itemErrors.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, items: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Invoice ID
    const idVal = validateRequiredText(form.id, "Invoice Number", 3);
    if (!idVal.isValid) newErrors.id = idVal.error;

    // Client Name
    const clientVal = validateRequiredText(form.clientName, "Client Name", 2);
    if (!clientVal.isValid) newErrors.clientName = clientVal.error;

    // Invoice Date
    const dateVal = validateDate(form.date, "Invoice Date");
    if (!dateVal.isValid) newErrors.date = dateVal.error;

    // Due Date
    const dueDateVal = validateDate(form.dueDate, "Payment Due Date", { minDate: form.date });
    if (!dueDateVal.isValid) newErrors.dueDate = dueDateVal.error;

    // Itemized validation
    if (isItemized) {
      const lineItemVal = validateInvoiceItems(items);
      if (!lineItemVal.isValid) {
        newErrors.items = lineItemVal.generalError || "Please correct item quantities and rates.";
        setItemErrors(lineItemVal.itemErrors);
      } else {
        setItemErrors([]);
      }
    } else {
      const simpleVal = validatePositiveNumber(simpleAmount, "Taxable Amount");
      if (!simpleVal.isValid) newErrors.simpleAmount = simpleVal.error;
    }

    // Grand total
    if (grandTotal <= 0) {
      newErrors.total = "Invoice Grand Total must be greater than ₹0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getInvoicePayload = () => {
    const selectedClient = clients.find(c => c.id === form.clientId || c.name === form.clientName) || defaultClient || {};
    return {
      ...form,
      amount: taxableAmount,
      tax: gstTax,
      total: grandTotal,
      items: isItemized ? items : undefined,
      clientExtra: {
        gstin: selectedClient.gstin,
        city: selectedClient.city,
        contact: selectedClient.contact
      }
    };
  };

  const handleDownloadPDF = () => {
    if (!validateForm()) return;
    try {
      const inv = getInvoicePayload();
      const selectedClient = clients.find(c => c.id === form.clientId || c.name === form.clientName) || defaultClient || {};
      const { fileName } = generateInvoicePDF(inv, company, selectedClient);
      if (showToast) {
        showToast(`✓ Downloaded ${fileName} to your PC`);
      }
    } catch (err) {
      console.error("PDF download error:", err);
      setErrors(prev => ({ ...prev, pdf: "Failed to download PDF: " + err.message }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const inv = getInvoicePayload();
    if (onSave) onSave(inv);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 920,
          width: "95vw",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: "rgba(0, 91, 181, 0.12)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Receipt size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)" }}>
                Create Commercial Tax Invoice & Save to PC
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Generate GST-compliant commercial invoice with real-time field validation
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            
            {/* Validation summary banner */}
            <ValidationSummary errors={errors} title="Please fix the following invoice details:" />

            <div className="form-grid" style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label>Invoice Number <RequiredStar /></label>
                <input
                  className={`form-input ${errors.id ? "is-invalid" : ""}`}
                  value={form.id}
                  onChange={(e) => {
                    setForm({ ...form, id: e.target.value });
                    if (errors.id) setErrors(prev => ({ ...prev, id: null }));
                  }}
                  required
                />
                <FieldError error={errors.id} />
                <span className="form-help">GST Tax Invoice format</span>
              </div>

              <div className="form-group">
                <label>Billing Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Paid">Verified Paid</option>
                  <option value="Pending">Pending Clearance</option>
                  <option value="Overdue">Overdue Payment</option>
                </select>
                <span className="form-help">Realization status</span>
              </div>

              <div className="form-group full">
                <label>Client Commercial Account <RequiredStar /></label>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <select
                    className={`form-select ${errors.clientName ? "is-invalid" : ""}`}
                    value={form.clientName}
                    onChange={(e) => handleClientChange(e.target.value)}
                    required
                  >
                    <option value="">-- Select Client Account --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.clientType ? `[${c.clientType}] ` : ""}{c.name} ({c.district || c.city || "MS"} - {c.contact})
                      </option>
                    ))}
                  </select>
                  <FieldError error={errors.clientName} />
                </div>
              </div>

              <div className="form-group">
                <label>Invoice Issue Date <RequiredStar /></label>
                <input
                  type="date"
                  className={`form-input ${errors.date ? "is-invalid" : ""}`}
                  value={form.date}
                  onChange={(e) => {
                    setForm({ ...form, date: e.target.value });
                    if (errors.date) setErrors(prev => ({ ...prev, date: null }));
                  }}
                  required
                />
                <FieldError error={errors.date} />
              </div>

              <div className="form-group">
                <label>Payment Due Date <RequiredStar /></label>
                <input
                  type="date"
                  className={`form-input ${errors.dueDate ? "is-invalid" : ""}`}
                  value={form.dueDate}
                  min={form.date}
                  onChange={(e) => {
                    setForm({ ...form, dueDate: e.target.value });
                    if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: null }));
                  }}
                  required
                />
                <FieldError error={errors.dueDate} />
              </div>

              <div className="form-group">
                <label>Product Category</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Piping & Conduit">Piping & Conduit Supplies</option>
                  <option value="Hardware">Hardware & Fasteners</option>
                  <option value="Electrical">Electrical Equipment</option>
                  <option value="Mechanical">Mechanical & Valves</option>
                </select>
              </div>

              <div className="form-group">
                <label>Settlement Method</label>
                <select
                  className="form-select"
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                >
                  <option value="UPI Commercial / NEFT">UPI Commercial / NEFT</option>
                  <option value="NEFT / Bank Transfer">NEFT / Bank Transfer</option>
                  <option value="RTGS Commercial">RTGS Commercial</option>
                  <option value="Cheque (In Clearance)">Cheque (In Clearance)</option>
                  <option value="Direct Deposit">Direct Deposit</option>
                </select>
              </div>
            </div>

            {/* Mode Toggle */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: "1px solid var(--border)"
            }}>
              <div>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                  {isItemized ? "Itemized Particulars (Products & Services)" : "Lump-Sum Commercial Order"}
                </strong>
                <span style={{ display: "block", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                  {isItemized ? "List multiple line items with HSN codes, quantity and rates" : "Single total taxable lot"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={isItemized ? "primary" : "outline"}
                  onClick={() => setIsItemized(true)}
                  style={{ fontSize: "0.8rem", padding: "5px 12px" }}
                >
                  Itemized List
                </button>
                <button
                  type="button"
                  className={!isItemized ? "primary" : "outline"}
                  onClick={() => setIsItemized(false)}
                  style={{ fontSize: "0.8rem", padding: "5px 12px" }}
                >
                  Single Total
                </button>
              </div>
            </div>

            {/* Itemized Table */}
            {isItemized ? (
              <div style={{ marginBottom: 20 }}>
                {errors.items && (
                  <div style={{ marginBottom: 8 }}>
                    <FieldError error={errors.items} />
                  </div>
                )}
                <div className="table-wrap" style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                  <table style={{ width: "100%", fontSize: "0.82rem", borderCollapse: "collapse", minWidth: 540 }}>
                    <thead>
                      <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                        <th style={{ padding: "8px 10px", textAlign: "left", width: "35%" }}>Description <RequiredStar /></th>
                        <th style={{ padding: "8px 10px", textAlign: "center", width: "12%" }}>HSN/SAC</th>
                        <th style={{ padding: "8px 10px", textAlign: "center", width: "10%" }}>Qty <RequiredStar /></th>
                        <th style={{ padding: "8px 10px", textAlign: "right", width: "14%" }}>Rate (₹) <RequiredStar /></th>
                        <th style={{ padding: "8px 10px", textAlign: "right", width: "15%" }}>Taxable (₹)</th>
                        <th style={{ padding: "8px 10px", textAlign: "center", width: "8%" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => {
                        const rowErrs = itemErrors[idx] || {};
                        return (
                          <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "6px 8px" }}>
                              <input
                                className={`form-input ${rowErrs.description ? "is-invalid" : ""}`}
                                style={{ height: 32, fontSize: "0.82rem", padding: "4px 8px" }}
                                value={it.description}
                                onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                                placeholder="Item description"
                                required
                              />
                              {rowErrs.description && (
                                <span style={{ fontSize: 10.5, color: "#ef4444", display: "block", marginTop: 2 }}>
                                  {rowErrs.description}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "6px 8px" }}>
                              <input
                                className="form-input"
                                style={{ height: 32, fontSize: "0.82rem", padding: "4px 8px", textAlign: "center" }}
                                value={it.hsn}
                                onChange={(e) => handleItemChange(idx, "hsn", e.target.value)}
                                placeholder="HSN"
                              />
                            </td>
                            <td style={{ padding: "6px 8px" }}>
                              <input
                                type="number"
                                min="1"
                                className={`form-input ${rowErrs.qty ? "is-invalid" : ""}`}
                                style={{ height: 32, fontSize: "0.82rem", padding: "4px 8px", textAlign: "center" }}
                                value={it.qty}
                                onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                                required
                              />
                              {rowErrs.qty && (
                                <span style={{ fontSize: 10.5, color: "#ef4444", display: "block", marginTop: 2 }}>
                                  {rowErrs.qty}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "6px 8px" }}>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                className={`form-input ${rowErrs.rate ? "is-invalid" : ""}`}
                                style={{ height: 32, fontSize: "0.82rem", padding: "4px 8px", textAlign: "right" }}
                                value={it.rate}
                                onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                                required
                              />
                              {rowErrs.rate && (
                                <span style={{ fontSize: 10.5, color: "#ef4444", display: "block", marginTop: 2 }}>
                                  {rowErrs.rate}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>
                              ₹{(Number(it.taxable) || 0).toLocaleString("en-IN")}
                            </td>
                            <td style={{ padding: "6px 8px", textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="icon-btn"
                                style={{ color: "var(--danger)", padding: 4 }}
                                title="Delete row"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="outline"
                  onClick={handleAddItem}
                  style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", padding: "6px 12px" }}
                >
                  <Plus size={14} /> Add Another Item
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label>Taxable Amount (₹ INR) <RequiredStar /></label>
                  <input
                    type="number"
                    min="1"
                    className={`form-input ${errors.simpleAmount ? "is-invalid" : ""}`}
                    placeholder="Base taxable value"
                    value={simpleAmount}
                    onChange={(e) => {
                      setSimpleAmount(Number(e.target.value) || 0);
                      if (errors.simpleAmount) setErrors(prev => ({ ...prev, simpleAmount: null }));
                    }}
                    required
                  />
                  <FieldError error={errors.simpleAmount} />
                </div>
              </div>
            )}

            {/* Financial Summary Card */}
            <div style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "16px 20px"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Taxable Subtotal:</span>
                  <strong style={{ fontSize: "1.05rem", color: "var(--text-main)" }}>
                    ₹{taxableAmount.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>CGST (9%) + SGST (9%):</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)" }}>
                    ₹{cgst.toLocaleString("en-IN")} + ₹{sgst.toLocaleString("en-IN")}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Total GST (18%):</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-main)" }}>
                    ₹{gstTax.toLocaleString("en-IN")}
                  </span>
                </div>

                <div style={{ borderLeft: "2px solid var(--primary)", paddingLeft: 12 }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, display: "block", textTransform: "uppercase" }}>
                    Grand Net Invoice:
                  </span>
                  <strong style={{ fontSize: "1.25rem", color: "var(--primary)", fontWeight: 800 }}>
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
              {errors.total && <FieldError error={errors.total} />}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer" style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                className="primary"
                onClick={handleDownloadPDF}
                title="Generate branded GST Tax Invoice PDF and save directly to your PC"
                style={{
                  background: "#005bb5",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  fontWeight: 600
                }}
              >
                <Download size={15} /> Download PDF to PC
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button type="button" className="outline" onClick={onClose} style={{ fontSize: "0.85rem" }}>
                Cancel
              </button>
              <button type="submit" className="primary" style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Save size={15} /> Save & Issue Invoice
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
