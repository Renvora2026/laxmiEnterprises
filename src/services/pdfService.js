import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { LAXMI_LOGO_BASE64 } from "../assets/logoBase64.js";

/**
 * Convert integer amount to Indian currency words format (Rupees)
 */
export function numberToWordsINR(amount) {
  if (!amount || isNaN(amount)) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const num = Math.round(Number(amount));
  if (num === 0) return "Zero Rupees Only";

  const numStr = ("000000000" + num).slice(-9);
  const match = numStr.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!match) return `${num} Rupees Only`;

  let words = "";
  const crore = Number(match[1]);
  const lakh = Number(match[2]);
  const thousand = Number(match[3]);
  const hundred = Number(match[4]);
  const remainder = Number(match[5]);

  if (crore > 0) {
    words += (a[crore] || `${b[Math.floor(crore / 10)]} ${a[crore % 10]}`).trim() + " Crore ";
  }
  if (lakh > 0) {
    words += (a[lakh] || `${b[Math.floor(lakh / 10)]} ${a[lakh % 10]}`).trim() + " Lakh ";
  }
  if (thousand > 0) {
    words += (a[thousand] || `${b[Math.floor(thousand / 10)]} ${a[thousand % 10]}`).trim() + " Thousand ";
  }
  if (hundred > 0) {
    words += a[hundred] + " Hundred ";
  }
  if (remainder > 0) {
    if (words !== "") words += "and ";
    words += (a[remainder] || `${b[Math.floor(remainder / 10)]} ${a[remainder % 10]}`).trim() + " ";
  }

  return words.trim() + " Rupees Only";
}

/**
 * Generate a professional, GST-compliant Tax Invoice PDF and trigger browser download
 *
 * @param {Object} invoice - Invoice details (id, clientName, clientId, date, dueDate, amount, tax, total, status, category, paymentMethod)
 * @param {Object} company - Enterprise profile info (name, gstin, pan, email, phone, address)
 * @param {Object} clientExtra - Optional extra client data (address, gstin, contact)
 * @returns {Object} { fileName, doc }
 */
export function generateInvoicePDF(invoice, company = {}, clientExtra = {}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Safe text wrapper to prevent any "Invalid arguments passed to jsPDF.text"
  const _origText = doc.text.bind(doc);
  doc.text = function(text, x, y, options, transform) {
    if (text === null || text === undefined) text = "";
    else if (typeof text !== "string" && !Array.isArray(text)) text = String(text);
    return _origText(text, x, y, options, transform);
  };

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Dynamic company info strictly from database
  const companyInfo = {
    name: company.name || "Laxmi Enterprises",
    tagline: company.tagline || "",
    gstin: company.gstin || "",
    pan: company.pan || "",
    phone: company.phone || "",
    email: company.email || "",
    address: company.address || "",
    state: company.state || "Maharashtra (Code: 27)",
    bankName: company.bankName || "",
    bankBranch: company.bankBranch || "",
    accountNumber: company.accountNumber || "",
    ifscCode: company.ifscCode || "",
    accountName: company.accountName || ""
  };

  const invoiceAmount = Number(invoice.amount || invoice.subtotal || invoice.taxableTotal) || 0;
  const invoiceTax = Number(invoice.tax || invoice.taxAmount || invoice.gstTotal) || (invoice.gstRate ? Math.round(invoiceAmount * (Number(invoice.gstRate) / 100)) : 0);
  const invoiceTotal = Number(invoice.total || invoice.grandTotal) || (invoiceAmount + invoiceTax);
  const effectiveGstRate = invoice.gstRate !== undefined && invoice.gstRate !== null
    ? Number(invoice.gstRate)
    : (invoiceAmount > 0 ? Math.round((invoiceTax / invoiceAmount) * 100) : 0);
  const halfRate = (effectiveGstRate / 2).toFixed(1).replace(/\.0$/, "");
  const cgst = Number(invoice.cgstTotal) || Math.round(invoiceTax / 2);
  const sgst = Number(invoice.sgstTotal) || (invoiceTax - cgst);

  // 1. TOP BRAND HEADER ACCENT BAR (Royal Sapphire)
  doc.setFillColor(0, 91, 181); // #005bb5
  doc.rect(0, 0, pageWidth, 8, "F");

  // Secondary Cyan Accent Line
  doc.setFillColor(0, 180, 216); // #00b4d8
  doc.rect(0, 8, pageWidth, 1.5, "F");

  // 2. COMPANY LOGO & BRANDING HEADER
  const logoImg = company.logo || companyInfo.logo || LAXMI_LOGO_BASE64;
  let textStartX = margin;
  if (logoImg) {
    try {
      doc.addImage(logoImg, "PNG", margin, 12, 20, 20);
      textStartX = margin + 24;
    } catch (e) {
      console.warn("Could not render logo on invoice PDF:", e);
      textStartX = margin;
    }
  }

  let currentY = 18;

  // Left: Company Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 43, 92); // Deep corporate navy
  doc.text(companyInfo.name, textStartX, currentY);

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(companyInfo.tagline, textStartX, currentY);

  currentY += 4.5;
  doc.setFontSize(8);
  doc.text(`${companyInfo.address}`, textStartX, currentY, { maxWidth: textStartX === margin ? 105 : 86 });

  currentY += 7.5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`GSTIN: ${companyInfo.gstin}  |  PAN: ${companyInfo.pan}`, textStartX, currentY);

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${companyInfo.phone}  |  Email: ${companyInfo.email}`, textStartX, currentY);

  // Right Side: TAX INVOICE BADGE & INVOICE METADATA
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 91, 181);
  doc.text("TAX INVOICE", rightX, 17, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("(Original for Recipient • GST Commercial)", rightX, 21.5, { align: "right" });

  // Metadata Card Box
  const metaBoxY = 24;
  const metaBoxW = 68;
  const metaBoxH = 26;
  const metaBoxX = pageWidth - margin - metaBoxW;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(metaBoxX, metaBoxY, metaBoxW, metaBoxH, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Invoice Number
  doc.setFont("helvetica", "bold");
  doc.text("Invoice No:", metaBoxX + 4, metaBoxY + 6);
  doc.setTextColor(0, 91, 181);
  doc.text(String(invoice.id || "N/A"), rightX - 4, metaBoxY + 6, { align: "right" });

  // Invoice Date
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.text("Invoice Date:", metaBoxX + 4, metaBoxY + 11);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.date || new Date().toISOString().slice(0, 10), rightX - 4, metaBoxY + 11, { align: "right" });

  // Due Date
  doc.setFont("helvetica", "normal");
  doc.text("Due Date:", metaBoxX + 4, metaBoxY + 16);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.dueDate || "-", rightX - 4, metaBoxY + 16, { align: "right" });

  // Payment Status with Pill
  doc.setFont("helvetica", "normal");
  doc.text("Payment Status:", metaBoxX + 4, metaBoxY + 21);

  const statusText = (invoice.status || "Paid").toUpperCase();
  if (statusText === "PAID") {
    doc.setTextColor(16, 185, 129); // Green
  } else if (statusText === "PENDING") {
    doc.setTextColor(245, 158, 11); // Amber
  } else {
    doc.setTextColor(239, 68, 68); // Red
  }
  doc.setFont("helvetica", "bold");
  doc.text(statusText, rightX - 4, metaBoxY + 21, { align: "right" });

  // 3. SEPARATOR LINE
  currentY = Math.max(currentY + 6, metaBoxY + metaBoxH + 3);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // 4. BILL TO / SHIP TO & SUPPLIER BOXES
  currentY += 4;
  const colW = (contentWidth - 6) / 2;
  const boxH = 32;

  // Box 1: Supplier / Billed By
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, colW, boxH, 2, 2, "FD");

  // Box 1 Header
  doc.setFillColor(0, 91, 181);
  doc.roundedRect(margin, currentY, colW, 6, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("BILLED BY (SUPPLIER)", margin + 4, currentY + 4.2);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(companyInfo.name, margin + 4, currentY + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`GSTIN: ${companyInfo.gstin}`, margin + 4, currentY + 16);
  doc.text(`PAN: ${companyInfo.pan}`, margin + 4, currentY + 20);
  doc.text(`State: ${companyInfo.state}`, margin + 4, currentY + 24);
  doc.text(`Place of Supply: Maharashtra (27)`, margin + 4, currentY + 28);

  // Box 2: Billed To (Customer)
  const box2X = margin + colW + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(box2X, currentY, colW, boxH, 2, 2, "FD");

  // Box 2 Header
  doc.setFillColor(0, 43, 92);
  doc.roundedRect(box2X, currentY, colW, 6, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("BILLED TO (CUSTOMER / RECIPIENT)", box2X + 4, currentY + 4.2);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.clientName || "Valued Enterprise Client", box2X + 4, currentY + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Client ID: ${invoice.clientId || clientExtra.clientId || "—"}`, box2X + 4, currentY + 16);
  doc.text(`GSTIN: ${clientExtra.gstin || invoice.clientGstin || "—"}`, box2X + 4, currentY + 20);
  doc.text(`Location / City: ${clientExtra.city || clientExtra.address || "Maharashtra, India"}`, box2X + 4, currentY + 24);
  doc.text(`Payment Mode: ${invoice.paymentMode || invoice.paymentMethod || "—"}`, box2X + 4, currentY + 28);

  currentY += boxH + 6;

  // 5. ITEMIZED PARTICULARS TABLE (via jspdf-autotable)
  const categoryDesc = (invoice.category && !invoice.category.toLowerCase().includes("hardware") && !invoice.category.toLowerCase().includes("industrial")) ? invoice.category : "Animal Feed & Agro Supplies";
  const hsnMap = {
    "Hardware": "7318 (Industrial Fasteners & Screws)",
    "Electrical": "8544 (Insulated Cables & Fittings)",
    "Mechanical": "8481 (Taps, Cocks, Valves & Boiler Parts)",
    "Piping & Conduit": "7307 (Tube or Pipe Fittings of Iron/Steel)",
    "General": "8479 (Industrial Machinery & Equipment)"
  };
  const hsnCode = hsnMap[invoice.category] || "8481 / 7318";

  const tableBody = (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0)
    ? invoice.items.map((item, idx) => [
        String(idx + 1),
        item.description || item.name || `${categoryDesc} Item`,
        item.hsn || hsnCode,
        `${item.qty || 1} ${item.unit || "Nos"}`,
        `Rs. ${Number(item.rate || item.price || 0).toLocaleString("en-IN")}`,
        `Rs. ${Number(item.taxable || (Number(item.qty || 1) * Number(item.rate || item.price || 0))).toLocaleString("en-IN")}`,
        `${item.gstRate !== undefined && item.gstRate !== null ? item.gstRate : effectiveGstRate}%`,
        `Rs. ${Number(item.total || 0).toLocaleString("en-IN")}`
      ])
    : [
        [
          "1",
          `${categoryDesc}\nCommercial industrial supplies lot as per order reference`,
          hsnCode,
          "1 Lot",
          `Rs. ${invoiceAmount.toLocaleString("en-IN")}`,
          `Rs. ${invoiceAmount.toLocaleString("en-IN")}`,
          `${effectiveGstRate > 0 ? `${effectiveGstRate}% GST` : "GST"}`,
          `Rs. ${invoiceTotal.toLocaleString("en-IN")}`
        ]
      ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        "#",
        "Item Description / Particulars",
        "HSN/SAC",
        "Qty",
        "Rate (INR)",
        "Taxable Value (INR)",
        "GST Rate",
        "Total Amount (INR)"
      ]
    ],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [0, 91, 181],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      valign: "middle"
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 58 },
      2: { cellWidth: 24, fontSize: 7, halign: "center" },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 14, halign: "center" },
      7: { cellWidth: 22, halign: "right", fontStyle: "bold" }
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 3.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  const finalTableY = doc.lastAutoTable.finalY + 4;

  // 6. TOTALS & BREAKDOWN SUMMARY SECTION
  const summaryBoxW = 76;
  const summaryBoxX = pageWidth - margin - summaryBoxW;
  const summaryBoxY = finalTableY;

  // Totals Box
  const hasPaymentBreakdown = invoice.paidAmount !== undefined;
  const boxHeight = hasPaymentBreakdown ? 47 : 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxW, boxHeight, 2, 2, "FD");

  let lineY = summaryBoxY + 6;
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  // Subtotal
  doc.setFont("helvetica", "normal");
  doc.text("Taxable Value (Subtotal):", summaryBoxX + 4, lineY);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${invoiceAmount.toLocaleString("en-IN")}`, rightX - 4, lineY, { align: "right" });

  // CGST (9%)
  lineY += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`CGST${halfRate > 0 ? ` @ ${halfRate}%` : ""}:`, summaryBoxX + 4, lineY);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${cgst.toLocaleString("en-IN")}`, rightX - 4, lineY, { align: "right" });

  // SGST (9%)
  lineY += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`SGST${halfRate > 0 ? ` @ ${halfRate}%` : ""}:`, summaryBoxX + 4, lineY);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${sgst.toLocaleString("en-IN")}`, rightX - 4, lineY, { align: "right" });

  // Total GST
  lineY += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`Total Tax (GST${effectiveGstRate > 0 ? ` ${effectiveGstRate}%` : ""}):`, summaryBoxX + 4, lineY);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${invoiceTax.toLocaleString("en-IN")}`, rightX - 4, lineY, { align: "right" });

  // Grand Total Highlight Bar
  lineY += 4;
  doc.setFillColor(0, 91, 181);
  doc.roundedRect(summaryBoxX + 1.5, lineY, summaryBoxW - 3, 9, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text("GRAND TOTAL (INR):", summaryBoxX + 4, lineY + 6);
  doc.text(`Rs. ${invoiceTotal.toLocaleString("en-IN")}`, rightX - 4, lineY + 6, { align: "right" });

  if (hasPaymentBreakdown) {
    lineY += 12.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text("Amount Received / Paid:", summaryBoxX + 4, lineY);
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${Number(invoice.paidAmount || 0).toLocaleString("en-IN")}`, rightX - 4, lineY, { align: "right" });

    lineY += 4.5;
    const balance = Number(invoice.balanceDue || 0);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(balance > 0 ? 220 : 5, balance > 0 ? 38 : 150, balance > 0 ? 38 : 105);
    doc.text("Remaining Balance Due:", summaryBoxX + 4, lineY);
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${balance.toLocaleString("en-IN")}`, rightX - 4, lineY, { align: "right" });
  }

  // LEFT SIDE: AMOUNT IN WORDS & BANK DETAILS
  const leftW = contentWidth - summaryBoxW - 6;
  let leftY = summaryBoxY;

  // Amount in Words Card
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, leftY, leftW, 13, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 91, 181);
  doc.text("INVOICE AMOUNT IN WORDS (INR):", margin + 3.5, leftY + 4.5);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const wordsText = numberToWordsINR(invoiceTotal);
  doc.text(wordsText, margin + 3.5, leftY + 9.5, { maxWidth: leftW - 7 });

  // Bank Account & Remittance Card
  leftY += 16;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, leftY, leftW, 28, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 43, 92);
  doc.text("BANK DETAILS FOR WIRE / NEFT / RTGS PAYMENT:", margin + 3.5, leftY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  if (companyInfo.bankName || companyInfo.accountNumber) {
    doc.text(`Bank Name: ${companyInfo.bankName || "—"}`, margin + 3.5, leftY + 10);
    doc.text(`Account Name: ${companyInfo.accountName || companyInfo.name || "—"}`, margin + 3.5, leftY + 14);
    doc.text(`Account Number: ${companyInfo.accountNumber || "—"}`, margin + 3.5, leftY + 18);
    doc.text(`IFSC Code: ${companyInfo.ifscCode || "—"}  |  Branch: ${companyInfo.bankBranch || "—"}`, margin + 3.5, leftY + 22);
  } else {
    doc.text("Payment Mode: Commercial NEFT / RTGS / UPI", margin + 3.5, leftY + 10);
    doc.text(`Beneficiary: ${companyInfo.name || "Laxmi Enterprises"}`, margin + 3.5, leftY + 14);
    doc.text("Bank remittance details available on invoice voucher.", margin + 3.5, leftY + 18);
  }

  // 7. TERMS & CONDITIONS AND AUTHORIZED SIGNATORY
  const bottomY = Math.max(summaryBoxY + 39, leftY + 31) + 4;

  // Terms & Conditions (Left)
  const termsW = leftW;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("TERMS & CONDITIONS:", margin, bottomY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("1. All disputes are subject to local jurisdiction only.", margin, bottomY + 8);
  doc.text("2. Payment is due within standard agreed credit period. Interest @ 18% p.a. chargeable on overdue accounts.", margin, bottomY + 11.5);
  doc.text("3. Goods once received and inspected cannot be returned without written authorization from Laxmi Enterprises.", margin, bottomY + 15);
  doc.text("4. Input Tax Credit (ITC) applicable as per GST Section 16 of CGST Act, 2017.", margin, bottomY + 18.5);

  // Authorized Signatory Block (Right)
  const signX = pageWidth - margin - 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 43, 92);
  doc.text(`For ${companyInfo.name}`, signX + 30, bottomY + 4, { align: "center" });

  // Stamp / Digital Seal Placeholder box
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.roundedRect(signX, bottomY + 7, 60, 13, 1, 1, "D");
  doc.setLineDashPattern([], 0); // Reset dash

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("[ Digitally Verified • Authorized Seal ]", signX + 30, bottomY + 15, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Authorized Signatory", signX + 30, bottomY + 24, { align: "center" });

  // 8. FOOTER NOTE
  const footerY = 286;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("This is an electronically generated GST Tax Invoice from Laxmi Enterprises ERP Portal. No physical signature required.", margin, footerY);
  doc.text("Page 1 of 1", rightX, footerY, { align: "right" });

  // Bottom Sapphire Brand Accent Line
  doc.setFillColor(0, 91, 181);
  doc.rect(0, 294, pageWidth, 3, "F");

  // Save PDF directly to user's computer
  const cleanId = (invoice.id || "INV").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${cleanId}_Laxmi_Enterprises_Invoice.pdf`;
  try {
    if (typeof window !== "undefined" && window.FlutterDownloadBridge) {
      try {
        const dataUri = doc.output("datauristring");
        window.FlutterDownloadBridge.postMessage(JSON.stringify({
          filename: fileName,
          dataUrl: dataUri
        }));
      } catch(e) {
        console.error("Flutter bridge error:", e);
        if (typeof doc.save === "function") doc.save(fileName);
      }
    } else if (typeof window !== "undefined" && typeof doc.save === "function") {
      doc.save(fileName);
    }
  } catch (saveErr) {
    console.warn("doc.save skipped:", saveErr.message);
  }

  return { fileName, doc };
}

/**
 * Generate a professional, GST-compliant Inward Purchase Voucher & Payment Receipt PDF
 * Includes support for Partial Payments, Day 1 Data, Installment logs, and Agribusiness Sector specifics.
 *
 * @param {Object} purchase - Inward purchase record details
 * @param {Object} company - Enterprise profile info
 * @returns {Object} { fileName, doc }
 */
export function generatePurchaseInvoicePDF(purchase = {}, company = {}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Safe text wrapper to prevent any "Invalid arguments passed to jsPDF.text"
  const _origText = doc.text.bind(doc);
  doc.text = function(text, x, y, options, transform) {
    if (text === null || text === undefined) text = "";
    else if (typeof text !== "string" && !Array.isArray(text)) text = String(text);
    return _origText(text, x, y, options, transform);
  };

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Dynamic company info strictly from database
  const companyInfo = {
    name: company.name || "Laxmi Enterprises",
    tagline: company.tagline || "",
    gstin: company.gstin || "",
    pan: company.pan || "",
    phone: company.phone || "",
    email: company.email || "",
    address: company.address || "",
    state: company.state || "Maharashtra (Code: 27)",
    bankName: company.bankName || "",
    bankBranch: company.bankBranch || "",
    accountNumber: company.accountNumber || "",
    ifscCode: company.ifscCode || "",
    accountName: company.accountName || ""
  };

  const isFeed = purchase.category === "Animal Feed Shop";
  const isDairy = purchase.category === "Dairy";
  const isFarmer = purchase.category === "Farmers";

  const taxableAmount = Number(purchase.taxableAmount) || 0;
  const gstRate = Number(purchase.gstRate) || 0;
  const gstAmount = Number(purchase.gstAmount) || Math.round(taxableAmount * (gstRate / 100));
  const totalAmount = Number(purchase.totalAmount || purchase.total || purchase.grandTotal) || (taxableAmount + gstAmount);
  const paidAmount = Number(purchase.paidAmount || purchase.day1Amount) || 0;
  const balanceDue = Math.max(0, totalAmount - paidAmount);

  const day1Amount = Number(purchase.day1Amount) || (purchase.paymentStatus === "Paid" ? totalAmount : paidAmount);
  const day1Date = purchase.day1Date || purchase.date || new Date().toISOString().slice(0, 10);
  const day1Method = purchase.day1Method || purchase.paymentMethod || "RTGS / Bank Transfer";
  const day1Ref = purchase.day1Ref || "";
  const day1Notes = purchase.day1Notes || "";

  // 1. BRAND ACCENT STRIPE (Agri Emerald Green & Sky Blue)
  doc.setFillColor(5, 150, 105); // Emerald Green #059669
  doc.rect(0, 0, pageWidth, 8, "F");

  doc.setFillColor(2, 132, 199); // Sky Blue #0284c7
  doc.rect(0, 8, pageWidth, 1.5, "F");

  // 2. COMPANY LOGO & HEADER (BUYER / RECEIVING ENTERPRISE)
  const purchaseLogoImg = company.logo || companyInfo.logo || LAXMI_LOGO_BASE64;
  let pTextStartX = margin;
  if (purchaseLogoImg) {
    try {
      doc.addImage(purchaseLogoImg, "PNG", margin, 12, 20, 20);
      pTextStartX = margin + 24;
    } catch (e) {
      console.warn("Could not render logo on purchase PDF invoice:", e);
      pTextStartX = margin;
    }
  }

  let currentY = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(5, 150, 105); // Emerald
  doc.text(companyInfo.name, pTextStartX, currentY);

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(companyInfo.tagline, pTextStartX, currentY);

  currentY += 4.5;
  doc.setFontSize(8);
  doc.text(`${companyInfo.address}`, pTextStartX, currentY, { maxWidth: pTextStartX === margin ? 105 : 86 });

  currentY += 7.5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`GSTIN: ${companyInfo.gstin}  |  PAN: ${companyInfo.pan}`, pTextStartX, currentY);

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${companyInfo.phone}  |  Email: ${companyInfo.email}`, pTextStartX, currentY);

  // Right Side: DOCUMENT BADGE & METADATA
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text("PURCHASE INVOICE & RECEIPT", rightX, 17, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("(Inward Agribusiness Procurement Voucher)", rightX, 21.5, { align: "right" });

  // Metadata Card Box
  const metaBoxY = 24;
  const metaBoxW = 72;
  const metaBoxH = 28;
  const metaBoxX = pageWidth - margin - metaBoxW;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(metaBoxX, metaBoxY, metaBoxW, metaBoxH, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // PO Number
  doc.setFont("helvetica", "bold");
  doc.text("PO Ref No:", metaBoxX + 4, metaBoxY + 5.5);
  doc.setTextColor(5, 150, 105);
  doc.text(purchase.id || "-", rightX - 4, metaBoxY + 5.5, { align: "right" });

  // Bill Number
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.text("Vendor Bill No:", metaBoxX + 4, metaBoxY + 10.5);
  doc.setFont("helvetica", "bold");
  doc.text(purchase.billNumber || "-", rightX - 4, metaBoxY + 10.5, { align: "right" });

  // Issue Date
  doc.setFont("helvetica", "normal");
  doc.text("Voucher Date:", metaBoxX + 4, metaBoxY + 15.5);
  doc.setFont("helvetica", "bold");
  doc.text(purchase.date || "-", rightX - 4, metaBoxY + 15.5, { align: "right" });

  // Due Date
  doc.setFont("helvetica", "normal");
  doc.text("Due Date:", metaBoxX + 4, metaBoxY + 20.5);
  doc.setFont("helvetica", "bold");
  doc.text(purchase.dueDate || "-", rightX - 4, metaBoxY + 20.5, { align: "right" });

  // Payment Status
  doc.setFont("helvetica", "normal");
  doc.text("Settlement Status:", metaBoxX + 4, metaBoxY + 25.5);

  const statusText = (purchase.paymentStatus || "Paid").toUpperCase();
  if (statusText === "PAID") {
    doc.setTextColor(16, 185, 129); // Green
  } else if (statusText === "PARTIAL") {
    doc.setTextColor(245, 158, 11); // Amber
  } else {
    doc.setTextColor(239, 68, 68); // Red
  }
  doc.setFont("helvetica", "bold");
  doc.text(statusText === "PARTIAL" ? "PARTIALLY PAID" : statusText, rightX - 4, metaBoxY + 25.5, { align: "right" });

  // 3. SEPARATOR LINE
  currentY = Math.max(currentY + 6, metaBoxY + metaBoxH + 3);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // 4. RECEIVING ENTERPRISE & SUPPLIER ENTITY CARDS
  currentY += 4;
  const colW = (contentWidth - 6) / 2;
  const boxH = 34;

  // Box 1: Receiving Enterprise (Buyer)
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, colW, boxH, 2, 2, "FD");

  // Box 1 Header
  doc.setFillColor(5, 150, 105);
  doc.roundedRect(margin, currentY, colW, 6, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("BUYER / RECEIVING ENTERPRISE", margin + 4, currentY + 4.2);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(companyInfo.name, margin + 4, currentY + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`GSTIN: ${companyInfo.gstin} | PAN: ${companyInfo.pan}`, margin + 4, currentY + 16);
  doc.text(`Phone: ${companyInfo.phone}`, margin + 4, currentY + 20);
  doc.text(`Delivery Location: Maharashtra (27)`, margin + 4, currentY + 24);
  doc.text(`Warehouse/Bay: ${purchase.remarks || "Central Silo Receiving Bay"}`, margin + 4, currentY + 28, { maxWidth: colW - 8 });

  // Box 2: Supplier Entity (Seller / Vendor)
  const box2X = margin + colW + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(box2X, currentY, colW, boxH, 2, 2, "FD");

  // Box 2 Header
  doc.setFillColor(2, 132, 199); // Sky blue
  doc.roundedRect(box2X, currentY, colW, 6, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`SUPPLIER ENTITY (${(purchase.category || "General").toUpperCase()})`, box2X + 4, currentY + 4.2);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(purchase.vendorName || purchase.name || "Vendor Partner", box2X + 4, currentY + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact Person: ${purchase.contactPerson || purchase.vendorName || "-"}`, box2X + 4, currentY + 16);
  doc.text(`Village: ${purchase.village || "-"}, Taluka: ${purchase.taluka || "-"}, Dist: ${purchase.district || "-"}`, box2X + 4, currentY + 20);
  doc.text(`Mobile: ${purchase.contact || "-"} ${purchase.email ? "| " + purchase.email : ""}`, box2X + 4, currentY + 24);
  doc.text(`Sector: ${purchase.category || "-"}`, box2X + 4, currentY + 28);

  currentY += boxH + 4;

  // 5. AGRIBUSINESS SECTOR SPECIFICATIONS BOX
  doc.setFillColor(254, 252, 232); // Light amber / warm
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(margin, currentY, contentWidth, 15, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text("SECTOR INTELLIGENCE & PROCUREMENT SPECIFICATION:", margin + 4, currentY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  let specText = "";
  if (isFeed) {
    specText = `Brands: ${purchase.brands || "Standard"} | Companies: ${purchase.companies || "Feed Mfrs"} | Stock Volume: ${purchase.feedQuantity || "-"} | Network: ${purchase.numberOfAnimals || "-"}`;
  } else if (isDairy) {
    specText = `Milk Quantity: ${purchase.milkQuantity || "-"} | Suppliers: ${purchase.numberOfSuppliers || 0} Members | Quality: ${purchase.fatPercent || "-"}% Fat, ${purchase.snfPercent || "-"}% SNF | Base Rate: Rs. ${purchase.ratePerLiter || 38}/Ltr`;
  } else if (isFarmer) {
    specText = `Livestock: ${purchase.numberOfAnimals || 0} Animals (${purchase.animalDetails || "General Cattle"}) | Produce: ${purchase.farmItemsSupplied || "Green Silage"} | Volume: ${purchase.farmQuantity || "-"}`;
  } else {
    specText = `Description: ${purchase.itemDescription} | Sector Category: ${purchase.category}`;
  }
  doc.text(specText, margin + 4, currentY + 10, { maxWidth: contentWidth - 8 });

  currentY += 19;

  // 6. ITEM PROCUREMENT TABLE (via autoTable)
  const tableData = [
    [
      "1",
      `${purchase.itemDescription}\nSector: ${purchase.category} • Bill Ref: ${purchase.billNumber || "-"}`,
      purchase.category || "Commercial",
      `₹${taxableAmount.toLocaleString("en-IN")}`,
      `${gstRate}% (₹${gstAmount.toLocaleString("en-IN")})`,
      `₹${totalAmount.toLocaleString("en-IN")}`
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["#", "Item Description & Inward Consignment", "Category", "Taxable Inward", "GST Rate", "Gross Total"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [5, 150, 105], // Emerald
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "left"
    },
    styles: {
      fontSize: 7.8,
      cellPadding: 3.5,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 72 },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 24, halign: "right", fontStyle: "bold" }
    }
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // 7. FINANCIAL SETTLEMENT & PARTIAL PAYMENT (DAY 1) BREAKDOWN
  const summaryBoxW = 76;
  const summaryBoxX = pageWidth - margin - summaryBoxW;
  const summaryBoxY = currentY;

  // Left Side: Partial Payment / Day 1 Card & Installment History
  const leftW = contentWidth - summaryBoxW - 6;
  let leftY = currentY;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, leftY, leftW, 36, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text("PARTIAL PAYMENT & DAY 1 SETTLEMENT DATA:", margin + 3.5, leftY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Day 1 Paid Outflow:`, margin + 3.5, leftY + 10.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text(`₹${day1Amount.toLocaleString("en-IN")}`, margin + 38, leftY + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(`Day 1 Payment Date:`, margin + 3.5, leftY + 15);
  doc.setFont("helvetica", "bold");
  doc.text(`${day1Date}`, margin + 38, leftY + 15);

  doc.setFont("helvetica", "normal");
  doc.text(`Payment Mode / Route:`, margin + 3.5, leftY + 19.5);
  doc.setFont("helvetica", "bold");
  doc.text(`${day1Method}`, margin + 38, leftY + 19.5);

  if (day1Ref) {
    doc.setFont("helvetica", "normal");
    doc.text(`UTR / Cheque Ref No:`, margin + 3.5, leftY + 24);
    doc.setFont("helvetica", "bold");
    doc.text(`${day1Ref}`, margin + 38, leftY + 24);
  }

  doc.setFont("helvetica", "normal");
  doc.text(`Settlement Notes:`, margin + 3.5, leftY + 28.5);
  doc.text(`${day1Notes || purchase.remarks || "Direct vendor procurement clearance"}`, margin + 38, leftY + 28.5, { maxWidth: leftW - 42 });

  // Status Badge inside Left Card
  doc.setFont("helvetica", "bold");
  doc.text(`Clearance Status:`, margin + 3.5, leftY + 33);
  doc.setTextColor(purchase.paymentStatus === "Paid" ? 16 : 245, purchase.paymentStatus === "Paid" ? 185 : 158, purchase.paymentStatus === "Paid" ? 129 : 11);
  doc.text(`${purchase.paymentStatus} Settlement`, margin + 38, leftY + 33);

  // Right Side: Grand Total & Dues Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxW, 36, 2, 2, "FD");

  let sumRowY = summaryBoxY + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Taxable Inward:", summaryBoxX + 4, sumRowY);
  doc.text(`₹${taxableAmount.toLocaleString("en-IN")}`, rightX - 4, sumRowY, { align: "right" });

  sumRowY += 4.5;
  doc.text(`GST (${gstRate}%):`, summaryBoxX + 4, sumRowY);
  doc.text(`₹${gstAmount.toLocaleString("en-IN")}`, rightX - 4, sumRowY, { align: "right" });

  sumRowY += 5;
  doc.setDrawColor(203, 213, 225);
  doc.line(summaryBoxX + 3, sumRowY - 1, rightX - 3, sumRowY - 1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105);
  doc.text("Gross Inward Value:", summaryBoxX + 4, sumRowY + 3.5);
  doc.text(`₹${totalAmount.toLocaleString("en-IN")}`, rightX - 4, sumRowY + 3.5, { align: "right" });

  sumRowY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(16, 185, 129);
  doc.text("Paid Outflow (Day 1 / Advance):", summaryBoxX + 4, sumRowY + 2);
  doc.text(`₹${paidAmount.toLocaleString("en-IN")}`, rightX - 4, sumRowY + 2, { align: "right" });

  sumRowY += 6.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  if (balanceDue > 0) {
    doc.setTextColor(239, 68, 68); // Red
    doc.text("Outstanding Balance Due:", summaryBoxX + 4, sumRowY + 2);
    doc.text(`₹${balanceDue.toLocaleString("en-IN")}`, rightX - 4, sumRowY + 2, { align: "right" });
  } else {
    doc.setTextColor(16, 185, 129); // Green
    doc.text("Balance Due:", summaryBoxX + 4, sumRowY + 2);
    doc.text("₹0 (Fully Cleared)", rightX - 4, sumRowY + 2, { align: "right" });
  }

  // 8. AMOUNT IN WORDS
  currentY = Math.max(summaryBoxY + 38, leftY + 38) + 3;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 9, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Total Value in Words:", margin + 3.5, currentY + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(numberToWordsINR(totalAmount), margin + 35, currentY + 5.5, { maxWidth: contentWidth - 40 });

  currentY += 12;

  // 9. BANK DETAILS & TERMS (Bottom Section)
  const bottomW = (contentWidth - 6) / 2;
  const bottomH = 24;

  // Bank Details (Left)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, bottomW, bottomH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text("BANK ACCOUNT FOR RTGS / NEFT REMITTANCE:", margin + 3.5, currentY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  if (companyInfo.bankName || companyInfo.accountNumber) {
    doc.text(`Bank Name: ${companyInfo.bankName || "—"}`, margin + 3.5, currentY + 9);
    doc.text(`Account Name: ${companyInfo.accountName || companyInfo.name || "—"}`, margin + 3.5, currentY + 13);
    doc.text(`Account No: ${companyInfo.accountNumber || "—"}  |  IFSC: ${companyInfo.ifscCode || "—"}`, margin + 3.5, currentY + 17);
    doc.text(`Branch: ${companyInfo.bankBranch || "—"}`, margin + 3.5, currentY + 21);
  } else {
    doc.text("Payment Mode: Commercial RTGS / NEFT Remittance", margin + 3.5, currentY + 9);
    doc.text(`Beneficiary: ${companyInfo.name || "Laxmi Enterprises"}`, margin + 3.5, currentY + 13);
    doc.text("Remittance details as per agreed vendor contract.", margin + 3.5, currentY + 17);
  }

  // Authorized Signatory Block (Right)
  const signX = margin + bottomW + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(signX, currentY, bottomW, bottomH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${companyInfo.name}`, signX + bottomW / 2, currentY + 5, { align: "center" });

  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.roundedRect(signX + 15, currentY + 7.5, bottomW - 30, 9, 1, 1, "D");
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("[ Digitally Verified • Inward Gate Entry ]", signX + bottomW / 2, currentY + 13.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text("Authorized Inward Procurement Officer", signX + bottomW / 2, currentY + 21, { align: "center" });

  // 10. FOOTER NOTE & BRAND STRIPE
  const footerY = 286;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("This is an electronically generated Inward Purchase Voucher & Payment Receipt from Laxmi Enterprises ERP Portal.", margin, footerY);
  doc.text("Page 1 of 1", rightX, footerY, { align: "right" });

  doc.setFillColor(5, 150, 105); // Emerald accent bottom
  doc.rect(0, 294, pageWidth, 3, "F");

  // Save PDF directly to user's computer
  const cleanId = (purchase.id || "PUR").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${cleanId}_Purchase_Receipt.pdf`;
  try {
    if (typeof window !== "undefined" && window.FlutterDownloadBridge) {
      try {
        const dataUri = doc.output("datauristring");
        window.FlutterDownloadBridge.postMessage(JSON.stringify({
          filename: fileName,
          dataUrl: dataUri
        }));
      } catch(e) {
        console.error("Flutter bridge error:", e);
        if (typeof doc.save === "function") doc.save(fileName);
      }
    } else if (typeof window !== "undefined" && typeof doc.save === "function") {
      doc.save(fileName);
    }
  } catch (saveErr) {
    console.warn("doc.save skipped:", saveErr.message);
  }

  return { fileName, doc };
}

// Alias for receipt download
export const generatePurchaseReceiptPDF = generatePurchaseInvoicePDF;

/**
 * Generate a Comprehensive Financial Performance & P&L Statement PDF
 * Covering Sales, Purchases (COGS), Operating Expenses, Gross Profit, and Profit After Expense
 * for any chosen timeline (Monthly, Quarterly, or Yearly).
 *
 * @param {Object} options
 * @param {"monthly"|"quarterly"|"yearly"} [options.timelineType="monthly"]
 * @param {string} options.periodLabel - Display label (e.g. "November 2026", "Q3 FY 2026-27", "FY 2026-27")
 * @param {string} options.startDate - "YYYY-MM-DD"
 * @param {string} options.endDate - "YYYY-MM-DD"
 * @param {Array} options.invoices - Invoices dataset
 * @param {Array} options.purchases - Purchases dataset
 * @param {Array} options.expenses - Operating expenses dataset
 * @param {Object} options.company - Company profile from database
 * @returns {Object} { fileName, doc }
 */
export function generateFinancialReportPDF({
  timelineType = "monthly",
  periodLabel = "",
  startDate = "",
  endDate = "",
  invoices = [],
  purchases = [],
  expenses = [],
  company = {},
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Safe text wrapper to prevent any "Invalid arguments passed to jsPDF.text"
  const _origText = doc.text.bind(doc);
  doc.text = function (text, x, y, options, transform) {
    if (text === null || text === undefined) text = "";
    else if (typeof text !== "string" && !Array.isArray(text)) text = String(text);
    return _origText(text, x, y, options, transform);
  };

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  const rightX = pageWidth - margin;

  // Real company profile info strictly from database
  const companyInfo = {
    name: company.name || "Laxmi Enterprises",
    tagline: company.tagline || "",
    gstin: company.gstin || "",
    pan: company.pan || "",
    phone: company.phone || "",
    email: company.email || "",
    address: company.address || "",
  };

  // 1. Filter Records for Specified Timeline [startDate, endDate]
  const periodInvoices = (invoices || []).filter((inv) => {
    if (inv.isCancelled) return false;
    const d = inv.invoiceDate || inv.date || (inv.createdAt ? String(inv.createdAt).slice(0, 10) : "");
    return d && (!startDate || d >= startDate) && (!endDate || d <= endDate);
  });

  const periodPurchases = (purchases || []).filter((p) => {
    if (p.isCancelled || p.status === "Cancelled") return false;
    const d = p.purchaseDate || p.date || (p.createdAt ? String(p.createdAt).slice(0, 10) : "");
    return d && (!startDate || d >= startDate) && (!endDate || d <= endDate);
  });

  const periodExpenses = (expenses || []).filter((e) => {
    if (e.isCancelled) return false;
    const d = e.expenseDate || e.date || (e.createdAt ? String(e.createdAt).slice(0, 10) : "");
    return d && (!startDate || d >= startDate) && (!endDate || d <= endDate);
  });

  // 2. Financial Aggregations
  const taxableSales = periodInvoices.reduce((s, inv) => s + Number(inv.taxableTotal ?? inv.amount ?? 0), 0);
  const gstCollected = periodInvoices.reduce((s, inv) => s + Number(inv.gstTotal ?? inv.tax ?? 0), 0);
  const grandSales = periodInvoices.reduce((s, inv) => s + Number(inv.grandTotal ?? inv.total ?? (Number(inv.taxableTotal ?? inv.amount ?? 0) + Number(inv.gstTotal ?? inv.tax ?? 0))), 0);
  const salesCount = periodInvoices.length;

  const taxablePurchases = periodPurchases.reduce((s, p) => s + Number(p.taxableTotal ?? p.subtotal ?? p.amount ?? 0), 0);
  const gstPurchases = periodPurchases.reduce((s, p) => s + Number(p.gstTotal ?? p.tax ?? 0), 0);
  const grandPurchases = periodPurchases.reduce((s, p) => s + Number(p.grandTotal ?? p.total ?? (Number(p.taxableTotal ?? p.subtotal ?? 0) + Number(p.gstTotal ?? p.tax ?? 0))), 0);
  const purchasesCount = periodPurchases.length;

  const totalExpenses = periodExpenses.reduce((s, e) => s + Number(e.amount ?? 0), 0);
  const expensesCount = periodExpenses.length;

  // Profit & Loss Key Performance Indicators
  const grossProfit = taxableSales - taxablePurchases;
  const grossMarginPct = taxableSales > 0 ? (grossProfit / taxableSales) * 100 : 0;
  const profitAfterExpense = grossProfit - totalExpenses;
  const netMarginPct = taxableSales > 0 ? (profitAfterExpense / taxableSales) * 100 : 0;
  const netGstLiability = gstCollected - gstPurchases;

  // 3. TOP BRAND HEADER ACCENT BAR (Royal Sapphire & Cyan)
  doc.setFillColor(0, 91, 181); // #005bb5
  doc.rect(0, 0, pageWidth, 8, "F");
  doc.setFillColor(0, 180, 216); // #00b4d8
  doc.rect(0, 8, pageWidth, 1.5, "F");

  // 4. BRANDING & HEADER SECTION
  const logoImg = company.logo || companyInfo.logo || LAXMI_LOGO_BASE64;
  let textStartX = margin;
  if (logoImg) {
    try {
      doc.addImage(logoImg, "PNG", margin, 12, 18, 18);
      textStartX = margin + 22;
    } catch (e) {
      textStartX = margin;
    }
  }

  let currentY = 17;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 43, 92);
  doc.text(companyInfo.name, textStartX, currentY);

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(companyInfo.tagline, textStartX, currentY);

  currentY += 4;
  doc.setFontSize(7.5);
  doc.text(companyInfo.address, textStartX, currentY, { maxWidth: 95 });

  currentY += 6.5;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`GSTIN: ${companyInfo.gstin || "N/A"}  |  PAN: ${companyInfo.pan || "N/A"}`, textStartX, currentY);

  currentY += 4;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${companyInfo.phone || "N/A"}  |  Email: ${companyInfo.email || "N/A"}`, textStartX, currentY);

  // Right Header Badge: REPORT TITLE & PERIOD
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 91, 181);
  doc.text("FINANCIAL STATEMENT & P&L", rightX, 16, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const typeLabel = timelineType === "monthly" ? "MONTHLY REPORT" : timelineType === "quarterly" ? "QUARTERLY REPORT" : "ANNUAL FISCAL REPORT";
  doc.text(typeLabel, rightX, 21.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Timeline: ${periodLabel}`, rightX, 26, { align: "right" });
  if (startDate && endDate) {
    doc.text(`Period: ${startDate} to ${endDate}`, rightX, 30.5, { align: "right" });
  }

  const generatedDateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${generatedDateStr} IST`, rightX, 35, { align: "right" });

  // Divider Line
  currentY = 40;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, rightX, currentY);
  currentY += 4;

  // 5. EXECUTIVE FINANCIAL KPI CARDS (4-Column Snapshot)
  const cardWidth = (contentWidth - 9) / 4; // 4 cards with 3mm gaps
  const cardHeight = 22;

  const kpis = [
    {
      title: "Gross Sales Turnover",
      val: `Rs. ${taxableSales.toLocaleString("en-IN")}`,
      sub: `Grand: Rs. ${grandSales.toLocaleString("en-IN")} (${salesCount} Invs)`,
      bg: [239, 246, 255],
      border: [191, 219, 254],
      textCol: [0, 91, 181]
    },
    {
      title: "Procurement / COGS",
      val: `Rs. ${taxablePurchases.toLocaleString("en-IN")}`,
      sub: `Grand: Rs. ${grandPurchases.toLocaleString("en-IN")} (${purchasesCount} POs)`,
      bg: [240, 253, 244],
      border: [187, 247, 208],
      textCol: [22, 101, 52]
    },
    {
      title: "Operating Expenses",
      val: `Rs. ${totalExpenses.toLocaleString("en-IN")}`,
      sub: `${expensesCount} expense records`,
      bg: [254, 242, 242],
      border: [254, 202, 202],
      textCol: [185, 28, 28]
    },
    {
      title: "Profit After Expense",
      val: `Rs. ${profitAfterExpense.toLocaleString("en-IN")}`,
      sub: `Net Margin: ${netMarginPct.toFixed(1)}% | GP: ${grossMarginPct.toFixed(1)}%`,
      bg: profitAfterExpense >= 0 ? [240, 253, 250] : [255, 241, 242],
      border: profitAfterExpense >= 0 ? [153, 246, 228] : [254, 205, 211],
      textCol: profitAfterExpense >= 0 ? [15, 118, 110] : [190, 18, 60]
    }
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(kpi.border[0], kpi.border[1], kpi.border[2]);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.title, cardX + 2.5, currentY + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(kpi.textCol[0], kpi.textCol[1], kpi.textCol[2]);
    doc.text(kpi.val, cardX + 2.5, currentY + 11.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.sub, cardX + 2.5, currentY + 17.5, { maxWidth: cardWidth - 5 });
  });

  currentY += cardHeight + 6;

  // 6. EXECUTIVE PROFIT & LOSS RECONCILIATION STATEMENT TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 43, 92);
  doc.text("1. Executive Profit & Loss (P&L) Statement", margin, currentY);
  currentY += 2;

  const plRows = [
    [
      "Gross Outward Turnover",
      "Total taxable billing generated across all sales invoices",
      `Rs. ${taxableSales.toLocaleString("en-IN")}`,
      "100.0% of Revenue"
    ],
    [
      "Cost of Goods Sold (Purchases)",
      "Direct inward material procurement and inventory costs",
      `(-) Rs. ${taxablePurchases.toLocaleString("en-IN")}`,
      `${taxableSales > 0 ? ((taxablePurchases / taxableSales) * 100).toFixed(1) : 0}% COGS Ratio`
    ],
    [
      "GROSS COMMERCIAL PROFIT",
      "Commercial trading surplus before operational overheads",
      `Rs. ${grossProfit.toLocaleString("en-IN")}`,
      `${grossMarginPct.toFixed(1)}% Gross Margin`
    ],
    [
      "Operating Expenses",
      "Rent, salaries, power, logistics, administration & maintenance",
      `(-) Rs. ${totalExpenses.toLocaleString("en-IN")}`,
      `${taxableSales > 0 ? ((totalExpenses / taxableSales) * 100).toFixed(1) : 0}% Expense Ratio`
    ],
    [
      "PROFIT AFTER EXPENSE (NET)",
      "Bottom-line commercial earnings realized for the selected timeline",
      `Rs. ${profitAfterExpense.toLocaleString("en-IN")}`,
      `${netMarginPct.toFixed(1)}% Net Margin`
    ],
    [
      "GST Output Tax Collected",
      "Total CGST + SGST collected on sales invoices (Liability)",
      `Rs. ${gstCollected.toLocaleString("en-IN")}`,
      "Output Liability"
    ],
    [
      "GST Input Tax Credit (ITC)",
      "Total CGST + SGST paid on purchases/procurement (Credit)",
      `Rs. ${gstPurchases.toLocaleString("en-IN")}`,
      "Eligible ITC"
    ],
    [
      "Net GST Balance Payable / (Credit)",
      "Output GST collected minus Input Tax Credit eligible",
      netGstLiability >= 0 ? `Rs. ${netGstLiability.toLocaleString("en-IN")}` : `Rs. 0 (ITC Surplus: Rs. ${Math.abs(netGstLiability).toLocaleString("en-IN")})`,
      netGstLiability >= 0 ? "Tax Liability" : "ITC Carryforward"
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Financial Flow & Line Item", "Description & Commercial Scope", "Amount (INR)", "Margin / Indicator"]],
    body: plRows,
    theme: "striped",
    headStyles: {
      fillColor: [0, 91, 181],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 2.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 48, fontStyle: "bold" },
      1: { cellWidth: 72, textColor: [71, 85, 105] },
      2: { cellWidth: 34, halign: "right", fontStyle: "bold" },
      3: { cellWidth: 28, halign: "center", fontStyle: "bold", textColor: [0, 91, 181] }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      // Highlight Key Profit Rows
      if (data.row.index === 2) {
        data.cell.styles.fillColor = [240, 253, 244];
        data.cell.styles.textColor = [22, 101, 52];
      }
      if (data.row.index === 4) {
        data.cell.styles.fillColor = profitAfterExpense >= 0 ? [236, 253, 245] : [254, 242, 242];
        data.cell.styles.textColor = profitAfterExpense >= 0 ? [6, 95, 70] : [185, 28, 28];
        data.cell.styles.fontStyle = "bold";
      }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 7. SECTION 2: SALES INVOICES REGISTER
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 43, 92);
  doc.text(`2. Sales & Revenue Register (${salesCount} Invoices Recorded)`, margin, currentY);
  currentY += 2;

  const invoiceTableRows = periodInvoices.length > 0
    ? periodInvoices.map((inv, idx) => [
        idx + 1,
        inv.invoiceNumber || inv.id || "N/A",
        inv.invoiceDate || inv.date || "-",
        (inv.clientName || "").slice(0, 24),
        inv.category || "General",
        inv.paymentMethod || inv.paymentMode || "Bank",
        `Rs. ${Number(inv.taxableTotal ?? inv.amount ?? 0).toLocaleString("en-IN")}`,
        `Rs. ${Number(inv.gstTotal ?? inv.tax ?? 0).toLocaleString("en-IN")}`,
        `Rs. ${Number(inv.grandTotal ?? inv.total ?? 0).toLocaleString("en-IN")}`,
        inv.status || "Paid"
      ])
    : [["-", "No sales invoices recorded for this period.", "-", "-", "-", "-", "Rs. 0", "Rs. 0", "Rs. 0", "-"]];

  // Append Total Row if records exist
  if (periodInvoices.length > 0) {
    invoiceTableRows.push([
      "",
      "TOTAL SALES",
      "",
      "",
      "",
      "",
      `Rs. ${taxableSales.toLocaleString("en-IN")}`,
      `Rs. ${gstCollected.toLocaleString("en-IN")}`,
      `Rs. ${grandSales.toLocaleString("en-IN")}`,
      ""
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["#", "Invoice #", "Date", "Client Name", "Category", "Payment", "Taxable (INR)", "GST (INR)", "Total (INR)", "Status"]],
    body: invoiceTableRows,
    theme: "striped",
    headStyles: {
      fillColor: [14, 116, 144], // Cyan navy #0e7490
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: 2
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 25, fontStyle: "bold" },
      2: { cellWidth: 17 },
      3: { cellWidth: 31 },
      4: { cellWidth: 17 },
      5: { cellWidth: 15 },
      6: { cellWidth: 20, halign: "right" },
      7: { cellWidth: 16, halign: "right" },
      8: { cellWidth: 22, halign: "right", fontStyle: "bold" },
      9: { cellWidth: 12, halign: "center" }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didParseCell: (data) => {
      // Highlight Total Row
      if (periodInvoices.length > 0 && data.row.index === invoiceTableRows.length - 1) {
        data.cell.styles.fillColor = [224, 242, 254];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [3, 105, 161];
      }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 8. SECTION 3: PURCHASES & PROCUREMENT REGISTER
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 43, 92);
  doc.text(`3. Procurement & Purchase Register (${purchasesCount} Vouchers Recorded)`, margin, currentY);
  currentY += 2;

  const purchaseTableRows = periodPurchases.length > 0
    ? periodPurchases.map((p, idx) => [
        idx + 1,
        p.purchaseId || p.billNumber || p.id || "N/A",
        p.purchaseDate || p.date || "-",
        (p.vendorName || p.supplierName || "").slice(0, 24),
        p.category || "General",
        p.paymentMethod || p.paymentMode || "Bank",
        `Rs. ${Number(p.taxableTotal ?? p.subtotal ?? p.amount ?? 0).toLocaleString("en-IN")}`,
        `Rs. ${Number(p.gstTotal ?? p.tax ?? 0).toLocaleString("en-IN")}`,
        `Rs. ${Number(p.grandTotal ?? p.total ?? 0).toLocaleString("en-IN")}`,
        p.status || "Received"
      ])
    : [["-", "No purchase vouchers recorded for this period.", "-", "-", "-", "-", "Rs. 0", "Rs. 0", "Rs. 0", "-"]];

  if (periodPurchases.length > 0) {
    purchaseTableRows.push([
      "",
      "TOTAL PURCHASES",
      "",
      "",
      "",
      "",
      `Rs. ${taxablePurchases.toLocaleString("en-IN")}`,
      `Rs. ${gstPurchases.toLocaleString("en-IN")}`,
      `Rs. ${grandPurchases.toLocaleString("en-IN")}`,
      ""
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["#", "Purchase / Bill #", "Date", "Vendor Name", "Category", "Payment", "Taxable (INR)", "GST (INR)", "Total (INR)", "Status"]],
    body: purchaseTableRows,
    theme: "striped",
    headStyles: {
      fillColor: [5, 150, 105], // Emerald green #059669
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: 2
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 25, fontStyle: "bold" },
      2: { cellWidth: 17 },
      3: { cellWidth: 31 },
      4: { cellWidth: 17 },
      5: { cellWidth: 15 },
      6: { cellWidth: 20, halign: "right" },
      7: { cellWidth: 16, halign: "right" },
      8: { cellWidth: 22, halign: "right", fontStyle: "bold" },
      9: { cellWidth: 12, halign: "center" }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didParseCell: (data) => {
      if (periodPurchases.length > 0 && data.row.index === purchaseTableRows.length - 1) {
        data.cell.styles.fillColor = [209, 250, 229];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [4, 120, 87];
      }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 9. SECTION 4: OPERATING EXPENSES REGISTER
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 43, 92);
  doc.text(`4. Operational Expenses Register (${expensesCount} Entries Recorded)`, margin, currentY);
  currentY += 2;

  const expenseTableRows = periodExpenses.length > 0
    ? periodExpenses.map((exp, idx) => [
        idx + 1,
        exp.expenseNumber || exp.id || "-",
        exp.expenseDate || exp.date || "-",
        exp.category || "General Operating",
        (exp.description || exp.notes || "").slice(0, 36),
        exp.paymentMode || exp.paymentMethod || "Bank",
        `Rs. ${Number(exp.amount || 0).toLocaleString("en-IN")}`
      ])
    : [["-", "-", "No expenses recorded for this period.", "-", "-", "-", "Rs. 0"]];

  if (periodExpenses.length > 0) {
    expenseTableRows.push([
      "",
      "",
      "TOTAL OPERATING EXPENSES",
      "",
      "",
      "",
      `Rs. ${totalExpenses.toLocaleString("en-IN")}`
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["#", "Expense #", "Date", "Category Head", "Description / Narration", "Payment Mode", "Amount (INR)"]],
    body: expenseTableRows,
    theme: "striped",
    headStyles: {
      fillColor: [225, 29, 72], // Rose #e11d48
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: 2
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 26, fontStyle: "bold" },
      2: { cellWidth: 18 },
      3: { cellWidth: 32 },
      4: { cellWidth: 50 },
      5: { cellWidth: 20 },
      6: { cellWidth: 28, halign: "right", fontStyle: "bold" }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didParseCell: (data) => {
      if (periodExpenses.length > 0 && data.row.index === expenseTableRows.length - 1) {
        data.cell.styles.fillColor = [255, 228, 230];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [190, 18, 60];
      }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 10. SIGNATORY & CERTIFICATION BLOCK
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  const signBoxY = currentY + 4;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, signBoxY, contentWidth, 24, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Certification & Auditor Declaration:", margin + 4, signBoxY + 5.5);
  doc.text(
    "This financial performance report is automatically compiled from live GST invoices, vendor procurements, and operational expense ledgers recorded in Laxmi Enterprises ERP.",
    margin + 4,
    signBoxY + 10,
    { maxWidth: 110 }
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 43, 92);
  doc.text(`For ${companyInfo.name}`, rightX - 4, signBoxY + 5.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Signatory / Financial Controller", rightX - 4, signBoxY + 20, { align: "right" });

  // 11. MULTI-PAGE RUNNING FOOTERS & ACCENT BARS
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Bottom running line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, 287, rightX, 287);

    // Footer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Laxmi Enterprises Cloud ERP • Financial Statement (${periodLabel})`, margin, 291);
    doc.text(`Page ${i} of ${totalPages}`, rightX, 291, { align: "right" });

    // Bottom Accent Bar
    doc.setFillColor(0, 91, 181);
    doc.rect(0, 294, pageWidth, 3, "F");
  }

  // 12. SAVE & DOWNLOAD PDF
  const cleanLabel = (periodLabel || timelineType).replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Financial_Report_${cleanLabel}.pdf`;

  try {
    if (typeof window !== "undefined" && window.FlutterDownloadBridge) {
      try {
        const dataUri = doc.output("datauristring");
        window.FlutterDownloadBridge.postMessage(
          JSON.stringify({
            filename: fileName,
            dataUrl: dataUri,
          })
        );
        return { fileName, doc };
      } catch (e) {
        console.error("Flutter bridge error:", e);
      }
    }

    if (typeof window !== "undefined") {
      try {
        // Universal direct download trigger via Blob URL
        const blob = doc.output("blob");
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      } catch (blobErr) {
        if (typeof doc.save === "function") {
          doc.save(fileName);
        }
      }
    }
  } catch (saveErr) {
    console.warn("PDF download skipped:", saveErr.message);
  }

  return { fileName, doc };
}

