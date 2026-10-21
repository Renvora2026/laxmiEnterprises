import React, { useState } from "react";
import {
  X, Save, ShoppingCart, Milk, Tractor, Store, Wheat, MapPin, Phone,
  Mail, Calendar, TrendingUp, DollarSign, Building2, User, CheckCircle2,
  AlertTriangle, FileText, Tag, ChevronDown, Check, Plus, Trash2, IndianRupee, Clock
} from "lucide-react";
import { FieldError, RequiredStar, ValidationSummary } from "./ValidationFeedback";
import {
  validateRequiredText,
  validateMobile,
  validateEmail,
  validateDate,
  validatePositiveNumber,
  validateInteger,
  validatePaymentSettlement
} from "../utils/validators";

export default function PurchaseModal({
  isOpen,
  onClose,
  onSave,
  purchaseToEdit = null,
  nextId = "LE-PUR-2026-001",
  clients = [],
  company = {}
}) {
  if (!isOpen) return null;
  const isEditing = !!purchaseToEdit;

  const [form, setForm] = useState(() => {
    if (purchaseToEdit) {
      const pAmt = Number(purchaseToEdit.paidAmount) || 0;
      const d1Amt = purchaseToEdit.day1Amount !== undefined ? Number(purchaseToEdit.day1Amount) : pAmt;
      return {
        ...purchaseToEdit,
        day1Amount: d1Amt,
        day1Date: purchaseToEdit.day1Date || purchaseToEdit.date || new Date().toISOString().slice(0, 10),
        day1Method: purchaseToEdit.day1Method || purchaseToEdit.paymentMethod || "RTGS / Bank Transfer",
        day1Ref: purchaseToEdit.day1Ref || "",
        day1Notes: purchaseToEdit.day1Notes || "Day 1 Initial / Advance Procurement Settlement",
        installments: Array.isArray(purchaseToEdit.installments) ? purchaseToEdit.installments : []
      };
    }
    const defaultDate = new Date().toISOString().slice(0, 10);
    return {
      id: nextId,
      category: "Animal Feed Shop", // "Animal Feed Shop" | "Dairy" | "Farmers"
      vendorName: "",
      contactPerson: "",
      village: "",
      taluka: "",
      district: "Pune",
      contact: "",
      email: "",
      dob: "",
      billNumber: "BILL-" + Math.floor(1000 + Math.random() * 9000),

      // Specific Information - Animal Feed Shop
      productTypes: "Cattle Feed, Calf Starter, Mineral Mixture, Calcium Supplement, Maize Silage",
      companies: "Godrej Agrovet, Baramati Agro, Amul, Cargill India",
      brands: "Godrej MilkMore, Samruddhi Supreme, Kapila Gold, Amul Dan",
      numberOfAnimals: "550+ Local Cattle Network",
      feedQuantity: "250 Bags (50kg each)",

      // Specific Information - Dairy
      numberOfSuppliers: 92,
      milkQuantity: "4,500 Liters / Day",
      fatPercent: "4.2",
      snfPercent: "8.6",
      ratePerLiter: "38.50",

      // Specific Information - Farmers
      animalDetails: "10 HF Crossbreed Cows, 5 Murrah Buffaloes, 3 Heifers",
      farmItemsSupplied: "Sweet Corn Silage Bales & Lucerne Hay",
      farmQuantity: "12 Tonnes",

      // Commercial & Settlement
      date: defaultDate,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      itemDescription: "Bulk High-Yield Cattle Feed (MilkMore 50kg bags)",
      taxableAmount: 362500,
      gstRate: 5,
      gstAmount: 18125,
      totalAmount: 380625,
      paidAmount: 380625,
      paymentStatus: "Paid",
      paymentMethod: "RTGS / Bank Transfer",
      remarks: "Direct inward to Warehouse Silo Bay 2",

      // Partial Payment & Day 1 Data
      day1Amount: 200000,
      day1Date: defaultDate,
      day1Method: "RTGS / Bank Transfer",
      day1Ref: "",
      day1Notes: "Day 1 Initial / Advance Settlement",
      installments: []
    };
  });

  const [errors, setErrors] = useState({});

  // Clear specific field error
  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Calculate taxes and totals
  const handleAmountChange = (taxable, rate) => {
    const taxNum = Number(taxable) || 0;
    const rateNum = Number(rate) || 0;
    const gstVal = Math.round(taxNum * (rateNum / 100));
    const totalVal = taxNum + gstVal;
    setForm(prev => {
      const isPaid = prev.paymentStatus === "Paid";
      return {
        ...prev,
        taxableAmount: taxNum,
        gstRate: rateNum,
        gstAmount: gstVal,
        totalAmount: totalVal,
        paidAmount: isPaid ? totalVal : prev.paidAmount,
        day1Amount: isPaid ? totalVal : prev.day1Amount
      };
    });
    clearError("taxableAmount");
    clearError("paidAmount");
    clearError("day1Amount");
  };

  // Quick auto-populate from registered clients/suppliers
  const handleSelectClient = (clientName) => {
    const found = clients.find(c => c.name === clientName);
    if (!found) return;

    const cat = found.clientType === "Dairy" ? "Dairy" :
                found.clientType === "Farmers" ? "Farmers" : "Animal Feed Shop";

    setForm(prev => {
      const updated = {
        ...prev,
        category: cat,
        vendorName: found.name,
        contactPerson: found.contactPerson || found.name,
        village: found.village || prev.village,
        taluka: found.taluka || prev.taluka,
        district: found.district || prev.district,
        contact: found.contact || prev.contact,
        email: found.email || prev.email,
        dob: found.dob || prev.dob
      };

      if (cat === "Animal Feed Shop") {
        updated.productTypes = found.productTypes || prev.productTypes;
        updated.companies = found.companies || prev.companies;
        updated.brands = found.brands || prev.brands;
        updated.numberOfAnimals = found.numberOfAnimals || prev.numberOfAnimals;
        updated.gstRate = 5;
        updated.itemDescription = `Inward Cattle Feed from ${found.name}`;
      } else if (cat === "Dairy") {
        updated.numberOfSuppliers = found.numberOfSuppliers || prev.numberOfSuppliers;
        updated.milkQuantity = found.milkQuantity || prev.milkQuantity;
        updated.gstRate = 0;
        updated.itemDescription = `Chilled Raw Milk Procurement from ${found.name}`;
      } else if (cat === "Farmers") {
        updated.numberOfAnimals = found.numberOfAnimals || prev.numberOfAnimals;
        updated.animalDetails = found.animalDetails || prev.animalDetails;
        updated.gstRate = 0;
        updated.itemDescription = `Direct Farm Fodder & Agricultural Produce from ${found.name}`;
      }
      return updated;
    });

    setErrors({});
  };

  // Change Category
  const handleCategoryChange = (newCat) => {
    setForm(prev => {
      let desc = prev.itemDescription;
      let gst = prev.gstRate;
      if (newCat === "Animal Feed Shop") {
        gst = 5;
        desc = "High-Yield Cattle Feed (50kg bags)";
      } else if (newCat === "Dairy") {
        gst = 0;
        desc = "Chilled Raw Milk Procurement";
      } else if (newCat === "Farmers") {
        gst = 0;
        desc = "Green Fodder & Silage Inward";
      }
      return {
        ...prev,
        category: newCat,
        gstRate: gst,
        itemDescription: desc
      };
    });
  };

  const validateForm = () => {
    const errs = {};

    // Common info
    const vendorVal = validateRequiredText(form.vendorName, "Supplier / Seller Name", 2);
    if (!vendorVal.isValid) errs.vendorName = vendorVal.error;

    const villageVal = validateRequiredText(form.village, "Village (गाव)", 2);
    if (!villageVal.isValid) errs.village = villageVal.error;

    const talukaVal = validateRequiredText(form.taluka, "Taluka (तालुका)", 2);
    if (!talukaVal.isValid) errs.taluka = talukaVal.error;

    const districtVal = validateRequiredText(form.district, "District (जिल्हा)", 2);
    if (!districtVal.isValid) errs.district = districtVal.error;

    const mobileVal = validateMobile(form.contact, true);
    if (!mobileVal.isValid) errs.contact = mobileVal.error;

    const emailVal = validateEmail(form.email, false);
    if (!emailVal.isValid) errs.email = emailVal.error;

    const dobVal = validateDate(form.dob, "Date of Birth / Inception", { notFuture: true, isRequired: false });
    if (!dobVal.isValid) errs.dob = dobVal.error;

    // Category specifics
    if (form.category === "Animal Feed Shop") {
      const prodTypesVal = validateRequiredText(form.productTypes, "Types of Products", 2);
      if (!prodTypesVal.isValid) errs.productTypes = prodTypesVal.error;

      const compVal = validateRequiredText(form.companies, "Companies Selling Products", 2);
      if (!compVal.isValid) errs.companies = compVal.error;

      const brandVal = validateRequiredText(form.brands, "Brands Sold & Procured", 2);
      if (!brandVal.isValid) errs.brands = brandVal.error;
    } else if (form.category === "Dairy") {
      const suppVal = validateInteger(form.numberOfSuppliers, "Number of Suppliers", 1);
      if (!suppVal.isValid) errs.numberOfSuppliers = suppVal.error;

      const milkVal = validateRequiredText(form.milkQuantity, "Quantity of Milk", 1);
      if (!milkVal.isValid) errs.milkQuantity = milkVal.error;
    } else if (form.category === "Farmers") {
      const animVal = validateInteger(form.numberOfAnimals, "Number of Animals", 0);
      if (!animVal.isValid) errs.numberOfAnimals = animVal.error;
    }

    // Commercial Order
    const idVal = validateRequiredText(form.id, "Purchase Order ID", 2);
    if (!idVal.isValid) errs.id = idVal.error;

    const itemDescVal = validateRequiredText(form.itemDescription, "Procurement Item Description", 2);
    if (!itemDescVal.isValid) errs.itemDescription = itemDescVal.error;

    const dateVal = validateDate(form.date, "Bill Issue Date", { isRequired: true });
    if (!dateVal.isValid) errs.date = dateVal.error;

    const dueDateVal = validateDate(form.dueDate, "Payment Due Date", { minDate: form.date, isRequired: false });
    if (!dueDateVal.isValid) errs.dueDate = dueDateVal.error;

    const taxableVal = validatePositiveNumber(form.taxableAmount, "Taxable Amount");
    if (!taxableVal.isValid) errs.taxableAmount = taxableVal.error;

    const total = (Number(form.taxableAmount) || 0) + Math.round((Number(form.taxableAmount) || 0) * ((Number(form.gstRate) || 0) / 100));

    if (form.paymentStatus === "Partial") {
      const day1Val = validatePositiveNumber(form.day1Amount, "Day 1 Advance Payment Amount");
      if (!day1Val.isValid) {
        errs.day1Amount = day1Val.error;
      } else if (Number(form.day1Amount) >= total) {
        errs.day1Amount = `Day 1 partial payment (₹${Number(form.day1Amount).toLocaleString("en-IN")}) must be strictly less than Grand Total (₹${total.toLocaleString("en-IN")}). Choose 'Fully Paid' if fully settled.`;
      }

      const day1DateVal = validateDate(form.day1Date, "Day 1 Payment Date", { isRequired: true });
      if (!day1DateVal.isValid) errs.day1Date = day1DateVal.error;

      // Calculate total paid across day1 + installments
      const extraInstSum = (form.installments || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
      const computedPaid = (Number(form.day1Amount) || 0) + extraInstSum;
      const settleVal = validatePaymentSettlement(form.paymentStatus, total, computedPaid);
      if (!settleVal.isValid && !errs.day1Amount) errs.paidAmount = settleVal.error;
    } else {
      const settleVal = validatePaymentSettlement(form.paymentStatus, total, form.paidAmount);
      if (!settleVal.isValid) errs.paidAmount = settleVal.error;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const taxable = Number(form.taxableAmount) || 0;
    const gstRate = Number(form.gstRate) || 0;
    const gstAmount = Math.round(taxable * (gstRate / 100));
    const totalAmount = taxable + gstAmount;

    let day1Amount = Number(form.day1Amount) || 0;
    let paidAmount = 0;

    if (form.paymentStatus === "Paid") {
      paidAmount = totalAmount;
      day1Amount = totalAmount;
    } else if (form.paymentStatus === "Pending") {
      paidAmount = 0;
      day1Amount = 0;
    } else {
      // Partial payment
      const extraInstSum = (form.installments || []).reduce((s, inst) => s + (Number(inst.amount) || 0), 0);
      paidAmount = day1Amount + extraInstSum;
    }
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    const payload = {
      ...form,
      taxableAmount: taxable,
      gstRate,
      gstAmount,
      totalAmount,
      paidAmount,
      balanceDue,
      day1Amount,
      day1Date: form.day1Date || form.date,
      day1Method: form.day1Method || form.paymentMethod,
      day1Ref: form.day1Ref || "",
      day1Notes: form.day1Notes || "",
      installments: form.installments || []
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 860, width: "95%", maxHeight: "92vh", display: "flex", flexDirection: "column" }}
      >
        {/* MODAL HEADER */}
        <div className="modal-head" style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: form.category === "Dairy" ? "rgba(2, 132, 199, 0.15)" :
                          form.category === "Farmers" ? "rgba(217, 119, 6, 0.15)" : "rgba(16, 185, 129, 0.15)",
              color: form.category === "Dairy" ? "#0284c7" :
                     form.category === "Farmers" ? "#d97706" : "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <ShoppingCart size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                {isEditing ? `Edit Purchase Voucher: ${form.id}` : "Record New Inward Purchase"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Agribusiness procurement with verified field validation
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            
            {/* Validation Summary */}
            <ValidationSummary errors={errors} title="Please correct the highlighted purchase voucher details:" />

            {/* 1. SECTOR / CATEGORY SELECTOR */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>
                Select Purchase Category / Sector <RequiredStar />
              </label>
              <div className="client-type-selector">
                {/* 1. Animal Feed Shop */}
                <div
                  className={`client-type-card ${form.category === "Animal Feed Shop" ? "selected feed-shop" : ""}`}
                  onClick={() => handleCategoryChange("Animal Feed Shop")}
                >
                  <div className="type-icon feed-icon"><Wheat size={22} /></div>
                  <div className="type-meta">
                    <strong>1. Animal Feed Shop</strong>
                    <span>Feed, Minerals, Brands & Cattle Network</span>
                  </div>
                </div>

                {/* 2. Dairy */}
                <div
                  className={`client-type-card ${form.category === "Dairy" ? "selected dairy" : ""}`}
                  onClick={() => handleCategoryChange("Dairy")}
                >
                  <div className="type-icon dairy-icon"><Milk size={22} /></div>
                  <div className="type-meta">
                    <strong>2. Dairy</strong>
                    <span>Raw Milk, Liters & Supplier Count</span>
                  </div>
                </div>

                {/* 3. Farmers */}
                <div
                  className={`client-type-card ${form.category === "Farmers" ? "selected farmers" : ""}`}
                  onClick={() => handleCategoryChange("Farmers")}
                >
                  <div className="type-icon farmer-icon"><Tractor size={22} /></div>
                  <div className="type-meta">
                    <strong>3. Farmers</strong>
                    <span>Silage, Fodder, Animals & Direct Farm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK AUTOFILL DROPDOWN */}
            {clients.length > 0 && (
              <div style={{ marginBottom: 18, background: "var(--table-hover)", padding: "10px 14px", borderRadius: 8, border: "1px dashed var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Building2 size={14} /> Quick Auto-Fill from Registered Clients:
                  </span>
                  <select
                    className="form-select"
                    style={{ maxWidth: 380, fontSize: "0.82rem", padding: "4px 8px" }}
                    value=""
                    onChange={(e) => handleSelectClient(e.target.value)}
                  >
                    <option value="" disabled>-- Select Client to Load Info --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>
                        [{c.clientType || "General"}] {c.name} ({c.taluka || c.village || "MS"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 2. COMMON INFORMATION */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                <User size={15} style={{ color: "var(--primary)" }} />
                <h4 style={{ margin: 0, fontSize: "0.92rem", color: "var(--text-main)" }}>
                  Common Supplier & Entity Information
                </h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Supplier / Seller / Farmer Name <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.vendorName ? "is-invalid" : ""}`}
                    value={form.vendorName}
                    onChange={(e) => {
                      setForm({ ...form, vendorName: e.target.value });
                      clearError("vendorName");
                    }}
                    placeholder="e.g. Shree Samarth Animal Feed Traders / Gokul Dairy"
                    required
                  />
                  <FieldError error={errors.vendorName} />
                </div>

                <div className="form-group">
                  <label>Contact Person / Proprietor</label>
                  <input
                    className="form-input"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    placeholder="e.g. Dattatray Shinde / Sambhaji Patil"
                  />
                </div>

                <div className="form-group">
                  <label>Village (गाव) <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.village ? "is-invalid" : ""}`}
                    value={form.village}
                    onChange={(e) => {
                      setForm({ ...form, village: e.target.value });
                      clearError("village");
                    }}
                    placeholder="e.g. Baramati Rural / Kasaba Bawada"
                    required
                  />
                  <FieldError error={errors.village} />
                </div>

                <div className="form-group">
                  <label>Taluka (तालुका) <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.taluka ? "is-invalid" : ""}`}
                    value={form.taluka}
                    onChange={(e) => {
                      setForm({ ...form, taluka: e.target.value });
                      clearError("taluka");
                    }}
                    placeholder="e.g. Baramati / Karveer / Haveli"
                    required
                  />
                  <FieldError error={errors.taluka} />
                </div>

                <div className="form-group">
                  <label>District (जिल्हा) <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.district ? "is-invalid" : ""}`}
                    value={form.district}
                    onChange={(e) => {
                      setForm({ ...form, district: e.target.value });
                      clearError("district");
                    }}
                    placeholder="e.g. Pune / Kolhapur / Satara"
                    required
                  />
                  <FieldError error={errors.district} />
                </div>

                <div className="form-group">
                  <label>Contact Number (Mobile) <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.contact ? "is-invalid" : ""}`}
                    value={form.contact}
                    onChange={(e) => {
                      setForm({ ...form, contact: e.target.value });
                      clearError("contact");
                    }}
                    placeholder="10-digit mobile number"
                    required
                  />
                  <FieldError error={errors.contact} />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? "is-invalid" : ""}`}
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      clearError("email");
                    }}
                    placeholder="e.g. supplier@agri.com"
                  />
                  <FieldError error={errors.email} />
                </div>

                <div className="form-group">
                  <label>Date of Birth (DOB) / Inception</label>
                  <input
                    type="date"
                    className={`form-input ${errors.dob ? "is-invalid" : ""}`}
                    value={form.dob}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => {
                      setForm({ ...form, dob: e.target.value });
                      clearError("dob");
                    }}
                  />
                  <FieldError error={errors.dob} />
                </div>
              </div>
            </div>

            {/* 3. CATEGORY SPECIFIC FIELDS */}
            <div className="specific-form-section" style={{
              marginBottom: 20,
              padding: "16px 18px",
              borderRadius: 8,
              border: form.category === "Dairy" ? "1px solid rgba(2, 132, 199, 0.3)" :
                      form.category === "Farmers" ? "1px solid rgba(217, 119, 6, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
              background: form.category === "Dairy" ? "rgba(2, 132, 199, 0.04)" :
                          form.category === "Farmers" ? "rgba(217, 119, 6, 0.04)" : "rgba(16, 185, 129, 0.04)"
            }}>
              
              {/* CATEGORY 1: ANIMAL FEED SHOP */}
              {form.category === "Animal Feed Shop" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <Wheat size={16} style={{ color: "#059669" }} />
                    <h4 style={{ margin: 0, fontSize: "0.92rem", color: "#059669" }}>
                      Specific Information: Animal Feed Shop / Inward Feed Stocks
                    </h4>
                  </div>

                  <div className="form-grid">
                    <div className="form-group full">
                      <label>Types of Products <RequiredStar /></label>
                      <input
                        className={`form-input ${errors.productTypes ? "is-invalid" : ""}`}
                        value={form.productTypes}
                        onChange={(e) => {
                          setForm({ ...form, productTypes: e.target.value });
                          clearError("productTypes");
                        }}
                        placeholder="e.g. Cattle Feed, Calf Starter, Mineral Mixture, Calcium Supplement, Maize Silage"
                        required
                      />
                      <FieldError error={errors.productTypes} />
                    </div>

                    <div className="form-group">
                      <label>Companies Selling Products <RequiredStar /></label>
                      <input
                        className={`form-input ${errors.companies ? "is-invalid" : ""}`}
                        value={form.companies}
                        onChange={(e) => {
                          setForm({ ...form, companies: e.target.value });
                          clearError("companies");
                        }}
                        placeholder="e.g. Godrej Agrovet, Baramati Agro, Amul, Cargill India"
                        required
                      />
                      <FieldError error={errors.companies} />
                    </div>

                    <div className="form-group">
                      <label>Brands Sold & Procured <RequiredStar /></label>
                      <input
                        className={`form-input ${errors.brands ? "is-invalid" : ""}`}
                        value={form.brands}
                        onChange={(e) => {
                          setForm({ ...form, brands: e.target.value });
                          clearError("brands");
                        }}
                        placeholder="e.g. Godrej MilkMore, Samruddhi Supreme, Kapila Gold, Amul Dan"
                        required
                      />
                      <FieldError error={errors.brands} />
                    </div>

                    <div className="form-group">
                      <label>No. Of Animals (Serviced / Network)</label>
                      <input
                        className="form-input"
                        value={form.numberOfAnimals}
                        onChange={(e) => setForm({ ...form, numberOfAnimals: e.target.value })}
                        placeholder="e.g. 550+ Local Cattle Network / 400 Cows"
                      />
                    </div>

                    <div className="form-group">
                      <label>Feed Batch Inward Quantity</label>
                      <input
                        className="form-input"
                        value={form.feedQuantity}
                        onChange={(e) => setForm({ ...form, feedQuantity: e.target.value })}
                        placeholder="e.g. 250 Bags (50kg each) / 12.5 MT"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* CATEGORY 2: DAIRY */}
              {form.category === "Dairy" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <Milk size={16} style={{ color: "#0284c7" }} />
                    <h4 style={{ margin: 0, fontSize: "0.92rem", color: "#0284c7" }}>
                      Specific Information: Dairy & Raw Milk Procurement
                    </h4>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Number of Suppliers (Member Farmers) <RequiredStar /></label>
                      <input
                        type="number"
                        min="1"
                        className={`form-input ${errors.numberOfSuppliers ? "is-invalid" : ""}`}
                        value={form.numberOfSuppliers}
                        onChange={(e) => {
                          setForm({ ...form, numberOfSuppliers: e.target.value });
                          clearError("numberOfSuppliers");
                        }}
                        placeholder="e.g. 92"
                        required
                      />
                      <FieldError error={errors.numberOfSuppliers} />
                    </div>

                    <div className="form-group">
                      <label>Quantity of Milk (Daily / Batch Volume) <RequiredStar /></label>
                      <input
                        className={`form-input ${errors.milkQuantity ? "is-invalid" : ""}`}
                        value={form.milkQuantity}
                        onChange={(e) => {
                          setForm({ ...form, milkQuantity: e.target.value });
                          clearError("milkQuantity");
                        }}
                        placeholder="e.g. 4,500 Liters / Day or 2,200 Liters batch"
                        required
                      />
                      <FieldError error={errors.milkQuantity} />
                    </div>

                    <div className="form-group">
                      <label>Milk Fat Content (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="15"
                        className="form-input"
                        value={form.fatPercent}
                        onChange={(e) => setForm({ ...form, fatPercent: e.target.value })}
                        placeholder="e.g. 4.2"
                      />
                    </div>

                    <div className="form-group">
                      <label>Solid-Not-Fat SNF (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        className="form-input"
                        value={form.snfPercent}
                        onChange={(e) => setForm({ ...form, snfPercent: e.target.value })}
                        placeholder="e.g. 8.6"
                      />
                    </div>

                    <div className="form-group">
                      <label>Procurement Rate per Liter (₹/Ltr)</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        className="form-input"
                        value={form.ratePerLiter}
                        onChange={(e) => {
                          const r = e.target.value;
                          setForm(prev => {
                            const ltr = parseFloat(prev.milkQuantity) || 0;
                            const tax = ltr > 0 ? Math.round(ltr * parseFloat(r || 0)) : prev.taxableAmount;
                            return { ...prev, ratePerLiter: r, taxableAmount: tax, totalAmount: tax };
                          });
                        }}
                        placeholder="e.g. 38.50"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* CATEGORY 3: FARMERS */}
              {form.category === "Farmers" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <Tractor size={16} style={{ color: "#d97706" }} />
                    <h4 style={{ margin: 0, fontSize: "0.92rem", color: "#d97706" }}>
                      Specific Information: Farmers / Direct Agricultural & Livestock Procurement
                    </h4>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>No. Of Animals <RequiredStar /></label>
                      <input
                        type="number"
                        min="0"
                        className={`form-input ${errors.numberOfAnimals ? "is-invalid" : ""}`}
                        value={form.numberOfAnimals}
                        onChange={(e) => {
                          setForm({ ...form, numberOfAnimals: e.target.value });
                          clearError("numberOfAnimals");
                        }}
                        placeholder="e.g. 18"
                        required
                      />
                      <FieldError error={errors.numberOfAnimals} />
                    </div>

                    <div className="form-group">
                      <label>Animal Details & Livestock Breeds</label>
                      <input
                        className="form-input"
                        value={form.animalDetails}
                        onChange={(e) => setForm({ ...form, animalDetails: e.target.value })}
                        placeholder="e.g. 10 HF Crossbreed Cows, 5 Murrah Buffaloes, 3 Heifers"
                      />
                    </div>

                    <div className="form-group">
                      <label>Farm Produce / Fodder Procured</label>
                      <input
                        className="form-input"
                        value={form.farmItemsSupplied}
                        onChange={(e) => setForm({ ...form, farmItemsSupplied: e.target.value })}
                        placeholder="e.g. Sweet Corn Silage Bales, Green Lucerne Fodder"
                      />
                    </div>

                    <div className="form-group">
                      <label>Quantity / Weight</label>
                      <input
                        className="form-input"
                        value={form.farmQuantity}
                        onChange={(e) => setForm({ ...form, farmQuantity: e.target.value })}
                        placeholder="e.g. 12 Tonnes / 500 Bales"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4. COMMERCIAL BILL & PAYMENT SETTLEMENT */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>
                <DollarSign size={15} style={{ color: "var(--primary)" }} />
                <h4 style={{ margin: 0, fontSize: "0.92rem", color: "var(--text-main)" }}>
                  Commercial Order & Settlement Details
                </h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Purchase Order / PO ID <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.id ? "is-invalid" : ""}`}
                    value={form.id}
                    onChange={(e) => {
                      setForm({ ...form, id: e.target.value });
                      clearError("id");
                    }}
                    required
                  />
                  <FieldError error={errors.id} />
                </div>

                <div className="form-group">
                  <label>Vendor Bill / Invoice Number</label>
                  <input
                    className="form-input"
                    value={form.billNumber}
                    onChange={(e) => setForm({ ...form, billNumber: e.target.value })}
                    placeholder="e.g. BILL-9021"
                  />
                </div>

                <div className="form-group full">
                  <label>Procurement Item Description <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.itemDescription ? "is-invalid" : ""}`}
                    value={form.itemDescription}
                    onChange={(e) => {
                      setForm({ ...form, itemDescription: e.target.value });
                      clearError("itemDescription");
                    }}
                    placeholder="Item or consignment description"
                    required
                  />
                  <FieldError error={errors.itemDescription} />
                </div>

                <div className="form-group">
                  <label>Bill Issue Date <RequiredStar /></label>
                  <input
                    type="date"
                    className={`form-input ${errors.date ? "is-invalid" : ""}`}
                    value={form.date}
                    onChange={(e) => {
                      setForm({ ...form, date: e.target.value });
                      clearError("date");
                    }}
                    required
                  />
                  <FieldError error={errors.date} />
                </div>

                <div className="form-group">
                  <label>Payment Due Date</label>
                  <input
                    type="date"
                    min={form.date}
                    className={`form-input ${errors.dueDate ? "is-invalid" : ""}`}
                    value={form.dueDate}
                    onChange={(e) => {
                      setForm({ ...form, dueDate: e.target.value });
                      clearError("dueDate");
                    }}
                  />
                  <FieldError error={errors.dueDate} />
                </div>

                <div className="form-group">
                  <label>Taxable Amount (₹) <RequiredStar /></label>
                  <input
                    type="number"
                    min="1"
                    className={`form-input ${errors.taxableAmount ? "is-invalid" : ""}`}
                    value={form.taxableAmount}
                    onChange={(e) => handleAmountChange(e.target.value, form.gstRate)}
                    required
                  />
                  <FieldError error={errors.taxableAmount} />
                </div>

                <div className="form-group">
                  <label>GST Rate (%)</label>
                  <select
                    className="form-select"
                    value={form.gstRate}
                    onChange={(e) => handleAmountChange(form.taxableAmount, e.target.value)}
                  >
                    <option value="0">0% (Exempt - Raw Milk / Farm Produce)</option>
                    <option value="5">5% (Cattle Feed / Mineral Mix)</option>
                    <option value="12">12% (Feed Supplements / Silage)</option>
                    <option value="18">18% (Commercial / Industrial)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Grand Total Inward Value (₹)</label>
                  <input
                    className="form-input"
                    value={`₹${(Number(form.totalAmount) || 0).toLocaleString("en-IN")} (GST: ₹${(Number(form.gstAmount) || 0).toLocaleString("en-IN")})`}
                    disabled
                    style={{ background: "var(--table-hover)", fontWeight: 700 }}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Settlement Status</label>
                  <select
                    className="form-select"
                    value={form.paymentStatus}
                    onChange={(e) => {
                      const st = e.target.value;
                      setForm(prev => {
                        let pAmt = prev.paidAmount;
                        let d1Amt = prev.day1Amount;
                        if (st === "Paid") {
                          pAmt = prev.totalAmount;
                          d1Amt = prev.totalAmount;
                        } else if (st === "Pending") {
                          pAmt = 0;
                          d1Amt = 0;
                        } else if (st === "Partial") {
                          if (pAmt === prev.totalAmount || pAmt === 0) {
                            d1Amt = Math.round(prev.totalAmount * 0.5) || 50000;
                            pAmt = d1Amt;
                          } else {
                            d1Amt = pAmt;
                          }
                        }
                        return {
                          ...prev,
                          paymentStatus: st,
                          paidAmount: pAmt,
                          day1Amount: d1Amt
                        };
                      });
                      clearError("paidAmount");
                      clearError("day1Amount");
                    }}
                  >
                    <option value="Paid">Fully Paid / Settled</option>
                    <option value="Partial">Partially Paid (Add Day 1 Data)</option>
                    <option value="Pending">Payment Pending</option>
                  </select>
                </div>

                {form.paymentStatus === "Paid" && (
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      className="form-select"
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    >
                      <option value="RTGS / Bank Transfer">RTGS / Bank Transfer</option>
                      <option value="NEFT">NEFT</option>
                      <option value="UPI Commercial">UPI Commercial</option>
                      <option value="Cheque Settlement">Cheque Settlement</option>
                      <option value="Cash at Delivery">Cash at Delivery</option>
                    </select>
                  </div>
                )}

                {/* DEDICATED PARTIAL PAYMENT & DAY 1 DATA CARD */}
                {form.paymentStatus === "Partial" && (
                  <div className="form-group full" style={{
                    background: "rgba(245, 158, 11, 0.04)",
                    border: "1px solid rgba(245, 158, 11, 0.35)",
                    borderRadius: 10,
                    padding: 16,
                    marginTop: 4,
                    marginBottom: 10
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          background: "rgba(245, 158, 11, 0.18)",
                          color: "#d97706",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <Calendar size={16} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-main)" }}>
                            Partial Payment & Day 1 Settlement Data
                          </h4>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            Record Day 1 advance payment, mode of remittance, and remaining balance clearance schedule
                          </span>
                        </div>
                      </div>
                      <span className="badge warning" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} /> Day 1 Initial Clearance
                      </span>
                    </div>

                    {/* Day 1 Input Fields Grid */}
                    <div className="form-grid" style={{ marginBottom: 12 }}>
                      <div className="form-group">
                        <label>Day 1 Advance Paid (₹) <RequiredStar /></label>
                        <input
                          type="number"
                          min="1"
                          max={form.totalAmount}
                          className={`form-input ${errors.day1Amount ? "is-invalid" : ""}`}
                          value={form.day1Amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm(prev => {
                              const num = Number(val) || 0;
                              const extra = (prev.installments || []).reduce((s, i) => s + (Number(i.amount) || 0), 0);
                              return {
                                ...prev,
                                day1Amount: val,
                                paidAmount: num + extra
                              };
                            });
                            clearError("day1Amount");
                            clearError("paidAmount");
                          }}
                          placeholder="e.g. 150000"
                          required
                        />
                        <FieldError error={errors.day1Amount} />
                      </div>

                      <div className="form-group">
                        <label>Day 1 Payment Date <RequiredStar /></label>
                        <input
                          type="date"
                          className={`form-input ${errors.day1Date ? "is-invalid" : ""}`}
                          value={form.day1Date}
                          onChange={(e) => {
                            setForm({ ...form, day1Date: e.target.value });
                            clearError("day1Date");
                          }}
                          required
                        />
                        <FieldError error={errors.day1Date} />
                      </div>

                      <div className="form-group">
                        <label>Day 1 Payment Mode</label>
                        <select
                          className="form-select"
                          value={form.day1Method}
                          onChange={(e) => {
                            const m = e.target.value;
                            setForm({ ...form, day1Method: m, paymentMethod: m });
                          }}
                        >
                          <option value="RTGS / Bank Transfer">RTGS / Bank Transfer</option>
                          <option value="NEFT">NEFT</option>
                          <option value="UPI Commercial">UPI Commercial</option>
                          <option value="Cheque Settlement">Cheque Settlement</option>
                          <option value="Cash at Delivery">Cash at Delivery / Gate</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Day 1 UTR / Cheque Ref No.</label>
                        <input
                          className="form-input"
                          value={form.day1Ref}
                          onChange={(e) => setForm({ ...form, day1Ref: e.target.value })}
                          placeholder="e.g. UTR-98214012"
                        />
                      </div>

                      <div className="form-group full">
                        <label>Day 1 Payment Notes / Purpose</label>
                        <input
                          className="form-input"
                          value={form.day1Notes}
                          onChange={(e) => setForm({ ...form, day1Notes: e.target.value })}
                          placeholder="e.g. Day 1 advance paid upon quality inspection at gate entry"
                        />
                      </div>
                    </div>

                    {/* Live Calculation Metric Bar */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 12,
                      background: "var(--card-bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "12px 14px",
                      fontSize: "0.82rem"
                    }}>
                      <div>
                        <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Grand Procurement Value:</span>
                        <strong style={{ fontSize: "1.05rem", color: "var(--text-main)" }}>
                          ₹{(Number(form.totalAmount) || 0).toLocaleString("en-IN")}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Day 1 Paid Outflow:</span>
                        <strong style={{ fontSize: "1.05rem", color: "#10b981" }}>
                          ₹{(Number(form.day1Amount) || 0).toLocaleString("en-IN")}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Remaining Balance Due:</span>
                        <strong style={{ fontSize: "1.05rem", color: "var(--danger)" }}>
                          ₹{Math.max(0, (Number(form.totalAmount) || 0) - ((Number(form.day1Amount) || 0) + (form.installments || []).reduce((s, i) => s + (Number(i.amount) || 0), 0))).toLocaleString("en-IN")}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.75rem" }}>Clearance Target Date:</span>
                        <strong style={{ fontSize: "0.95rem", color: "var(--primary)" }}>
                          {form.dueDate || "15 Days Standard"}
                        </strong>
                      </div>
                    </div>

                    {/* Subsequent Installments Manager */}
                    <div style={{ marginTop: 14, borderTop: "1px dashed var(--border)", paddingTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>
                          Subsequent Payment Schedule (Day 2 / Later):
                        </span>
                        <button
                          type="button"
                          className="outline"
                          style={{ fontSize: "0.75rem", padding: "4px 9px", display: "flex", alignItems: "center", gap: 4 }}
                          onClick={() => {
                            const nextIdx = (form.installments || []).length + 2;
                            const newInst = {
                              id: Date.now(),
                              title: `Day ${nextIdx} Payment`,
                              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                              amount: "",
                              method: form.day1Method || "RTGS / Bank Transfer",
                              ref: ""
                            };
                            setForm(prev => ({
                              ...prev,
                              installments: [...(prev.installments || []), newInst]
                            }));
                          }}
                        >
                          <Plus size={13} /> Add Day {(form.installments || []).length + 2} Entry
                        </button>
                      </div>

                      {(form.installments || []).length === 0 ? (
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                          Single Day 1 payment currently recorded. Click above if you want to schedule Day 2 or subsequent installments.
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {form.installments.map((inst, idx) => (
                            <div key={inst.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card-bg)", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: 600, minWidth: 95, color: "var(--primary)" }}>
                                {inst.title || `Day ${idx + 2}`}:
                              </span>
                              <input
                                type="number"
                                placeholder="Amount (₹)"
                                style={{ width: 110, fontSize: "0.8rem", padding: "4px 8px" }}
                                className="form-input"
                                value={inst.amount}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setForm(prev => {
                                    const updated = prev.installments.map(i => i.id === inst.id ? { ...i, amount: val } : i);
                                    const instSum = updated.reduce((s, it) => s + (Number(it.amount) || 0), 0);
                                    return {
                                      ...prev,
                                      installments: updated,
                                      paidAmount: (Number(prev.day1Amount) || 0) + instSum
                                    };
                                  });
                                }}
                              />
                              <input
                                type="date"
                                style={{ width: 130, fontSize: "0.8rem", padding: "4px 8px" }}
                                className="form-input"
                                value={inst.date}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setForm(prev => ({
                                    ...prev,
                                    installments: prev.installments.map(i => i.id === inst.id ? { ...i, date: val } : i)
                                  }));
                                }}
                              />
                              <input
                                type="text"
                                placeholder="UTR / Ref"
                                style={{ width: 120, fontSize: "0.8rem", padding: "4px 8px" }}
                                className="form-input"
                                value={inst.ref}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setForm(prev => ({
                                    ...prev,
                                    installments: prev.installments.map(i => i.id === inst.id ? { ...i, ref: val } : i)
                                  }));
                                }}
                              />
                              <button
                                type="button"
                                className="icon-btn"
                                style={{ color: "var(--danger)", padding: 4 }}
                                title="Remove installment"
                                onClick={() => {
                                  setForm(prev => {
                                    const updated = prev.installments.filter(i => i.id !== inst.id);
                                    const instSum = updated.reduce((s, it) => s + (Number(it.amount) || 0), 0);
                                    return {
                                      ...prev,
                                      installments: updated,
                                      paidAmount: (Number(prev.day1Amount) || 0) + instSum
                                    };
                                  });
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="form-group full">
                  <label>Warehouse Delivery Bay / Internal Remarks</label>
                  <input
                    className="form-input"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    placeholder="e.g. Unloaded at Silo Bay 2 / Quality verified"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* MODAL FOOTER */}
          <div className="modal-footer" style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
            <button type="button" className="outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Save size={16} />
              {isEditing ? "Update Purchase Voucher" : "Save Purchase Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
