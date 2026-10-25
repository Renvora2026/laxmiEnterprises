import { Op } from "sequelize";
import { Client, Product, Inventory, Purchase, Invoice, ExpoLead, Company } from "../models/index.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all ERP data from MySQL database
 */
export const getAllData = asyncHandler(async (req, res) => {
  const [clients, products, inventory, purchases, invoices, expoLeads, company] = await Promise.all([
    Client.findAll({ order: [["createdAt", "DESC"]] }),
    Product.findAll({ order: [["createdAt", "DESC"]] }),
    Inventory.findAll({ order: [["productName", "ASC"]] }),
    Purchase.findAll({ order: [["createdAt", "DESC"]] }),
    Invoice.findAll({ order: [["createdAt", "DESC"]] }),
    ExpoLead.findAll({ order: [["createdAt", "DESC"]] }),
    Company.findOne({ where: { id: 1 } }),
  ]);

  return ApiResponse.success(
    res,
    {
      clients: clients.map((c) => c.toJSON()),
      products: products.map((p) => p.toJSON()),
      inventory: inventory.map((i) => i.toJSON()),
      purchases: purchases.map((p) => p.toJSON()),
      invoices: invoices.map((inv) => inv.toJSON()),
      expoLeads: expoLeads.map((e) => e.toJSON()),
      company: company ? company.toJSON() : null,
    },
    "All ERP data retrieved from MySQL database"
  );
});

/**
 * Sync / Save Clients to MySQL
 */
export const syncClients = asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : req.body.clients || [];
  const incomingIds = [];

  for (const item of list) {
    const clientId = String(item.clientId || item.id || "");
    if (!clientId) continue;
    incomingIds.push(clientId);
    if (item.clientId) incomingIds.push(String(item.clientId));
    if (item.id) incomingIds.push(String(item.id));

    const data = {
      clientId,
      name: item.name || "Unnamed Client",
      clientType: item.clientType || "Farmers",
      contactPerson: item.contactPerson || "",
      contact: item.contact || item.phone || "",
      email: item.email || "",
      dob: item.dob || "",
      village: item.village || "",
      taluka: item.taluka || "",
      district: item.district || "",
      city: item.city || "",
      address: item.address || "",
      pincode: item.pincode || "",
      gstin: item.gstin || "",
      pan: item.pan || "",
      orders: Number(item.orders || 0),
      revenue: Number(item.revenue || 0),
      outstandingBalance: Number(item.outstanding ?? item.outstandingBalance ?? 0),
      creditLimit: Number(item.creditLimit || 0),
      status: item.status || "Active",
      tier: item.tier || "Gold",
      paymentTerms: item.paymentTerms || "Net 30",
      milkQuantity: item.milkQuantity || "",
      fatPercentage: item.fatPercentage || "",
      snfPercentage: item.snfPercentage || "",
      chillingCenter: item.chillingCenter || "",
      routeNumber: item.routeNumber || "",
      collectionTiming: item.collectionTiming || "",
      landAcres: item.landAcres || "",
      cropTypes: item.cropTypes || "",
      soilType: item.soilType || "",
      irrigationSource: item.irrigationSource || "",
      kisanCreditCard: item.kisanCreditCard || "",
      subsidyScheme: item.subsidyScheme || "",
      animalDetails: item.animalDetails || "",
      numberOfAnimals: item.numberOfAnimals || "",
      shopLicenseNumber: item.shopLicenseNumber || "",
      distributorName: item.distributorName || "",
      territoryCoverage: item.territoryCoverage || "",
      storageCapacity: item.storageCapacity || "",
      annualTurnover: item.annualTurnover || "",
      primaryFeedCategory: item.primaryFeedCategory || "",
      productTypes: item.productTypes || "",
      brands: item.brands || "",
      companies: item.companies || "",
    };

    const [record, created] = await Client.findOrCreate({
      where: { clientId },
      defaults: data,
    });

    if (!created) {
      await record.update(data);
    }
  }

  // Delete clients that were removed from the directory
  if (incomingIds.length > 0) {
    await Client.destroy({ where: { clientId: { [Op.notIn]: incomingIds } } });
  } else if (list.length === 0 && (Array.isArray(req.body) || Array.isArray(req.body?.clients))) {
    await Client.destroy({ where: {} });
  }

  const all = await Client.findAll({ order: [["createdAt", "DESC"]] });
  return ApiResponse.success(res, all.map((c) => c.toJSON()), "Clients saved in MySQL");
});

/**
 * Sync / Save Invoices to MySQL
 */
export const syncInvoices = asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : req.body.invoices || [];
  const incomingIds = [];

  for (const item of list) {
    const invoiceNumber = String(item.invoiceNumber || item.invoiceNo || item.id || "");
    if (!invoiceNumber) continue;
    incomingIds.push(invoiceNumber);
    if (item.invoiceNumber) incomingIds.push(String(item.invoiceNumber));
    if (item.invoiceNo) incomingIds.push(String(item.invoiceNo));
    if (item.id) incomingIds.push(String(item.id));

    const [record] = await Invoice.findOrCreate({
      where: { invoiceNumber },
      defaults: {
        invoiceNumber,
        clientId: item.clientId || "",
        clientName: item.clientName || "",
        clientType: item.clientType || "Farmers",
        clientGstin: item.clientGstin || "",
        clientContact: item.clientContact || item.phone || "",
        clientAddress: item.clientAddress || "",
        date: item.date || "",
        dueDate: item.dueDate || "",
        items: item.items || [],
        subtotal: Number(item.subtotal || 0),
        cgstTotal: Number(item.cgstTotal || 0),
        sgstTotal: Number(item.sgstTotal || 0),
        igstTotal: Number(item.igstTotal || 0),
        grandTotal: Number(item.grandTotal || item.total || 0),
        paidAmount: Number(item.paidAmount || 0),
        balanceDue: Number(item.balanceDue || 0),
        paymentStatus: item.paymentStatus || item.status || "Unpaid",
        paymentMode: item.paymentMode || "Cash",
        notes: item.notes || "",
      },
    });

    await record.update({
      clientId: item.clientId || record.clientId,
      clientName: item.clientName || record.clientName,
      items: item.items || record.items,
      grandTotal: Number(item.grandTotal || item.total || record.grandTotal),
      paidAmount: Number(item.paidAmount ?? record.paidAmount),
      balanceDue: Number(item.balanceDue ?? record.balanceDue),
      paymentStatus: item.paymentStatus || item.status || record.paymentStatus,
      paymentMode: item.paymentMode || record.paymentMode,
    });
  }

  // Delete invoices that were deleted on the frontend
  if (incomingIds.length > 0) {
    await Invoice.destroy({ where: { invoiceNumber: { [Op.notIn]: incomingIds } } });
  } else if (list.length === 0 && (Array.isArray(req.body) || Array.isArray(req.body?.invoices))) {
    await Invoice.destroy({ where: {} });
  }

  const all = await Invoice.findAll({ order: [["createdAt", "DESC"]] });
  return ApiResponse.success(res, all.map((inv) => inv.toJSON()), "Invoices saved in MySQL");
});

/**
 * Sync / Save Purchases to MySQL
 */
export const syncPurchases = asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : req.body.purchases || [];
  const incomingIds = [];

  for (const item of list) {
    const purchaseId = String(item.purchaseId || item.id || "");
    if (!purchaseId) continue;
    incomingIds.push(purchaseId);
    if (item.purchaseId) incomingIds.push(String(item.purchaseId));
    if (item.id) incomingIds.push(String(item.id));

    const [record] = await Purchase.findOrCreate({
      where: { purchaseId },
      defaults: {
        purchaseId,
        vendorName: item.vendorName || "Vendor",
        vendorGstin: item.vendorGstin || "",
        vendorContact: item.vendorContact || "",
        vendorInvoiceNo: item.vendorInvoiceNo || "",
        date: item.date || "",
        category: item.category || "Raw Feed & Supplies",
        items: item.items || [],
        subtotal: Number(item.subtotal || 0),
        grandTotal: Number(item.grandTotal || item.total || 0),
        paidAmount: Number(item.paidAmount || 0),
        paymentStatus: item.paymentStatus || item.status || "Pending",
        paymentMode: item.paymentMode || "NEFT/RTGS",
        notes: item.notes || "",
      },
    });

    await record.update({
      vendorName: item.vendorName || record.vendorName,
      items: item.items || record.items,
      grandTotal: Number(item.grandTotal || item.total || record.grandTotal),
      paidAmount: Number(item.paidAmount ?? record.paidAmount),
      paymentStatus: item.paymentStatus || item.status || record.paymentStatus,
      paymentMode: item.paymentMode || record.paymentMode,
    });
  }

  // Delete purchases that were deleted on the frontend
  if (incomingIds.length > 0) {
    await Purchase.destroy({ where: { purchaseId: { [Op.notIn]: incomingIds } } });
  } else if (list.length === 0 && (Array.isArray(req.body) || Array.isArray(req.body?.purchases))) {
    await Purchase.destroy({ where: {} });
  }

  const all = await Purchase.findAll({ order: [["createdAt", "DESC"]] });
  return ApiResponse.success(res, all.map((p) => p.toJSON()), "Purchases saved in MySQL");
});

/**
 * Sync / Save Products to MySQL
 */
export const syncProducts = asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : req.body.products || [];
  const incomingIds = [];

  for (const item of list) {
    const productId = String(item.productId || item.id || "");
    if (!productId) continue;
    incomingIds.push(productId);

    const [record] = await Product.findOrCreate({
      where: { productId },
      defaults: {
        productId,
        name: item.name || "Product",
        category: item.category || "General",
        sku: item.sku || "",
        hsnCode: item.hsnCode || "",
        unit: item.unit || "Bags",
        purchasePrice: Number(item.purchasePrice || 0),
        sellingPrice: Number(item.sellingPrice || item.price || 0),
        gstRate: Number(item.gstRate || 18),
        description: item.description || "",
      },
    });

    await record.update({
      name: item.name || record.name,
      category: item.category || record.category,
      purchasePrice: Number(item.purchasePrice ?? record.purchasePrice),
      sellingPrice: Number(item.sellingPrice || item.price || record.sellingPrice),
      gstRate: Number(item.gstRate ?? record.gstRate),
      description: item.description || record.description,
    });
  }

  // Delete products that were removed from the catalogue
  if (incomingIds.length > 0) {
    await Product.destroy({ where: { productId: { [Op.notIn]: incomingIds } } });
  } else if (Array.isArray(req.body) && req.body.length === 0) {
    await Product.destroy({ where: {} });
  }

  const all = await Product.findAll({ order: [["createdAt", "DESC"]] });
  return ApiResponse.success(res, all.map((p) => p.toJSON()), "Products saved in MySQL");
});

/**
 * Sync / Save Inventory to MySQL
 */
export const syncInventory = asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : req.body.inventory || [];
  const incomingIds = [];

  for (const item of list) {
    const productId = String(item.productId || item.id || "");
    if (!productId) continue;
    incomingIds.push(productId);

    const [record] = await Inventory.findOrCreate({
      where: { productId },
      defaults: {
        productId,
        productName: item.productName || item.name || "Product",
        category: item.category || "General",
        unit: item.unit || "Bags",
        currentStock: Number(item.stock ?? item.currentStock ?? 0),
        minStockAlert: Number(item.minStockAlert || 10),
        warehouseLocation: item.warehouseLocation || "Main Warehouse",
      },
    });

    await record.update({
      currentStock: Number(item.stock ?? item.currentStock ?? record.currentStock),
      minStockAlert: Number(item.minStockAlert ?? record.minStockAlert),
      warehouseLocation: item.warehouseLocation || record.warehouseLocation,
    });
  }

  // Delete inventory items that were removed
  if (incomingIds.length > 0) {
    await Inventory.destroy({ where: { productId: { [Op.notIn]: incomingIds } } });
  } else if (Array.isArray(req.body) && req.body.length === 0) {
    await Inventory.destroy({ where: {} });
  }

  const all = await Inventory.findAll({ order: [["productName", "ASC"]] });
  return ApiResponse.success(res, all.map((i) => i.toJSON()), "Inventory saved in MySQL");
});

/**
 * Sync / Save Expo Leads to MySQL
 */
export const syncExpoLeads = asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : req.body.expoLeads || [];
  const incomingIds = [];

  for (const item of list) {
    const leadId = String(item.leadId || item.id || "");
    if (!leadId) continue;
    incomingIds.push(leadId);
    if (item.leadId) incomingIds.push(String(item.leadId));
    if (item.id) incomingIds.push(String(item.id));

    const [record] = await ExpoLead.findOrCreate({
      where: { leadId },
      defaults: {
        leadId,
        expoName: item.expoName || "AgroTech Kisan Mela",
        visitorName: item.visitorName || item.name || "Visitor",
        category: item.category || "Farmer",
        contact: item.contact || item.phone || "",
        email: item.email || "",
        village: item.village || "",
        taluka: item.taluka || "",
        district: item.district || "",
        cattleCount: Number(item.cattleCount || 0),
        status: item.status || "New",
        notes: item.notes || "",
      },
    });

    await record.update({
      visitorName: item.visitorName || item.name || record.visitorName,
      status: item.status || record.status,
      contact: item.contact || item.phone || record.contact,
    });
  }

  // Delete expo leads that were removed from the database
  if (incomingIds.length > 0) {
    await ExpoLead.destroy({ where: { leadId: { [Op.notIn]: incomingIds } } });
  } else if (list.length === 0 && (Array.isArray(req.body) || Array.isArray(req.body?.expoLeads))) {
    await ExpoLead.destroy({ where: {} });
  }

  const all = await ExpoLead.findAll({ order: [["createdAt", "DESC"]] });
  return ApiResponse.success(res, all.map((e) => e.toJSON()), "Expo Leads saved in MySQL");
});

/**
 * Sync / Save Company Profile to MySQL
 */
export const syncCompany = asyncHandler(async (req, res) => {
  const comp = req.body;
  const [record] = await Company.findOrCreate({
    where: { id: 1 },
    defaults: {
      name: comp.name || "Laxmi Enterprises",
    },
  });

  await record.update({
    name: comp.name || record.name,
    tagline: comp.tagline || record.tagline,
    address: comp.address || record.address,
    gstin: comp.gstin || record.gstin,
    pan: comp.pan || record.pan,
    phone: comp.phone || record.phone,
    email: comp.email || record.email,
    currency: comp.currency || record.currency,
    financialYear: comp.financialYear || record.financialYear,
  });

  return ApiResponse.success(res, record.toJSON(), "Company Profile saved in MySQL");
});
