import React, { useState, useEffect } from "react";
import {
  X, Save, AlertTriangle, Boxes, Warehouse, TrendingUp, TrendingDown,
  Package, Info, Loader2
} from "lucide-react";
import { FieldError, RequiredStar, ValidationSummary } from "./ValidationFeedback";
import { calculateCurrentStock } from "../constants/erpConstants";

/**
 * InventoryModal — Stock Movement Entry
 *
 * A "stock movement" records an inward or outward adjustment against an
 * existing product from the catalogue. The product is selected from a
 * strict dropdown — no free-text entry allowed.
 *
 * On save, the modal calls onSave({ productId, productName, adjustment,
 * warehouseLocation, reason, movementType }).
 * The parent (InventoryPage) then calls the backend /inventory/:id/adjust
 * and updates both inventory & products state.
 */
export default function InventoryModal({
  isOpen,
  onClose,
  onSave,
  products = [],
  initialProductId = null,
  showToast,
  onOpenAddProduct,
}) {
  if (!isOpen) return null;

  const defaultProductId = initialProductId && products.some(p => String(p.id) === String(initialProductId))
    ? initialProductId
    : (products.length > 0 ? products[0].id : "");

  const [form, setForm] = useState({
    productId: defaultProductId,
    movementType: "inward",   // "inward" | "outward"
    quantity: "",
    warehouseLocation: "Warehouse A - Bay 01",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive selected product details (Inventory currentStock is the SINGLE source of truth)
  const selectedProduct = products.find(p => String(p.id) === String(form.productId)) || null;
  const currentStock = selectedProduct
    ? Math.max(0, Number(selectedProduct.currentStock ?? selectedProduct.stock ?? 0))
    : 0;
  const afterAdjustment = form.movementType === "inward"
    ? currentStock + (Number(form.quantity) || 0)
    : Math.max(0, currentStock - (Number(form.quantity) || 0));

  const handleProductChange = (prodId) => {
    const p = products.find(pr => String(pr.id) === String(prodId));
    setForm(prev => ({
      ...prev,
      productId: prodId,
      // Auto-suggest location if product has a warehouseLocation
      warehouseLocation: p?.warehouseLocation || prev.warehouseLocation,
    }));
    if (errors.productId) setErrors(prev => ({ ...prev, productId: null }));
  };

  const handleFieldChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.productId) errs.productId = "Please select a product from the catalogue.";
    const qty = Number(form.quantity);
    if (!form.quantity || isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      errs.quantity = "Quantity must be a positive integer.";
    } else if (form.movementType === "outward" && qty > currentStock) {
      errs.quantity = `Cannot dispatch more than available stock (${currentStock} units).`;
    }
    if (!form.warehouseLocation || form.warehouseLocation.trim().length < 3) {
      errs.warehouseLocation = "Please enter the warehouse bay / location.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;
    const qty = Number(form.quantity);
    const adjustment = form.movementType === "inward"
      ? qty
      : -qty;

    try {
      setIsSubmitting(true);
      await onSave({
        productId: form.productId,
        productName: selectedProduct?.name || "",
        adjustment,
        movementType: form.movementType,
        quantity: qty,
        warehouseLocation: form.warehouseLocation,
        reason: form.reason || (form.movementType === "inward" ? "Purchase / Inward" : "Sale / Outward"),
        sku: selectedProduct?.sku || selectedProduct?.id || "",
        category: selectedProduct?.category || "",
        unit: selectedProduct?.unit || "Units",
      });
    } catch (err) {
      // Handled in parent or toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOutward = form.movementType === "outward";
  const adjustmentNumber = Number(form.quantity) || 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 580,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ flexShrink: 0, padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(0, 91, 181, 0.1)", color: "var(--primary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Boxes size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Record Stock Movement
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Inward procurement receipts & outward SKU dispatches
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
          <div className="modal-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: "14px 14px" }}>
            <ValidationSummary errors={errors} title="Please fix the following:" />

            {/* Movement Type Toggle */}
            <div className="mobile-form-section-card" style={{ marginBottom: 12 }}>
              <label style={{ marginBottom: 8, display: "block", fontWeight: 700, fontSize: "0.82rem" }}>
                Movement Type <RequiredStar />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { id: "inward", label: "Inward (+ Stock In)", icon: TrendingUp, color: "#059669" },
                  { id: "outward", label: "Outward (- Stock Out)", icon: TrendingDown, color: "#ef4444" },
                ].map(opt => {
                  const Icon = opt.icon;
                  const active = form.movementType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleFieldChange("movementType", opt.id)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: active ? `2px solid ${opt.color}` : "1px solid var(--border)",
                        background: active ? `rgba(${opt.id === "inward" ? "16,185,129" : "239,68,68"},0.08)` : "var(--bg)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.15s",
                        userSelect: "none",
                        minHeight: 44
                      }}
                    >
                      <Icon size={17} style={{ color: active ? opt.color : "var(--text-muted)", flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: active ? opt.color : "var(--text-main)", whiteSpace: "nowrap" }}>
                        {opt.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Selection Section Card */}
            <div className="mobile-form-section-card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ margin: 0, fontWeight: 700, fontSize: "0.82rem" }}>
                  Product from Catalogue <RequiredStar />
                </label>
                {onOpenAddProduct && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenAddProduct(); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    + Add New Product
                  </button>
                )}
              </div>
              {products.length === 0 ? (
                <div style={{
                  padding: "10px 14px",
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: 8,
                  color: "#b45309",
                  fontSize: "0.82rem",
                  display: "flex",
                  gap: 8,
                  alignItems: "center"
                }}>
                  <AlertTriangle size={16} />
                  <span>No products in catalogue.</span>
                  {onOpenAddProduct && (
                    <button
                      type="button"
                      className="primary btn-sm"
                      onClick={() => { onClose(); onOpenAddProduct(); }}
                      style={{ marginLeft: "auto", padding: "4px 10px", fontSize: "0.78rem" }}
                    >
                      + Add Product Now
                    </button>
                  )}
                </div>
              ) : (
                <select
                  className={`form-select ${errors.productId ? "is-invalid" : ""}`}
                  value={form.productId}
                  onChange={e => handleProductChange(e.target.value)}
                  style={{ width: "100%", maxWidth: "100%", textOverflow: "ellipsis" }}
                  required
                >
                  <option value="">-- Select Product from Catalogue --</option>
                  {products.map(p => {
                    const stock = Number(p.stock ?? p.currentStock ?? 0);
                    const isLow = stock <= Number(p.minStock || 10);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.id}] — Stock: {stock} {p.unit || "units"}{isLow ? " ⚠️ LOW" : ""}
                      </option>
                    );
                  })}
                </select>
              )}
              <FieldError error={errors.productId} />

              {/* Current Stock Info Banner */}
              {selectedProduct && (
                <div style={{
                  padding: "10px 12px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  marginTop: 10,
                  fontSize: "0.82rem",
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: "1 1 auto" }}>
                    <Package size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <b style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedProduct.name}</b>
                  </div>
                  <span style={{
                    padding: "3px 8px",
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: "0.76rem",
                    whiteSpace: "nowrap",
                    background: currentStock <= 0 ? "rgba(239,68,68,0.12)" : currentStock <= 10 ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                    color: currentStock <= 0 ? "#ef4444" : currentStock <= 10 ? "#d97706" : "#059669",
                  }}>
                    Current Stock: {currentStock} {selectedProduct.unit || "units"}
                  </span>
                </div>
              )}
            </div>

            {/* Movement Details Card */}
            <div className="mobile-form-section-card" style={{ marginBottom: 12 }}>
              <div className="form-grid">
                {/* Quantity */}
                <div className="form-group">
                  <label>
                    {isOutward ? "Dispatch Quantity (−)" : "Inward Quantity (+)"} <RequiredStar />
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={`form-input ${errors.quantity ? "is-invalid" : ""}`}
                    value={form.quantity}
                    onChange={e => handleFieldChange("quantity", e.target.value)}
                    placeholder="Enter quantity"
                    required
                  />
                  <FieldError error={errors.quantity} />
                  {selectedProduct && adjustmentNumber > 0 && (
                    <span className="form-help" style={{
                      color: isOutward ? "#ef4444" : "#059669",
                      fontWeight: 700
                    }}>
                      After movement: {afterAdjustment} {selectedProduct.unit || "units"}
                    </span>
                  )}
                </div>

                {/* Warehouse Location */}
                <div className="form-group">
                  <label>Warehouse Bay / Location <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.warehouseLocation ? "is-invalid" : ""}`}
                    value={form.warehouseLocation}
                    onChange={e => handleFieldChange("warehouseLocation", e.target.value)}
                    placeholder="e.g. Warehouse A - Bay 01"
                  />
                  <FieldError error={errors.warehouseLocation} />
                </div>

                {/* Reason / Notes */}
                <div className="form-group full">
                  <label>Reason / Remarks (optional)</label>
                  <input
                    className="form-input"
                    value={form.reason}
                    onChange={e => handleFieldChange("reason", e.target.value)}
                    placeholder={isOutward ? "e.g. Dispatched to client / Damaged goods" : "e.g. Purchase from supplier / Goods receipt"}
                  />
                </div>
              </div>

              {/* After-movement preview */}
              {selectedProduct && adjustmentNumber > 0 && (
                <div style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.82rem",
                  background: isOutward ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)",
                  border: `1px solid ${isOutward ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                }}>
                  <Info size={15} style={{ color: isOutward ? "#ef4444" : "#059669", flexShrink: 0 }} />
                  <span>
                    Stock Result: {currentStock} → <b style={{ color: isOutward ? "#ef4444" : "#059669" }}>{afterAdjustment}</b> {selectedProduct.unit || "units"}
                    {isOutward && afterAdjustment <= 0 && <span style={{ color: "#ef4444", marginLeft: 8 }}>⚠️ Will reach zero</span>}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Modal Action Footer with Clear Hierarchy */}
          <div className="modal-footer mobile-modal-footer-hierarchical">
            <button
              type="submit"
              className="primary footer-primary-btn"
              disabled={products.length === 0 || isSubmitting}
              style={{
                background: isOutward ? "#ef4444" : undefined,
                opacity: isSubmitting ? 0.75 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isOutward ? "Record Outward Dispatch" : "Record Inward Receipt"}</span>
                </>
              )}
            </button>
            <div className="footer-secondary-row">
              <button type="button" className="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
