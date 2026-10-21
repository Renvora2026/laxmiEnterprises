/**
 * Centralized Validation Utilities for Laxmi Enterprises ERP Portal
 * Standardized across Clients, Products, Inventory, Invoices, Purchases,
 * Expo Leads, Authentication, and Admin Workspace.
 */

// Indian Mobile Number: 10 digits starting with 6, 7, 8, 9
// Optionally accepts +91 or leading 0 which gets stripped during sanitization
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

// Standard Indian GSTIN: 15 alphanumeric characters
// 2 state digits + 10 PAN chars + 1 entity code + 'Z' + 1 checksum char
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Standard Indian PAN: 10 characters (5 letters, 4 digits, 1 letter)
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Standard Email RFC-compliant regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Indian IFSC Code: 4 letters + 0 + 6 alphanumeric
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Indian PIN Code: 6 digits starting with 1-9
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Sanitizes and strips extraneous characters from a phone number string
 */
export function sanitizePhone(phone = "") {
  if (!phone) return "";
  let clean = String(phone).replace(/[^\d+]/g, "").trim();
  // Strip +91 or 91 prefix if length is 12
  if (clean.startsWith("+91")) clean = clean.slice(3);
  else if (clean.startsWith("91") && clean.length === 12) clean = clean.slice(2);
  // Strip leading 0 if length is 11
  else if (clean.startsWith("0") && clean.length === 11) clean = clean.slice(1);
  return clean;
}

/**
 * Validates an Indian mobile phone number
 */
export function validateMobile(phone, isRequired = true) {
  const clean = sanitizePhone(phone);
  if (!clean) {
    return isRequired
      ? { isValid: false, error: "Mobile number is required.", sanitized: "" }
      : { isValid: true, sanitized: "" };
  }
  if (!INDIAN_MOBILE_REGEX.test(clean)) {
    return {
      isValid: false,
      error: "Enter a valid 10-digit mobile number (starts with 6, 7, 8, or 9).",
      sanitized: clean
    };
  }
  return { isValid: true, sanitized: clean };
}

/**
 * Validates an email address
 */
export function validateEmail(email, isRequired = false) {
  const trimmed = String(email || "").trim();
  if (!trimmed) {
    return isRequired
      ? { isValid: false, error: "Email address is required." }
      : { isValid: true };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address (e.g. name@domain.com)." };
  }
  return { isValid: true };
}

/**
 * Validates a GSTIN tax identification number
 */
export function validateGSTIN(gstin, isRequired = false) {
  const upper = String(gstin || "").trim().toUpperCase();
  if (!upper) {
    return isRequired
      ? { isValid: false, error: "GSTIN is required." }
      : { isValid: true };
  }
  if (!GSTIN_REGEX.test(upper)) {
    return {
      isValid: false,
      error: "Invalid GSTIN format (e.g. 27AAACL1234F1Z5 - 15 alphanumeric characters)."
    };
  }
  return { isValid: true, sanitized: upper };
}

/**
 * Validates an Indian Permanent Account Number (PAN)
 */
export function validatePAN(pan, isRequired = false) {
  const upper = String(pan || "").trim().toUpperCase();
  if (!upper) {
    return isRequired
      ? { isValid: false, error: "PAN is required." }
      : { isValid: true };
  }
  if (!PAN_REGEX.test(upper)) {
    return {
      isValid: false,
      error: "Invalid PAN format (e.g. AAACL1234F - 5 letters, 4 digits, 1 letter)."
    };
  }
  return { isValid: true, sanitized: upper };
}

/**
 * Validates required text fields with minimum length
 */
export function validateRequiredText(value, fieldLabel = "This field", minLength = 2, maxLength = 250) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }
  if (trimmed.length < minLength) {
    return { isValid: false, error: `${fieldLabel} must be at least ${minLength} characters.` };
  }
  if (trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldLabel} cannot exceed ${maxLength} characters.` };
  }
  return { isValid: true };
}

/**
 * Validates positive number (strictly > 0)
 */
export function validatePositiveNumber(value, fieldLabel = "Amount", min = 0.01) {
  const num = Number(value);
  if (value === "" || value === null || value === undefined || isNaN(num)) {
    return { isValid: false, error: `${fieldLabel} must be a valid number.` };
  }
  if (num <= 0 || num < min) {
    return { isValid: false, error: `${fieldLabel} must be greater than 0.` };
  }
  return { isValid: true, value: num };
}

/**
 * Validates non-negative number (>= 0)
 */
export function validateNonNegativeNumber(value, fieldLabel = "Amount") {
  const num = Number(value);
  if (value === "" || value === null || value === undefined || isNaN(num)) {
    return { isValid: false, error: `${fieldLabel} must be a valid number.` };
  }
  if (num < 0) {
    return { isValid: false, error: `${fieldLabel} cannot be negative.` };
  }
  return { isValid: true, value: num };
}

/**
 * Validates an integer
 */
export function validateInteger(value, fieldLabel = "Quantity", min = 0) {
  const num = Number(value);
  if (value === "" || value === null || value === undefined || isNaN(num)) {
    return { isValid: false, error: `${fieldLabel} must be a valid number.` };
  }
  if (!Number.isInteger(num)) {
    return { isValid: false, error: `${fieldLabel} must be a whole integer.` };
  }
  if (num < min) {
    return { isValid: false, error: `${fieldLabel} cannot be less than ${min}.` };
  }
  return { isValid: true, value: num };
}

/**
 * Validates date string (YYYY-MM-DD)
 */
export function validateDate(dateStr, fieldLabel = "Date", options = {}) {
  const { notFuture = false, notPast = false, minDate = null, maxDate = null, isRequired = true } = options;
  if (!dateStr) {
    return isRequired
      ? { isValid: false, error: `${fieldLabel} is required.` }
      : { isValid: true };
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return { isValid: false, error: `Please enter a valid ${fieldLabel}.` };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  if (notFuture && dateStr > todayStr) {
    return { isValid: false, error: `${fieldLabel} cannot be a future date.` };
  }
  if (notPast && dateStr < todayStr) {
    return { isValid: false, error: `${fieldLabel} cannot be in the past.` };
  }
  if (minDate && dateStr < minDate) {
    return { isValid: false, error: `${fieldLabel} cannot be before ${minDate}.` };
  }
  if (maxDate && dateStr > maxDate) {
    return { isValid: false, error: `${fieldLabel} cannot be after ${maxDate}.` };
  }
  return { isValid: true };
}

/**
 * Validates unique identifier against an array of existing IDs
 */
export function validateUniqueId(id, existingIds = [], currentId = null, fieldLabel = "Reference ID") {
  const trimmed = String(id || "").trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }
  const isDuplicate = existingIds.some(
    existing => existing && existing.toLowerCase() === trimmed.toLowerCase() && existing.toLowerCase() !== (currentId || "").toLowerCase()
  );
  if (isDuplicate) {
    return { isValid: false, error: `A record with ${fieldLabel} "${trimmed}" already exists.` };
  }
  return { isValid: true };
}

/**
 * Validates invoice line items array
 */
export function validateInvoiceItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return { isValid: false, generalError: "At least one item is required.", itemErrors: [] };
  }

  let hasError = false;
  const itemErrors = items.map((it, idx) => {
    const errs = {};
    if (!it.description || !it.description.trim()) {
      errs.description = "Item description required.";
      hasError = true;
    }
    const q = Number(it.qty);
    if (isNaN(q) || q <= 0) {
      errs.qty = "Quantity must be > 0.";
      hasError = true;
    }
    const r = Number(it.rate);
    if (isNaN(r) || r <= 0) {
      errs.rate = "Unit rate must be > 0.";
      hasError = true;
    }
    const gst = Number(it.gstRate);
    if (isNaN(gst) || gst < 0 || gst > 100) {
      errs.gstRate = "GST rate must be 0-100%.";
      hasError = true;
    }
    return errs;
  });

  return {
    isValid: !hasError,
    generalError: hasError ? "Please fix the highlighted item details." : null,
    itemErrors
  };
}

/**
 * Validates payment settlement amounts
 */
export function validatePaymentSettlement(status, totalAmount, paidAmount) {
  const total = Number(totalAmount) || 0;
  const paid = Number(paidAmount) || 0;

  if (paid < 0) {
    return { isValid: false, error: "Paid amount cannot be negative." };
  }
  if (status === "Partial") {
    if (paid <= 0) {
      return { isValid: false, error: "Partially paid amount must be greater than 0." };
    }
    if (paid >= total) {
      return { isValid: false, error: "Partial payment must be strictly less than Grand Total. Otherwise choose 'Fully Paid'." };
    }
  }
  if (paid > total) {
    return { isValid: false, error: `Paid amount (₹${paid}) cannot exceed Grand Total (₹${total}).` };
  }
  return { isValid: true };
}
