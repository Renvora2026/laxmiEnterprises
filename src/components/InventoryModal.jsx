import React, { useState, useEffect } from "react";
import {
  X, Save, AlertTriangle, Boxes, Tag, Warehouse, Calendar, Barcode
} from "lucide-react";
import {
  validateRequiredText,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateDate,
  validateUniqueId
} from "../utils/validators";
import { FieldError, RequiredStar, ValidationSummary } from "./ValidationFeedback";

export default function InventoryModal({ isOpen, onClose, onSave, inventoryToEdit, products, nextId, existingIds = [] }) {
  if (!isOpen) return null;
  const isEditing = !!inventoryToEdit;

  const [form, setForm] = useState(() => {
    if (inventoryToEdit) {
      return { ...inventoryToEdit };
    }
    const defaultProduct = products[0]?.name || "Industrial Pipe Set";
    return {
      id: nextId,
      product: defaultProduct,
      sku: "LE-" + (products[0]?.category?.toUpperCase().slice(0, 4) || "SKU") + "-" + Math.floor(10 + Math.random() * 90),
      in: 100,
      out: 20,
      stock: 80,
      status: "In Stock",
      location: "Warehouse A - Bay 01"
    };
  });

  const [errors, setErrors] = useState({});

  const handleFieldChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleInChange = (newIn) => {
    const stockVal = Math.max(0, newIn - form.out);
    setForm(prev => ({
      ...prev,
      in: newIn,
      stock: stockVal,
      status: stockVal <= 0 ? "Out of Stock" : stockVal <= 25 ? "Low Stock" : "In Stock"
    }));
    if (errors.in || errors.stock) {
      setErrors(prev => ({ ...prev, in: null, stock: null }));
    }
  };

  const handleOutChange = (newOut) => {
    const stockVal = Math.max(0, form.in - newOut);
    setForm(prev => ({
      ...prev,
      out: newOut,
      stock: stockVal,
      status: stockVal <= 0 ? "Out of Stock" : stockVal <= 25 ? "Low Stock" : "In Stock"
    }));
    if (errors.out || errors.stock) {
      setErrors(prev => ({ ...prev, out: null, stock: null }));
    }
  };

  const validateForm = () => {
    const errs = {};

    const idVal = validateUniqueId(form.id, existingIds, isEditing ? inventoryToEdit.id : null, "Inventory Reference ID");
    if (!idVal.isValid) errs.id = idVal.error;

    const skuVal = validateRequiredText(form.sku, "SKU / Barcode Identifier", 2);
    if (!skuVal.isValid) errs.sku = skuVal.error;

    const prodVal = validateRequiredText(form.product, "Target Product Name", 2);
    if (!prodVal.isValid) errs.product = prodVal.error;

    const inVal = validateNonNegativeNumber(form.in, "Inward Received");
    if (!inVal.isValid) errs.in = inVal.error;

    const outVal = validateNonNegativeNumber(form.out, "Outward Dispatched");
    if (!outVal.isValid) {
      errs.out = outVal.error;
    } else if (Number(form.out) > Number(form.in)) {
      errs.out = "Outward dispatched cannot exceed inward received quantity.";
    }

    const stockVal = validateNonNegativeNumber(form.stock, "Current Stock Balance");
    if (!stockVal.isValid) errs.stock = stockVal.error;

    const locVal = validateRequiredText(form.location, "Warehouse Storage Bay / Location", 2);
    if (!locVal.isValid) errs.location = locVal.error;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Boxes size={19} style={{ color: "var(--primary)" }} />
            {isEditing ? `Edit Inventory Entry: ${inventoryToEdit.sku}` : "Record Stock Entry & Warehouse Movement"}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <ValidationSummary errors={errors} title="Please resolve the following inventory errors:" />

            <div className="form-grid">
              <div className="form-group">
                <label>Inventory Reference ID <RequiredStar /></label>
                <input
                  className={`form-input ${errors.id ? "is-invalid" : ""}`}
                  value={form.id}
                  onChange={(e) => handleFieldChange("id", e.target.value)}
                />
                <FieldError error={errors.id} />
              </div>

              <div className="form-group">
                <label>SKU / Barcode Identifier <RequiredStar /></label>
                <input
                  className={`form-input ${errors.sku ? "is-invalid" : ""}`}
                  placeholder="e.g. LE-PIPE-01"
                  value={form.sku}
                  onChange={(e) => handleFieldChange("sku", e.target.value)}
                />
                <FieldError error={errors.sku} />
              </div>

              <div className="form-group full">
                <label>Target Product Name <RequiredStar /></label>
                <input
                  className={`form-input ${errors.product ? "is-invalid" : ""}`}
                  list="inventoryProdList"
                  placeholder="Select or enter product name"
                  value={form.product}
                  onChange={(e) => handleFieldChange("product", e.target.value)}
                />
                <datalist id="inventoryProdList">
                  {products.map(p => <option key={p.id} value={p.name} />)}
                </datalist>
                <FieldError error={errors.product} />
                <span className="form-help">Syncs directly with catalogue items</span>
              </div>

              <div className="form-group">
                <label>Inward Received (+Stock In) <RequiredStar /></label>
                <input
                  type="number"
                  min="0"
                  className={`form-input ${errors.in ? "is-invalid" : ""}`}
                  value={form.in}
                  onChange={(e) => handleInChange(Number(e.target.value) || 0)}
                />
                <FieldError error={errors.in} />
              </div>

              <div className="form-group">
                <label>Outward Dispatched (-Stock Out) <RequiredStar /></label>
                <input
                  type="number"
                  min="0"
                  className={`form-input ${errors.out ? "is-invalid" : ""}`}
                  value={form.out}
                  onChange={(e) => handleOutChange(Number(e.target.value) || 0)}
                />
                <FieldError error={errors.out} />
              </div>

              <div className="form-group">
                <label>Current Stock Balance <RequiredStar /></label>
                <input
                  type="number"
                  min="0"
                  className={`form-input ${errors.stock ? "is-invalid" : ""}`}
                  value={form.stock}
                  onChange={(e) => handleFieldChange("stock", Number(e.target.value) || 0)}
                />
                <FieldError error={errors.stock} />
              </div>

              <div className="form-group">
                <label>Stock Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                >
                  <option value="In Stock">In Stock (Normal)</option>
                  <option value="Low Stock">Low Stock (Needs Reorder)</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="form-group full">
                <label>Warehouse Storage Bay / Location <RequiredStar /></label>
                <input
                  className={`form-input ${errors.location ? "is-invalid" : ""}`}
                  placeholder="e.g. Warehouse A - Bay 12, Shelf 04"
                  value={form.location || ""}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                />
                <FieldError error={errors.location} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              <Save size={15} /> {isEditing ? "Save Stock Entry" : "Record Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// DEDICATED EDITABLE INVENTORY LOGISTICS PAGE
// ==========================================================================
