import * as XLSX from "xlsx";

/**
 * Reusable helper to format column widths based on cell content
 */
function autoFitColumns(data, headers) {
  const colWidths = headers.map(h => ({ wch: Math.max(h.length + 4, 12) }));
  data.forEach(row => {
    headers.forEach((h, i) => {
      const val = row[h] != null ? String(row[h]) : "";
      if (val.length + 3 > colWidths[i].wch) {
        colWidths[i].wch = Math.min(val.length + 4, 45);
      }
    });
  });
  return colWidths;
}

/**
 * Export data array to an Excel (.xlsx) file and trigger instant browser download
 */
export function exportToExcel(data, fileName = "export.xlsx", sheetName = "Sheet1") {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths if data has rows
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    ws["!cols"] = autoFitColumns(data, headers);
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

/**
 * Generate binary array/blob of a workbook for cloud upload (Google Drive)
 */
export function generateWorkbookBlob(wb) {
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}

/**
 * Export Clients List to Excel
 */
export function exportClientsToExcel(clients, returnBlob = false) {
  const formatted = clients.map((c, idx) => ({
    "Sr. No.": idx + 1,
    "Client ID": c.id,
    "Client Category / Type": c.clientType || "General",
    "Client Name": c.name,
    "Village (गाव)": c.village || "-",
    "Taluka (तालुका)": c.taluka || "-",
    "District (जिल्हा)": c.district || "-",
    "Contact Number": c.contact,
    "Email Address": c.email || "-",
    "Date of Birth (DOB)": c.dob || "-",
    "Animal Feed - Product Types": c.productTypes || "-",
    "Animal Feed - Companies": c.companies || "-",
    "Animal Feed - Brands": c.brands || "-",
    "Animal Feed - Animals Serviced": c.clientType === "Animal Feed Shop" ? (c.numberOfAnimals || "-") : "-",
    "Dairy - Number of Suppliers": c.numberOfSuppliers || "-",
    "Dairy - Milk Quantity": c.milkQuantity || "-",
    "Farmers - Number of Animals": c.clientType === "Farmers" ? (c.numberOfAnimals || "-") : "-",
    "Farmers - Animal Details": c.animalDetails || "-",
    "City / Location": c.city || (c.district ? `${c.taluka ? c.taluka + ", " : ""}${c.district}` : "-"),
    "Account Tier": c.tier || "Standard",
    "Payment Terms": c.paymentTerms || "Net 30",
    "Total Orders": c.orders,
    "Total Revenue (₹)": c.revenue,
    "Outstanding Dues (₹)": c.outstanding || 0,
    "Account Status": c.status
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(formatted);
  ws["!cols"] = autoFitColumns(formatted, Object.keys(formatted[0] || {}));
  XLSX.utils.book_append_sheet(wb, ws, "Clients Directory");

  const fileName = `Laxmi_Enterprises_Clients_${new Date().toISOString().slice(0, 10)}.xlsx`;
  if (returnBlob) {
    return { blob: generateWorkbookBlob(wb), fileName };
  }
  XLSX.writeFile(wb, fileName);
}

/**
 * Export Products List to Excel
 */
export function exportProductsToExcel(products, returnBlob = false) {
  const formatted = products.map((p, idx) => ({
    "Sr. No.": idx + 1,
    "Product ID": p.id,
    "Product Name": p.name,
    "Category": p.category,
    "Unit Price (₹)": p.price,
    "Available Stock": p.stock,
    "Min Safety Threshold": p.minStock,
    "Stock Status": p.stock <= p.minStock ? "LOW STOCK" : "OPTIMAL"
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(formatted);
  ws["!cols"] = autoFitColumns(formatted, Object.keys(formatted[0] || {}));
  XLSX.utils.book_append_sheet(wb, ws, "Product Catalogue");

  const fileName = `Laxmi_Enterprises_Products_${new Date().toISOString().slice(0, 10)}.xlsx`;
  if (returnBlob) {
    return { blob: generateWorkbookBlob(wb), fileName };
  }
  XLSX.writeFile(wb, fileName);
}

/**
 * Export Inventory to Excel
 */
export function exportInventoryToExcel(inventory, returnBlob = false) {
  const formatted = inventory.map((item, idx) => ({
    "Sr. No.": idx + 1,
    "Logistics ID": item.id,
    "Product Name": item.product,
    "SKU Code": item.sku,
    "Inward Receipts (Units)": item.in,
    "Outward Dispatches (Units)": item.out,
    "Current Balance Stock": item.stock,
    "Status": item.status,
    "Warehouse Bay / Location": item.location
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(formatted);
  ws["!cols"] = autoFitColumns(formatted, Object.keys(formatted[0] || {}));
  XLSX.utils.book_append_sheet(wb, ws, "Warehouse Inventory");

  const fileName = `Laxmi_Enterprises_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`;
  if (returnBlob) {
    return { blob: generateWorkbookBlob(wb), fileName };
  }
  XLSX.writeFile(wb, fileName);
}

/**
 * Export Financial & Revenue Report to Excel
 */
export function exportRevenueToExcel(revenueData, clients, returnBlob = false, invoices = []) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Monthly Inflow
  const monthlyRows = revenueData.map((r, i) => ({
    "Month": r.month,
    "Gross Revenue (₹)": r.revenue,
    "Period": `FY 2026 - M${i + 1}`
  }));
  const wsMonthly = XLSX.utils.json_to_sheet(monthlyRows);
  wsMonthly["!cols"] = autoFitColumns(monthlyRows, ["Month", "Gross Revenue (₹)", "Period"]);
  XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Inflow");

  // Sheet 2: Commercial Invoices Ledger
  if (invoices && invoices.length > 0) {
    const invRows = invoices.map((inv, i) => ({
      "Sr. No.": i + 1,
      "Invoice ID": inv.id,
      "Client Name": inv.clientName,
      "Invoice Date": inv.date,
      "Due Date": inv.dueDate,
      "Taxable Value (₹)": inv.amount,
      "GST Tax (₹)": inv.tax,
      "Total Amount (₹)": inv.total,
      "Status": inv.status,
      "Payment Mode": inv.paymentMethod || "NEFT / RTGS",
      "Category": inv.category || "Hardware"
    }));
    const wsInv = XLSX.utils.json_to_sheet(invRows);
    wsInv["!cols"] = autoFitColumns(invRows, Object.keys(invRows[0] || {}));
    XLSX.utils.book_append_sheet(wb, wsInv, "Commercial Invoices");
  }

  // Sheet 3: Client Commercial Contribution
  const clientRevenue = [...clients]
    .sort((a, b) => b.revenue - a.revenue)
    .map((c, i) => ({
      "Rank": i + 1,
      "Client ID": c.id,
      "Client Name": c.name,
      "City": c.city,
      "Orders": c.orders,
      "Total Billing (₹)": c.revenue,
      "Outstanding (₹)": c.outstanding || 0,
      "Billing Share": `${((c.revenue / (clients.reduce((s, x) => s + x.revenue, 0) || 1)) * 100).toFixed(1)}%`
    }));
  const wsClients = XLSX.utils.json_to_sheet(clientRevenue);
  wsClients["!cols"] = autoFitColumns(clientRevenue, Object.keys(clientRevenue[0] || {}));
  XLSX.utils.book_append_sheet(wb, wsClients, "Client Billing Contribution");

  const fileName = `Laxmi_Enterprises_Revenue_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  if (returnBlob) {
    return { blob: generateWorkbookBlob(wb), fileName };
  }
  XLSX.writeFile(wb, fileName);
}

/**
 * Export Invoices Ledger to Excel (.xlsx)
 */
export function exportInvoicesToExcel(invoices = [], returnBlob = false) {
  const formatted = invoices.map((inv, idx) => {
    const amount = Number(inv.amount) || 0;
    const tax = Number(inv.tax) || Math.round(amount * 0.18);
    const total = Number(inv.total) || (amount + tax);
    const cgst = Math.round(tax / 2);
    const sgst = tax - cgst;

    return {
      "Sr. No.": idx + 1,
      "Invoice ID": inv.id,
      "Client Name": inv.clientName,
      "Client Account ID": inv.clientId || "-",
      "Invoice Date": inv.date,
      "Due Date": inv.dueDate,
      "Product Category": inv.category || "Hardware",
      "Payment Mode": inv.paymentMethod || "NEFT / RTGS",
      "Taxable Value (₹)": amount,
      "CGST @ 9% (₹)": cgst,
      "SGST @ 9% (₹)": sgst,
      "Total GST Tax (₹)": tax,
      "Grand Total (₹)": total,
      "Settlement Status": inv.status
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(formatted);
  ws["!cols"] = autoFitColumns(formatted, Object.keys(formatted[0] || {}));
  XLSX.utils.book_append_sheet(wb, ws, "Tax Invoices Ledger");

  // Also include a quick Commercial Summary Sheet
  const totalTaxable = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalTax = invoices.reduce((s, i) => s + (Number(i.tax) || 0), 0);
  const grandTotal = invoices.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const paidTotal = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + (Number(i.total) || 0), 0);
  const pendingTotal = invoices.filter(i => i.status !== "Paid").reduce((s, i) => s + (Number(i.total) || 0), 0);

  const summaryData = [
    { "Commercial Metric": "Total Invoices Issued", "Value": invoices.length },
    { "Commercial Metric": "Total Taxable Value (₹)", "Value": totalTaxable },
    { "Commercial Metric": "Total GST Collected (₹)", "Value": totalTax },
    { "Commercial Metric": "Gross Invoice Value (₹)", "Value": grandTotal },
    { "Commercial Metric": "Realized / Paid Amount (₹)", "Value": paidTotal },
    { "Commercial Metric": "Pending Receivables (₹)", "Value": pendingTotal },
    { "Commercial Metric": "Generated On", "Value": new Date().toLocaleString("en-IN") }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ledger Summary");

  const fileName = `Laxmi_Enterprises_Invoices_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`;
  if (returnBlob) {
    return { blob: generateWorkbookBlob(wb), fileName };
  }
  XLSX.writeFile(wb, fileName);
  return { fileName };
}

/**
 * Export a Single Invoice as an Itemized Commercial Tax Invoice in Excel (.xlsx)
 */
export function exportSingleInvoiceToExcel(invoice, company = {}, returnBlob = false) {
  const wb = XLSX.utils.book_new();

  const amount = Number(invoice.amount) || 0;
  const tax = Number(invoice.tax) || Math.round(amount * 0.18);
  const total = Number(invoice.total) || (amount + tax);
  const cgst = Math.round(tax / 2);
  const sgst = tax - cgst;

  const invoiceSheetData = [
    { "TAX INVOICE": "LAXMI ENTERPRISES", "DETAILS": "INDUSTRIAL SUPPLIES & HARDWARE" },
    { "TAX INVOICE": "GSTIN", "DETAILS": company.gstin || "27AAACL1234F1Z5" },
    { "TAX INVOICE": "PAN Number", "DETAILS": company.pan || "AAACL1234F" },
    { "TAX INVOICE": "Registered Address", "DETAILS": company.address || "Shop No. 12, Industrial Estate, Pune, Maharashtra" },
    { "TAX INVOICE": "Contact Phone / Email", "DETAILS": `${company.phone || '+91 98765 43210'} | ${company.email || 'contact@laxmienterprises.com'}` },
    { "TAX INVOICE": "---", "DETAILS": "----------------------------------------" },
    { "TAX INVOICE": "Invoice Number", "DETAILS": invoice.id },
    { "TAX INVOICE": "Invoice Date", "DETAILS": invoice.date || new Date().toISOString().slice(0, 10) },
    { "TAX INVOICE": "Payment Due Date", "DETAILS": invoice.dueDate || "-" },
    { "TAX INVOICE": "Payment Status", "DETAILS": (invoice.status || "Paid").toUpperCase() },
    { "TAX INVOICE": "Settlement Method", "DETAILS": invoice.paymentMethod || "NEFT / Commercial Transfer" },
    { "TAX INVOICE": "---", "DETAILS": "----------------------------------------" },
    { "TAX INVOICE": "Billed To (Client Name)", "DETAILS": invoice.clientName },
    { "TAX INVOICE": "Client Account ID", "DETAILS": invoice.clientId || "CL-001" },
    { "TAX INVOICE": "Place of Supply", "DETAILS": "Maharashtra (State Code: 27)" },
    { "TAX INVOICE": "---", "DETAILS": "----------------------------------------" },
    { "TAX INVOICE": "Item Particulars", "DETAILS": `${invoice.category || 'Hardware'} - Commercial Supplies Order Lot` },
    { "TAX INVOICE": "HSN / SAC Code", "DETAILS": "8481 / 7318" },
    { "TAX INVOICE": "Quantity / Unit", "DETAILS": "1 Commercial Lot" },
    { "TAX INVOICE": "Taxable Value (₹)", "DETAILS": amount },
    { "TAX INVOICE": "CGST @ 9% (₹)", "DETAILS": cgst },
    { "TAX INVOICE": "SGST @ 9% (₹)", "DETAILS": sgst },
    { "TAX INVOICE": "Total GST (18%) (₹)", "DETAILS": tax },
    { "TAX INVOICE": "GRAND TOTAL (₹)", "DETAILS": total },
    { "TAX INVOICE": "---", "DETAILS": "----------------------------------------" },
    { "TAX INVOICE": "Remittance Bank Name", "DETAILS": "State Bank of India (SBI)" },
    { "TAX INVOICE": "Account Name", "DETAILS": "Laxmi Enterprises Commercial" },
    { "TAX INVOICE": "Bank Account Number", "DETAILS": "398201554902" },
    { "TAX INVOICE": "IFSC Code", "DETAILS": "SBIN0001245" },
    { "TAX INVOICE": "Branch", "DETAILS": "Pune Industrial Estate Branch" }
  ];

  const ws = XLSX.utils.json_to_sheet(invoiceSheetData);
  ws["!cols"] = [{ wch: 28 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws, "Tax Invoice");

  const cleanId = (invoice.id || "INV").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${cleanId}_Laxmi_Enterprises.xlsx`;

  if (returnBlob) {
    return { blob: generateWorkbookBlob(wb), fileName };
  }
  XLSX.writeFile(wb, fileName);
  return { fileName };
}

/**
 * Export Purchases & Inward Procurement Ledger to Excel (.xlsx)
 */
export function exportPurchasesToExcel(purchases = [], returnBlob = false) {
  const formatted = purchases.map((p, idx) => ({
    "Sr. No.": idx + 1,
    "Purchase PO ID": p.id,
    "Bill / Ref Number": p.billNumber || "-",
    "Category / Sector": p.category || "Animal Feed Shop",
    "Supplier / Seller Name": p.vendorName || p.name || "-",
    "Village (गाव)": p.village || "-",
    "Taluka (तालुका)": p.taluka || "-",
    "District (जिल्हा)": p.district || "-",
    "Contact Number": p.contact || "-",
    "Email Address": p.email || "-",
    "Date of Birth (DOB)": p.dob || "-",
    "Animal Feed - Product Types": p.productTypes || "-",
    "Animal Feed - Companies": p.companies || "-",
    "Animal Feed - Brands": p.brands || "-",
    "Animal Feed - Animals Serviced": p.category === "Animal Feed Shop" ? (p.numberOfAnimals || "-") : "-",
    "Animal Feed - Batch Quantity": p.feedQuantity || "-",
    "Dairy - Number of Suppliers": p.numberOfSuppliers || "-",
    "Dairy - Milk Quantity": p.milkQuantity || "-",
    "Dairy - Fat (%)": p.fatPercent != null ? p.fatPercent : "-",
    "Dairy - SNF (%)": p.snfPercent != null ? p.snfPercent : "-",
    "Dairy - Rate / Liter (₹)": p.ratePerLiter != null ? p.ratePerLiter : "-",
    "Farmers - Number of Animals": p.category === "Farmers" ? (p.numberOfAnimals || "-") : "-",
    "Farmers - Animal Details": p.animalDetails || "-",
    "Farmers - Produce / Fodder": p.farmItemsSupplied || "-",
    "Farmers - Quantity": p.farmQuantity || "-",
    "Bill Date": p.date,
    "Payment Due Date": p.dueDate || "-",
    "Item Description": p.itemDescription || "-",
    "Taxable Amount (₹)": p.taxableAmount || 0,
    "GST Rate (%)": p.gstRate != null ? p.gstRate : 5,
    "GST Amount (₹)": p.gstAmount || 0,
    "Total Inward Value (₹)": p.totalAmount || 0,
    "Paid Amount (₹)": p.paidAmount || 0,
    "Balance Due (₹)": (p.totalAmount || 0) - (p.paidAmount || 0),
    "Payment Status": p.paymentStatus || "Paid",
    "Payment Method": p.paymentMethod || "Bank Transfer",
    "Remarks / Warehouse": p.remarks || "-"
  }));

  const wb = XLSX.utils.book_new();

  // Sheet 1: Purchases Records
  const ws = XLSX.utils.json_to_sheet(formatted);
  ws["!cols"] = autoFitColumns(formatted, Object.keys(formatted[0] || {}));
  XLSX.utils.book_append_sheet(wb, ws, "Inward Purchases");

  // Sheet 2: Summary Metrics
  const totalTaxable = purchases.reduce((s, p) => s + (Number(p.taxableAmount) || 0), 0);
  const totalPurchases = purchases.reduce((s, p) => s + (Number(p.totalAmount) || 0), 0);
  const paidTotal = purchases.reduce((s, p) => s + (Number(p.paidAmount) || 0), 0);
  const dueTotal = totalPurchases - paidTotal;
  const feedCount = purchases.filter(p => p.category === "Animal Feed Shop").length;
  const dairyCount = purchases.filter(p => p.category === "Dairy").length;
  const farmerCount = purchases.filter(p => p.category === "Farmers").length;

  const summaryData = [
    { "Procurement Metric": "Total Purchase Orders / Bills", "Value": purchases.length },
    { "Procurement Metric": "Animal Feed Purchases", "Value": feedCount },
    { "Procurement Metric": "Dairy Milk Procurements", "Value": dairyCount },
    { "Procurement Metric": "Farmer Direct Purchases", "Value": farmerCount },
    { "Procurement Metric": "Total Taxable Inward (₹)", "Value": totalTaxable },
    { "Procurement Metric": "Total Gross Purchases (₹)", "Value": totalPurchases },
    { "Procurement Metric": "Settled / Paid to Vendors (₹)", "Value": paidTotal },
    { "Procurement Metric": "Outstanding Vendor Dues (₹)", "Value": dueTotal },
    { "Procurement Metric": "Generated On", "Value": new Date().toLocaleString("en-IN") }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 32 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Procurement Summary");

  const fileName = `Laxmi_Enterprises_Purchases_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`;
  if (returnBlob) {
    return { blob: generateWorkbookBlob(wb), fileName };
  }
  XLSX.writeFile(wb, fileName);
  return { fileName };
}

/**
 * Export Expo Leads & Kisan Mela Visitors to Excel (.xlsx)
 */
export function exportExpoLeadsToExcel(leads = [], returnBlob = false) {
  const formatted = leads.map((l, idx) => ({
    "Sr. No.": idx + 1,
    "Lead ID": l.id,
    "Visitor Full Name": l.name,
    "Village (गाव)": l.village || "-",
    "Mobile Number": l.mobile || "-",
    "Note / Remark": l.remark || "-",
    "Visitor Sector / Category": l.category || "Farmers",
    "Exhibition Event": l.expoName || "-",
    "Taluka (तालुका)": l.taluka || "-",
    "District (जिल्हा)": l.district || "-",
    "Registration Date": l.date || "-",
    "Follow-up Status": l.status || "New Lead",
    "Email Address": l.email || "-"
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(formatted);
  ws["!cols"] = autoFitColumns(formatted, Object.keys(formatted[0] || {}));
  XLSX.utils.book_append_sheet(wb, ws, "Expo Visitors Registry");

  const fileName = `Laxmi_Enterprises_Expo_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
  if (returnBlob) {
    return { blob: generateWorkbookBlob(wb), fileName };
  }
  XLSX.writeFile(wb, fileName);
  return { fileName };
}

/**
 * Create a comprehensive Multi-Sheet Master Excel Workbook
 * Contains: Summary, Clients, Products, Inventory, Revenue, and Company Profile
 */
export function createMasterWorkbook({ clients = [], products = [], inventory = [], revenueData = [], company = {}, credentials = [], purchases = [], expoLeads = [] }) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Company Profile & Executive Summary
  const totalRev = clients.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);
  const totalStock = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const summaryData = [
    { "Metric": "Enterprise Name", "Value": company.name || "Laxmi Enterprises" },
    { "Metric": "Tagline / Business Line", "Value": company.tagline || "Industrial Supplies, Hardware & Trading" },
    { "Metric": "GSTIN", "Value": company.gstin || "27AAACL1234F1Z5" },
    { "Metric": "PAN Number", "Value": company.pan || "AAACL1234F" },
    { "Metric": "Official Contact Phone", "Value": company.phone || "+91 98765 43210" },
    { "Metric": "Official Email", "Value": company.email || "contact@laxmienterprises.com" },
    { "Metric": "Registered Address", "Value": company.address || "Pune, Maharashtra, India" },
    { "Metric": "Report Generated On", "Value": new Date().toLocaleString("en-IN") },
    { "Metric": "---", "Value": "------------------------" },
    { "Metric": "Total Registered Clients", "Value": clients.length },
    { "Metric": "Total Active Products", "Value": products.length },
    { "Metric": "Total Warehouse Inventory Units", "Value": totalStock },
    { "Metric": "Low Stock Alerts", "Value": lowStockCount },
    { "Metric": "Cumulative Client Billing (₹)", "Value": `₹${totalRev.toLocaleString("en-IN")}` }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");

  // Sheet 2: Clients
  if (clients.length > 0) {
    const clientsRows = clients.map((c, i) => ({
      "Sr.": i + 1,
      "ID": c.id,
      "Category": c.clientType || "General",
      "Client Name": c.name,
      "Village": c.village || "-",
      "Taluka": c.taluka || "-",
      "District": c.district || "-",
      "Contact": c.contact,
      "Email": c.email || "-",
      "DOB": c.dob || "-",
      "City": c.city || "-",
      "Orders": c.orders,
      "Revenue (₹)": c.revenue,
      "Status": c.status
    }));
    const wsClients = XLSX.utils.json_to_sheet(clientsRows);
    wsClients["!cols"] = autoFitColumns(clientsRows, Object.keys(clientsRows[0]));
    XLSX.utils.book_append_sheet(wb, wsClients, "Clients");
  }

  // Sheet 3: Products
  if (products.length > 0) {
    const productsRows = products.map((p, i) => ({
      "Sr.": i + 1,
      "Product ID": p.id,
      "Name": p.name,
      "Category": p.category,
      "Unit Price (₹)": p.price,
      "Stock": p.stock,
      "Min Stock Threshold": p.minStock,
      "Health": p.stock <= p.minStock ? "LOW" : "HEALTHY"
    }));
    const wsProducts = XLSX.utils.json_to_sheet(productsRows);
    wsProducts["!cols"] = autoFitColumns(productsRows, Object.keys(productsRows[0]));
    XLSX.utils.book_append_sheet(wb, wsProducts, "Products");
  }

  // Sheet 4: Inventory
  if (inventory.length > 0) {
    const inventoryRows = inventory.map((inv, i) => ({
      "Sr.": i + 1,
      "Inventory ID": inv.id,
      "Product": inv.product,
      "SKU": inv.sku,
      "Inward (In)": inv.in,
      "Outward (Out)": inv.out,
      "Balance Stock": inv.stock,
      "Status": inv.status,
      "Warehouse Location": inv.location
    }));
    const wsInventory = XLSX.utils.json_to_sheet(inventoryRows);
    wsInventory["!cols"] = autoFitColumns(inventoryRows, Object.keys(inventoryRows[0]));
    XLSX.utils.book_append_sheet(wb, wsInventory, "Inventory Logistics");
  }

  // Sheet 5: Revenue
  if (revenueData.length > 0) {
    const revRows = revenueData.map((r, i) => ({
      "Month": r.month,
      "Gross Revenue (₹)": r.revenue
    }));
    const wsRevenue = XLSX.utils.json_to_sheet(revRows);
    wsRevenue["!cols"] = [{ wch: 15 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsRevenue, "Monthly Revenue");
  }

  // Sheet 6: User Credentials Ledger (if credentials provided)
  if (credentials && credentials.length > 0) {
    const credRows = credentials.map((c, i) => ({
      "Sr.": i + 1,
      "Record ID": c.id || `AUTH-${String(i + 1).padStart(3, "0")}`,
      "Username / Email": c.username,
      "Password": c.password,
      "Display Name": c.name || "-",
      "Assigned Role": c.role || "Authorized User",
      "Recorded Timestamp": c.timestamp || "-",
      "Account Status": c.status || "Active / Verified",
      "Login / Auth Method": c.loginMethod || "Portal Login"
    }));
    const wsCreds = XLSX.utils.json_to_sheet(credRows);
    wsCreds["!cols"] = autoFitColumns(credRows, Object.keys(credRows[0]));
    XLSX.utils.book_append_sheet(wb, wsCreds, "User Credentials");
  }

  // Sheet 7: Purchases & Procurement (if purchases provided)
  if (purchases && purchases.length > 0) {
    const purchaseRows = purchases.map((p, i) => ({
      "Sr.": i + 1,
      "PO ID": p.id,
      "Bill No": p.billNumber || "-",
      "Category": p.category,
      "Vendor / Supplier": p.vendorName || p.name,
      "Village": p.village || "-",
      "Taluka": p.taluka || "-",
      "District": p.district || "-",
      "Contact": p.contact,
      "Date": p.date,
      "Taxable (₹)": p.taxableAmount,
      "Total Amount (₹)": p.totalAmount,
      "Status": p.paymentStatus
    }));
    const wsPurchases = XLSX.utils.json_to_sheet(purchaseRows);
    wsPurchases["!cols"] = autoFitColumns(purchaseRows, Object.keys(purchaseRows[0]));
    XLSX.utils.book_append_sheet(wb, wsPurchases, "Purchases & Procurement");
  }

  // Sheet 8: Expo Leads & Visitors (if expoLeads provided)
  if (expoLeads && expoLeads.length > 0) {
    const expoRows = expoLeads.map((l, i) => ({
      "Sr.": i + 1,
      "Lead ID": l.id,
      "Name": l.name,
      "Village": l.village,
      "Mobile": l.mobile,
      "Note / Remark": l.remark,
      "Sector": l.category,
      "Event": l.expoName,
      "Status": l.status
    }));
    const wsExpo = XLSX.utils.json_to_sheet(expoRows);
    wsExpo["!cols"] = autoFitColumns(expoRows, Object.keys(expoRows[0]));
    XLSX.utils.book_append_sheet(wb, wsExpo, "Expo Leads");
  }

  return wb;
}

/**
 * Export Consolidated Master Excel Workbook (.xlsx)
 */
export function exportMasterWorkbookToFile(payload, returnBlob = false) {
  const wb = createMasterWorkbook(payload);
  const fileName = `Laxmi_Enterprises_Master_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`;

  if (returnBlob) {
    return { blob: generateWorkbookBlob(wb), fileName };
  }
  XLSX.writeFile(wb, fileName);
}

/**
 * Export Login Credentials & User Access Ledger to Excel (.xlsx)
 * Stores usernames, passwords, roles, timestamps, and login methods in a structured spreadsheet
 */
export function exportLoginCredentialsToExcel(credentialsList = [], returnBlob = false) {
  const formatted = credentialsList.map((cred, idx) => ({
    "Sr. No.": idx + 1,
    "Record ID": cred.id || `AUTH-${String(idx + 1).padStart(3, "0")}`,
    "Username / Email": cred.username,
    "Password": cred.password,
    "User Display Name": cred.name || (cred.username ? cred.username.split("@")[0] : "User"),
    "Assigned Role": cred.role || "Authorized User",
    "Recorded Timestamp": cred.timestamp || new Date().toLocaleString("en-IN"),
    "Account Status": cred.status || "Active / Verified",
    "Login / Registration Method": cred.loginMethod || "Portal Sign-In",
    "Device / Platform": cred.device || "Browser Client (Web)"
  }));

  const dataToExport = formatted.length > 0 ? formatted : [{
    "Sr. No.": 1,
    "Record ID": "AUTH-001",
    "Username / Email": "admin@laxmienterprises.com",
    "Password": "Admin@123",
    "User Display Name": "Chaitrali Shevtekar",
    "Assigned Role": "Super Administrator",
    "Recorded Timestamp": new Date().toLocaleString("en-IN"),
    "Account Status": "Active / Verified",
    "Login / Registration Method": "Default Admin Account",
    "Device / Platform": "Web Client"
  }];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dataToExport);
  const headers = Object.keys(dataToExport[0] || {});
  if (headers.length > 0) {
    ws["!cols"] = autoFitColumns(dataToExport, headers);
  }
  XLSX.utils.book_append_sheet(wb, ws, "User Credentials Ledger");

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const fileName = `Laxmi_Enterprises_User_Credentials_${dateStr}.xlsx`;

  if (returnBlob) {
    return { blob: generateWorkbookBlob(wb), fileName };
  }
  XLSX.writeFile(wb, fileName);
  return { fileName };
}

/**
 * Generate Sample Excel Template for Clients, Products, Inventory, or Credentials
 */
export function downloadExcelTemplate(type = "clients") {
  const wb = XLSX.utils.book_new();

  if (type === "credentials") {
    const sampleData = [
      {
        "Username / Email": "admin@laxmienterprises.com",
        "Password": "Admin@123",
        "Display Name": "Chaitrali Shevtekar",
        "Assigned Role": "Super Administrator"
      },
      {
        "Username / Email": "rahul.ops@laxmienterprises.com",
        "Password": "Warehouse@2026",
        "Display Name": "Rahul Deshmukh",
        "Assigned Role": "Warehouse & Inventory"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws["!cols"] = autoFitColumns(sampleData, Object.keys(sampleData[0]));
    XLSX.utils.book_append_sheet(wb, ws, "Credentials_Template");
    XLSX.writeFile(wb, "Laxmi_Enterprises_User_Credentials_Template.xlsx");
  } else if (type === "clients") {
    const sampleData = [
      {
        "Client Category / Type": "Animal Feed Shop",
        "Client Name": "Shree Samarth Animal Feed & Agro Traders",
        "Village (गाव)": "Baramati Rural",
        "Taluka (तालुका)": "Baramati",
        "District (जिल्हा)": "Pune",
        "Contact Number": "9822456789",
        "Email Address": "samarth.feed@gmail.com",
        "Date of Birth (DOB)": "1985-06-15",
        "Animal Feed - Product Types": "Cattle Feed, Mineral Mixture, Calcium Supplement, Silage",
        "Animal Feed - Companies": "Godrej Agrovet, Baramati Agro, Amul",
        "Animal Feed - Brands": "Godrej MilkMore, Samruddhi Supreme, Kapila Gold",
        "Animal Feed - Animals Serviced": "550 Cattle Network",
        "Dairy - Number of Suppliers": "",
        "Dairy - Milk Quantity": "",
        "Farmers - Number of Animals": "",
        "Farmers - Animal Details": "",
        "Account Tier": "Platinum",
        "Payment Terms": "Net 30",
        "Total Orders": 36,
        "Total Revenue": 640000,
        "Outstanding Dues": 32000,
        "Account Status": "Active"
      },
      {
        "Client Category / Type": "Dairy",
        "Client Name": "Gokul Dudh Utpadak Sahakari Dairy",
        "Village (गाव)": "Kasaba Bawada",
        "Taluka (तालुका)": "Karveer",
        "District (जिल्हा)": "Kolhapur",
        "Contact Number": "9850123456",
        "Email Address": "gokul.dairy.karveer@gmail.com",
        "Date of Birth (DOB)": "1980-04-20",
        "Animal Feed - Product Types": "",
        "Animal Feed - Companies": "",
        "Animal Feed - Brands": "",
        "Animal Feed - Animals Serviced": "",
        "Dairy - Number of Suppliers": 92,
        "Dairy - Milk Quantity": "4,500 Liters / Day",
        "Farmers - Number of Animals": "",
        "Farmers - Animal Details": "",
        "Account Tier": "Platinum",
        "Payment Terms": "Net 15",
        "Total Orders": 48,
        "Total Revenue": 980000,
        "Outstanding Dues": 25000,
        "Account Status": "Active"
      },
      {
        "Client Category / Type": "Farmers",
        "Client Name": "Tukaram Ramchandra Patil",
        "Village (गाव)": "Malegaon Khurd",
        "Taluka (तालुका)": "Haveli",
        "District (जिल्हा)": "Pune",
        "Contact Number": "9764512390",
        "Email Address": "tukaram.patil.farm@gmail.com",
        "Date of Birth (DOB)": "1982-11-10",
        "Animal Feed - Product Types": "",
        "Animal Feed - Companies": "",
        "Animal Feed - Brands": "",
        "Animal Feed - Animals Serviced": "",
        "Dairy - Number of Suppliers": "",
        "Dairy - Milk Quantity": "",
        "Farmers - Number of Animals": "18",
        "Farmers - Animal Details": "10 HF Crossbreed Cows, 5 Murrah Buffaloes, 3 Heifers",
        "Account Tier": "Gold",
        "Payment Terms": "Immediate",
        "Total Orders": 22,
        "Total Revenue": 380000,
        "Outstanding Dues": 0,
        "Account Status": "Active"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws["!cols"] = autoFitColumns(sampleData, Object.keys(sampleData[0]));
    XLSX.utils.book_append_sheet(wb, ws, "Clients_Template");
    XLSX.writeFile(wb, "Laxmi_Enterprises_Clients_Template.xlsx");
  } else if (type === "products") {
    const sampleData = [
      {
        "Product Name": "Heavy Duty Brass Coupling 2 inch",
        "Category": "Hardware",
        "Unit Price": 1450,
        "Current Stock": 80,
        "Min Stock Threshold": 20
      },
      {
        "Product Name": "Armoured Electrical Cable 4-Core 50m",
        "Category": "Electrical",
        "Unit Price": 3800,
        "Current Stock": 25,
        "Min Stock Threshold": 15
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws["!cols"] = autoFitColumns(sampleData, Object.keys(sampleData[0]));
    XLSX.utils.book_append_sheet(wb, ws, "Products_Template");
    XLSX.writeFile(wb, "Laxmi_Enterprises_Products_Template.xlsx");
  } else if (type === "inventory") {
    const sampleData = [
      {
        "Product Name": "Industrial Pipe Set",
        "SKU Code": "LE-PIPE-99",
        "Inward Receipts": 200,
        "Outward Dispatches": 50,
        "Current Stock": 150,
        "Status": "In Stock",
        "Warehouse Location": "Warehouse A - Bay 05"
      },
      {
        "Product Name": "Copper Cable Coil",
        "SKU Code": "LE-COPR-88",
        "Inward Receipts": 50,
        "Outward Dispatches": 45,
        "Current Stock": 5,
        "Status": "Low Stock",
        "Warehouse Location": "Warehouse B - Shelf 02"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws["!cols"] = autoFitColumns(sampleData, Object.keys(sampleData[0]));
    XLSX.utils.book_append_sheet(wb, ws, "Inventory_Template");
    XLSX.writeFile(wb, "Laxmi_Enterprises_Inventory_Template.xlsx");
  } else if (type === "purchases") {
    const sampleData = [
      {
        "Category / Sector": "Animal Feed Shop",
        "Supplier / Seller Name": "Shree Samarth Animal Feed & Agro Traders",
        "Bill / Ref Number": "BILL-AF-9021",
        "Village (गाव)": "Baramati Rural",
        "Taluka (तालुका)": "Baramati",
        "District (जिल्हा)": "Pune",
        "Contact Number": "9822456789",
        "Email Address": "samarth.feed@gmail.com",
        "Date of Birth (DOB)": "1985-06-15",
        "Animal Feed - Product Types": "Cattle Feed, Mineral Mixture, Calcium Supplement, Maize Silage",
        "Animal Feed - Companies": "Godrej Agrovet, Baramati Agro, Amul, Cargill India",
        "Animal Feed - Brands": "Godrej MilkMore, Samruddhi Supreme, Kapila Gold, Amul Dan",
        "Animal Feed - Animals Serviced": "550+ Local Cattle Network",
        "Animal Feed - Batch Quantity": "350 Bags (50 kg each)",
        "Dairy - Number of Suppliers": "",
        "Dairy - Milk Quantity": "",
        "Dairy - Fat (%)": "",
        "Dairy - SNF (%)": "",
        "Dairy - Rate / Liter (₹)": "",
        "Farmers - Number of Animals": "",
        "Farmers - Animal Details": "",
        "Farmers - Produce / Fodder": "",
        "Farmers - Quantity": "",
        "Bill Date": "2026-04-02",
        "Payment Due Date": "2026-05-02",
        "Item Description": "High-Yield Cattle Feed (MilkMore 50kg bags)",
        "Taxable Amount (₹)": 507500,
        "GST Rate (%)": 5,
        "Total Inward Value (₹)": 532875,
        "Paid Amount (₹)": 532875,
        "Payment Status": "Paid",
        "Payment Method": "RTGS / Bank Transfer"
      },
      {
        "Category / Sector": "Dairy",
        "Supplier / Seller Name": "Gokul Dudh Utpadak Sahakari Dairy",
        "Bill / Ref Number": "BILL-DR-4102",
        "Village (गाव)": "Kasaba Bawada",
        "Taluka (तालुका)": "Karveer",
        "District (जिल्हा)": "Kolhapur",
        "Contact Number": "9850123456",
        "Email Address": "gokul.dairy.karveer@gmail.com",
        "Date of Birth (DOB)": "1980-04-20",
        "Animal Feed - Product Types": "",
        "Animal Feed - Companies": "",
        "Animal Feed - Brands": "",
        "Animal Feed - Animals Serviced": "",
        "Animal Feed - Batch Quantity": "",
        "Dairy - Number of Suppliers": 92,
        "Dairy - Milk Quantity": "4,500 Liters / Day",
        "Dairy - Fat (%)": 4.5,
        "Dairy - SNF (%)": 8.8,
        "Dairy - Rate / Liter (₹)": 38.00,
        "Farmers - Number of Animals": "",
        "Farmers - Animal Details": "",
        "Farmers - Produce / Fodder": "",
        "Farmers - Quantity": "",
        "Bill Date": "2026-04-04",
        "Payment Due Date": "2026-04-19",
        "Item Description": "Bulk Chilled Raw Cow Milk Procurement",
        "Taxable Amount (₹)": 171000,
        "GST Rate (%)": 0,
        "Total Inward Value (₹)": 171000,
        "Paid Amount (₹)": 171000,
        "Payment Status": "Paid",
        "Payment Method": "Direct Bank Settlement"
      },
      {
        "Category / Sector": "Farmers",
        "Supplier / Seller Name": "Tukaram Ramchandra Patil",
        "Bill / Ref Number": "BILL-FRM-018",
        "Village (गाव)": "Malegaon Khurd",
        "Taluka (तालुका)": "Haveli",
        "District (जिल्हा)": "Pune",
        "Contact Number": "9764512390",
        "Email Address": "tukaram.patil.farm@gmail.com",
        "Date of Birth (DOB)": "1982-11-10",
        "Animal Feed - Product Types": "",
        "Animal Feed - Companies": "",
        "Animal Feed - Brands": "",
        "Animal Feed - Animals Serviced": "",
        "Animal Feed - Batch Quantity": "",
        "Dairy - Number of Suppliers": "",
        "Dairy - Milk Quantity": "",
        "Dairy - Fat (%)": "",
        "Dairy - SNF (%)": "",
        "Dairy - Rate / Liter (₹)": "",
        "Farmers - Number of Animals": "18",
        "Farmers - Animal Details": "10 HF Crossbreed Cows, 5 Murrah Buffaloes, 3 Heifers",
        "Farmers - Produce / Fodder": "Sweet Corn Silage Bales & Lucerne Hay",
        "Farmers - Quantity": "15 Tonnes",
        "Bill Date": "2026-04-05",
        "Payment Due Date": "2026-04-05",
        "Item Description": "Farm Green Fodder & Silage Inward",
        "Taxable Amount (₹)": 67500,
        "GST Rate (%)": 0,
        "Total Inward Value (₹)": 67500,
        "Paid Amount (₹)": 67500,
        "Payment Status": "Paid",
        "Payment Method": "UPI Immediate"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws["!cols"] = autoFitColumns(sampleData, Object.keys(sampleData[0]));
    XLSX.utils.book_append_sheet(wb, ws, "Purchases_Template");
    XLSX.writeFile(wb, "Laxmi_Enterprises_Purchases_Template.xlsx");
  } else if (type === "expo") {
    const sampleData = [
      {
        "Visitor Full Name": "Ramesh Dnyandev Patil",
        "Village (गाव)": "Baramati Rural",
        "Mobile Number": "9822456789",
        "Note / Remark": "Inquired for 350 bags Godrej MilkMore feed, needs transport subsidy quotation",
        "Visitor Sector / Category": "Animal Feed Shop",
        "Exhibition Event": "Kisan Agri Expo 2026 - Pune",
        "Taluka (तालुका)": "Baramati",
        "District (जिल्हा)": "Pune"
      },
      {
        "Visitor Full Name": "Sambhaji Narayan Patil",
        "Village (गाव)": "Kasaba Bawada",
        "Mobile Number": "9850123456",
        "Note / Remark": "Has 92 dairy suppliers, interested in bulk raw milk chilling equipment & BMC testing kits",
        "Visitor Sector / Category": "Dairy",
        "Exhibition Event": "Maha Dairy Mela 2026 - Kolhapur",
        "Taluka (तालुका)": "Karveer",
        "District (जिल्हा)": "Kolhapur"
      },
      {
        "Visitor Full Name": "Tukaram Ramchandra Patil",
        "Village (गाव)": "Malegaon Khurd",
        "Mobile Number": "9764512390",
        "Note / Remark": "Has 18 HF cows, requires 15 tonnes sweet corn silage bales delivered to farm",
        "Visitor Sector / Category": "Farmers",
        "Exhibition Event": "Krishi Mahotsav 2026 - Baramati",
        "Taluka (तालुका)": "Haveli",
        "District (जिल्हा)": "Pune"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws["!cols"] = autoFitColumns(sampleData, Object.keys(sampleData[0]));
    XLSX.utils.book_append_sheet(wb, ws, "Expo_Leads_Template");
    XLSX.writeFile(wb, "Laxmi_Enterprises_Expo_Leads_Template.xlsx");
  }
}

/**
 * Parse an uploaded Excel/CSV file (.xlsx, .xls, .csv)
 * Returns { sheetNames: string[], activeSheet: string, data: object[] }
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetNames = workbook.SheetNames;
        
        if (!sheetNames || sheetNames.length === 0) {
          throw new Error("No worksheets found in this workbook.");
        }

        const firstSheetName = sheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        resolve({
          fileName: file.name,
          fileSize: file.size,
          sheetNames,
          activeSheet: firstSheetName,
          workbook,
          data: rawJson
        });
      } catch (err) {
        reject(new Error("Unable to parse Excel file: " + err.message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the file. Please check file permissions."));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Map raw imported Excel rows to structured Clients schema
 */
export function mapExcelToClients(rows, existingClients = []) {
  let highestIdNum = 0;
  existingClients.forEach(c => {
    const match = c.id && c.id.match(/CL-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > highestIdNum) highestIdNum = num;
    }
  });

  return rows.map((row) => {
    highestIdNum += 1;
    const generatedId = `CL-${String(highestIdNum).padStart(3, "0")}`;

    // Normalize keys: lower-case without spaces/punctuations
    const normalized = {};
    Object.keys(row).forEach(k => {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      normalized[cleanKey] = row[k];
    });

    const rawType = normalized.clientcategorytype || normalized.clienttype || normalized.category || normalized.type || "";
    let clientType = "Animal Feed Shop";
    if (rawType.toLowerCase().includes("dairy") || rawType.toLowerCase().includes("dudh")) {
      clientType = "Dairy";
    } else if (rawType.toLowerCase().includes("farmer") || rawType.toLowerCase().includes("shetkari")) {
      clientType = "Farmers";
    } else if (rawType.toLowerCase().includes("feed") || rawType.toLowerCase().includes("animal") || rawType.toLowerCase().includes("pashu")) {
      clientType = "Animal Feed Shop";
    }

    const name = normalized.clientname || normalized.name || normalized.customer || normalized.company || "Unnamed Client";
    const village = normalized.village || normalized.villagename || normalized.gav || "";
    const taluka = normalized.taluka || normalized.taluk || normalized.tahsil || "";
    const district = normalized.district || normalized.dist || normalized.jilha || "";
    const contact = normalized.contactnumber || normalized.contact || normalized.phone || normalized.mobile || "9800000000";
    const email = normalized.emailaddress || normalized.email || normalized.mail || "";
    const dob = normalized.dateofbirthdob || normalized.dateofbirth || normalized.dob || "";
    const city = normalized.citylocation || normalized.city || (district ? `${taluka ? taluka + ", " : ""}${district}` : "Pune");

    // Specific fields
    const productTypes = normalized.animalfeedproducttypes || normalized.producttypes || normalized.products || "";
    const companies = normalized.animalfeedcompanies || normalized.companies || normalized.companiessellingproducts || "";
    const brands = normalized.animalfeedbrands || normalized.brands || normalized.sellingbrands || "";
    const numberOfSuppliers = parseInt(normalized.dairynumberofsuppliers || normalized.numberofsuppliers || normalized.suppliers || 0, 10) || "";
    const milkQuantity = normalized.dairymilkquantity || normalized.milkquantity || normalized.quantityofmilk || "";
    const numberOfAnimals = normalized.farmersnumberofanimals || normalized.animalfeedanimalsserviced || normalized.numberofanimals || normalized.noofanimals || "";
    const animalDetails = normalized.farmersanimaldetails || normalized.animaldetails || "";

    const orders = parseInt(normalized.totalorders || normalized.orders || normalized.ordercount || 0, 10) || 0;
    const revenue = parseFloat(normalized.totalrevenue || normalized.revenue || normalized.billing || normalized.amount || 0) || 0;
    const outstanding = parseFloat(normalized.outstandingdues || normalized.outstanding || 0) || 0;
    const status = (normalized.accountstatus || normalized.status || "Active").toLowerCase().includes("inact") ? "Inactive" : "Active";
    const tier = normalized.accounttier || normalized.tier || "Gold";
    const paymentTerms = normalized.paymentterms || "Net 30";

    return {
      id: normalized.clientid || normalized.id || generatedId,
      clientType,
      name: String(name).trim(),
      village: String(village).trim(),
      taluka: String(taluka).trim(),
      district: String(district).trim(),
      contact: String(contact).trim(),
      email: String(email).trim(),
      dob: String(dob).trim(),
      city: String(city).trim(),
      productTypes: String(productTypes).trim(),
      companies: String(companies).trim(),
      brands: String(brands).trim(),
      numberOfSuppliers,
      milkQuantity: String(milkQuantity).trim(),
      numberOfAnimals,
      animalDetails: String(animalDetails).trim(),
      orders,
      revenue,
      outstanding,
      status,
      tier,
      paymentTerms
    };
  });
}

/**
 * Map raw imported Excel rows to structured Products schema
 */
export function mapExcelToProducts(rows, existingProducts = []) {
  let highestIdNum = 0;
  existingProducts.forEach(p => {
    const match = p.id && p.id.match(/PR-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > highestIdNum) highestIdNum = num;
    }
  });

  return rows.map((row) => {
    highestIdNum += 1;
    const generatedId = `PR-${String(highestIdNum).padStart(3, "0")}`;

    const normalized = {};
    Object.keys(row).forEach(k => {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      normalized[cleanKey] = row[k];
    });

    const name = normalized.productname || normalized.name || normalized.item || "Industrial Item";
    const category = normalized.category || normalized.dept || "Hardware";
    const price = parseFloat(normalized.unitprice || normalized.price || normalized.rate || 0) || 100;
    const stock = parseInt(normalized.availablestock || normalized.stock || normalized.quantity || normalized.qty || 0, 10) || 0;
    const minStock = parseInt(normalized.minsafetythreshold || normalized.minstock || normalized.threshold || 20, 10) || 20;

    return {
      id: normalized.productid || normalized.id || generatedId,
      name: String(name).trim(),
      category: String(category).trim(),
      price,
      stock,
      minStock
    };
  });
}

/**
 * Map raw imported Excel rows to structured Inventory schema
 */
export function mapExcelToInventory(rows, existingInventory = []) {
  let highestIdNum = 0;
  existingInventory.forEach(inv => {
    const match = inv.id && inv.id.match(/INV-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > highestIdNum) highestIdNum = num;
    }
  });

  return rows.map((row) => {
    highestIdNum += 1;
    const generatedId = `INV-${String(highestIdNum).padStart(3, "0")}`;

    const normalized = {};
    Object.keys(row).forEach(k => {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      normalized[cleanKey] = row[k];
    });

    const product = normalized.productname || normalized.product || normalized.item || "Industrial Goods";
    const sku = normalized.skucode || normalized.sku || `LE-SKU-${highestIdNum}`;
    const inward = parseInt(normalized.inwardreceiptsunits || normalized.inward || normalized.in || 0, 10) || 0;
    const outward = parseInt(normalized.outwarddispatchesunits || normalized.outward || normalized.out || 0, 10) || 0;
    const stock = parseInt(normalized.currentbalancestock || normalized.stock || (inward - outward), 10) || 0;
    const location = normalized.warehousebaylocation || normalized.warehouselocation || normalized.location || "Warehouse A - Bay 01";
    
    let status = normalized.status || (stock < 20 ? "Low Stock" : "In Stock");
    if (stock <= 0) status = "Out of Stock";

    return {
      id: normalized.logisticsid || normalized.id || generatedId,
      product: String(product).trim(),
      sku: String(sku).trim(),
      in: inward,
      out: outward,
      stock,
      status,
      location: String(location).trim()
    };
  });
}

/**
 * Map raw imported Excel rows to structured Purchases & Procurement schema
 */
export function mapExcelToPurchases(rows, existingPurchases = []) {
  let highestIdNum = 0;
  existingPurchases.forEach(p => {
    const match = p.id && p.id.match(/PUR-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > highestIdNum) highestIdNum = num;
    }
  });

  return rows.map((row) => {
    highestIdNum += 1;
    const generatedId = `LE-PUR-2026-${String(highestIdNum).padStart(3, "0")}`;

    const normalized = {};
    Object.keys(row).forEach(k => {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      normalized[cleanKey] = row[k];
    });

    // Detect category
    let category = "Animal Feed Shop";
    const rawCat = (normalized.categorysector || normalized.category || normalized.sector || "").toLowerCase();
    if (rawCat.includes("dairy") || rawCat.includes("dudh") || rawCat.includes("milk")) {
      category = "Dairy";
    } else if (rawCat.includes("farm") || rawCat.includes("kisan") || rawCat.includes("shetkari")) {
      category = "Farmers";
    }

    const vendorName = normalized.suppliersellername || normalized.vendorname || normalized.suppliername || normalized.sellername || normalized.name || "Vendor";
    const billNumber = normalized.billrefnumber || normalized.billnumber || normalized.refnumber || normalized.billno || `BILL-${highestIdNum}`;
    const village = normalized.village || normalized.villagename || normalized.gav || "";
    const taluka = normalized.taluka || normalized.taluk || normalized.tahsil || "";
    const district = normalized.district || normalized.dist || normalized.jilha || "";
    const contact = normalized.contactnumber || normalized.contact || normalized.phone || normalized.mobile || "";
    const email = normalized.emailaddress || normalized.email || "";
    const dob = normalized.dateofbirthdob || normalized.dateofbirth || normalized.dob || "";

    // Specific fields
    const productTypes = normalized.animalfeedproducttypes || normalized.producttypes || "";
    const companies = normalized.animalfeedcompanies || normalized.companies || "";
    const brands = normalized.animalfeedbrands || normalized.brands || "";
    const numberOfAnimals = normalized.farmersnumberofanimals || normalized.animalfeedanimalsserviced || normalized.numberofanimals || "";
    const feedQuantity = normalized.animalfeedbatchquantity || normalized.feedquantity || "";

    const numberOfSuppliers = parseInt(normalized.dairynumberofsuppliers || normalized.numberofsuppliers || 0, 10) || "";
    const milkQuantity = normalized.dairymilkquantity || normalized.milkquantity || "";
    const fatPercent = parseFloat(normalized.dairyfat || normalized.fatpercent || normalized.fat || 0) || "";
    const snfPercent = parseFloat(normalized.dairysnf || normalized.snfpercent || normalized.snf || 0) || "";
    const ratePerLiter = parseFloat(normalized.dairyrateliter || normalized.rateperliter || 0) || "";

    const animalDetails = normalized.farmersanimaldetails || normalized.animaldetails || "";
    const farmItemsSupplied = normalized.farmersproducefodder || normalized.produce || normalized.farmitemssupplied || "";
    const farmQuantity = normalized.farmersquantity || normalized.farmquantity || "";

    const date = normalized.billdate || normalized.date || new Date().toISOString().slice(0, 10);
    const dueDate = normalized.paymentduedate || normalized.duedate || date;
    const itemDescription = normalized.itemdescription || normalized.item || normalized.description || (
      category === "Dairy" ? "Bulk Raw Milk Inward" :
      category === "Farmers" ? "Direct Farm Supply / Fodder" : "Animal Cattle Feed Supply"
    );

    const taxableAmount = parseFloat(normalized.taxableamount || normalized.taxable || normalized.amount || 0) || 0;
    const gstRate = parseFloat(normalized.gstrate || normalized.gst || (category === "Dairy" || category === "Farmers" ? 0 : 5)) || 0;
    const gstAmount = Math.round(taxableAmount * (gstRate / 100));
    const totalAmount = parseFloat(normalized.totalinwardvalue || normalized.totalamount || normalized.total || (taxableAmount + gstAmount)) || (taxableAmount + gstAmount);
    const paidAmount = parseFloat(normalized.paidamount || normalized.paid || totalAmount) || totalAmount;
    const paymentStatus = normalized.paymentstatus || (paidAmount >= totalAmount ? "Paid" : paidAmount > 0 ? "Partial" : "Pending");
    const paymentMethod = normalized.paymentmethod || "Bank Transfer";
    const remarks = normalized.remarkswarehouse || normalized.remarks || "";

    return {
      id: normalized.purchasepoid || normalized.id || generatedId,
      billNumber: String(billNumber).trim(),
      category,
      vendorName: String(vendorName).trim(),
      name: String(vendorName).trim(),
      village: String(village).trim(),
      taluka: String(taluka).trim(),
      district: String(district).trim(),
      contact: String(contact).trim(),
      email: String(email).trim(),
      dob: String(dob).trim(),
      productTypes: String(productTypes).trim(),
      companies: String(companies).trim(),
      brands: String(brands).trim(),
      numberOfAnimals,
      feedQuantity: String(feedQuantity).trim(),
      numberOfSuppliers,
      milkQuantity: String(milkQuantity).trim(),
      fatPercent,
      snfPercent,
      ratePerLiter,
      animalDetails: String(animalDetails).trim(),
      farmItemsSupplied: String(farmItemsSupplied).trim(),
      farmQuantity: String(farmQuantity).trim(),
      date,
      dueDate,
      itemDescription: String(itemDescription).trim(),
      taxableAmount,
      gstRate,
      gstAmount,
      totalAmount,
      paidAmount,
      balanceDue: Math.max(0, totalAmount - paidAmount),
      paymentStatus,
      paymentMethod,
      remarks: String(remarks).trim()
    };
  });
}

/**
 * Map raw imported Excel rows to structured Expo Leads schema
 */
export function mapExcelToExpoLeads(rows, existingLeads = []) {
  let highestIdNum = 0;
  existingLeads.forEach(l => {
    const match = l.id && l.id.match(/EXP-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > highestIdNum) highestIdNum = num;
    }
  });

  return rows.map((row) => {
    highestIdNum += 1;
    const generatedId = `EXP-${String(highestIdNum).padStart(3, "0")}`;

    const normalized = {};
    Object.keys(row).forEach(k => {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      normalized[cleanKey] = row[k];
    });

    const name = normalized.visitorfullname || normalized.visitorname || normalized.name || normalized.fullname || "Expo Visitor";
    const village = normalized.village || normalized.villagename || normalized.gav || "Maharashtra";
    const mobile = normalized.mobilenumber || normalized.mobile || normalized.phone || normalized.contact || "";
    const remark = normalized.noteremark || normalized.note || normalized.remark || normalized.inquiry || "Met at stall";
    
    // Category detection
    let category = "Farmers";
    const rawCat = (normalized.visitorsectorcategory || normalized.category || normalized.sector || "").toLowerCase();
    if (rawCat.includes("feed") || rawCat.includes("shop")) category = "Animal Feed Shop";
    else if (rawCat.includes("dairy") || rawCat.includes("milk")) category = "Dairy";
    else if (rawCat.includes("farm") || rawCat.includes("kisan")) category = "Farmers";

    const expoName = normalized.exhibitionevent || normalized.exponame || normalized.event || "Kisan Agri Expo 2026 - Pune";
    const taluka = normalized.taluka || normalized.taluk || "";
    const district = normalized.district || normalized.dist || "Pune";
    const status = normalized.followupstatus || normalized.status || "New Lead";
    const date = normalized.registrationdate || normalized.date || new Date().toISOString().slice(0, 10);
    const email = normalized.emailaddress || normalized.email || "";

    return {
      id: normalized.leadid || normalized.id || generatedId,
      name: String(name).trim(),
      village: String(village).trim(),
      mobile: String(mobile).trim(),
      remark: String(remark).trim(),
      category,
      expoName: String(expoName).trim(),
      taluka: String(taluka).trim(),
      district: String(district).trim(),
      status: String(status).trim(),
      date,
      email: String(email).trim()
    };
  });
}


