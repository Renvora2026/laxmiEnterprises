import { toInventoryView, backfillInventory } from "../utils/stockSync.js";
import { Op } from "sequelize";
import { Client, Vendor, Product, Inventory, Purchase, Invoice, ExpoLead, Company } from "../models/index.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all ERP data from MySQL database
 */
export const getAllData = asyncHandler(async (req, res) => {
  // purani products ke liye missing inventory rows bana do
  await backfillInventory();

  const [clients, vendors, products, inventory, purchases, invoices, expoLeads, company] = await Promise.all([
    Client.findAll({ order: [["createdAt", "DESC"]] }),
    Vendor.findAll({ order: [["createdAt", "DESC"]] }),
    Product.findAll({ include: [{ model: Inventory, as: "inventory" }], order: [["createdAt", "DESC"]] }),
    Inventory.findAll({ order: [["productName", "ASC"]] }),
    Purchase.findAll({ order: [["createdAt", "DESC"]] }),
    Invoice.findAll({ order: [["createdAt", "DESC"]] }),
    ExpoLead.findAll({ order: [["createdAt", "DESC"]] }),
    Company.findOne({ where: { id: 1 } }),
  ]);

  const prodMap = new Map(products.map((p) => [p.productId, p]));

  return ApiResponse.success(
    res,
    {
      clients: clients.map((c) => c.toJSON()),
      vendors: vendors.map((v) => v.toJSON()),
      products: products.map((p) => {
        const json = p.toJSON();
        const liveStock = p.inventory ? Number(p.inventory.currentStock || 0) : Number(json.stock || 0);
        return { ...json, stock: liveStock, currentStock: liveStock };
      }),
      inventory: inventory.map((i) => toInventoryView(i, prodMap.get(i.productId))),
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
 * Sync / Save Vendors to MySQL
 */
export const syncVendors = asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : req.body.vendors || [];
  const incomingIds = [];

  for (const item of list) {
    const vendorId = String(item.vendorId || item.id || "");
    if (!vendorId) continue;
    incomingIds.push(vendorId);

    const data = {
      vendorId,
      name: item.name || "Unnamed Vendor",
      companyName: item.companyName || "",
      category: item.category || "Animal Feed Shop",
      contactPerson: item.contactPerson || "",
      phone: item.phone || item.contact || "",
      email: item.email || "",
      gstin: item.gstin || "",
      pan: item.pan || "",
      village: item.village || "",
      taluka: item.taluka || "",
      district: item.district || "",
      city: item.city || "",
      state: item.state || "Maharashtra",
      pincode: item.pincode || "",
      address: item.address || "",
      bankName: item.bankName || "",
      accountNumber: item.accountNumber || "",
      ifscCode: item.ifscCode || "",
      paymentTerms: item.paymentTerms || "Net 15 Days",
      status: item.status || "Active",
      totalPurchases: Number(item.totalPurchases || 0),
      totalOrders: Number(item.totalOrders || 0),
      outstandingPayable: Number(item.outstandingPayable || 0),
      notes: item.notes || "",
    };

    const [record, created] = await Vendor.findOrCreate({
      where: { vendorId },
      defaults: data,
    });

    if (!created) {
      await record.update(data);
    }
  }

  // Delete vendors removed from frontend list
  if (incomingIds.length > 0) {
    await Vendor.destroy({ where: { vendorId: { [Op.notIn]: incomingIds } } });
  } else if (list.length === 0 && (Array.isArray(req.body) || Array.isArray(req.body?.vendors))) {
    await Vendor.destroy({ where: {} });
  }

  const all = await Vendor.findAll({ order: [["createdAt", "DESC"]] });
  return ApiResponse.success(res, all.map((v) => v.toJSON()), "Vendors saved in MySQL");
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

    const subtotal = Number(item.subtotal || item.taxableAmount || item.amount || 0);
    const grandTotal = Number(item.grandTotal || item.totalAmount || item.total || subtotal);
    const paymentStatus = item.paymentStatus || item.status || "Pending";
    let paidAmount = Number(item.paidAmount ?? (paymentStatus === "Paid" ? grandTotal : 0));
    if (paymentStatus === "Partial" && (paidAmount <= 0 || paidAmount >= grandTotal) && grandTotal > 0) {
      paidAmount = Math.round(grandTotal / 2);
    }

    const [record] = await Purchase.findOrCreate({
      where: { purchaseId },
      defaults: {
        purchaseId,
        vendorId: item.vendorId || "",
        vendorName: item.vendorName || "Vendor",
        vendorGstin: item.vendorGstin || "",
        vendorContact: item.vendorContact || item.contact || "",
        vendorInvoiceNo: item.vendorInvoiceNo || item.billNumber || "",
        date: item.date || "",
        category: item.category || "Animal Feed Shop",
        items: item.items || [],
        subtotal,
        grandTotal,
        paidAmount,
        paymentStatus,
        paymentMode: item.paymentMode || item.paymentMethod || "NEFT/RTGS",
        notes: item.notes || item.remarks || "",
      },
    });

    await record.update({
      vendorId: item.vendorId || record.vendorId,
      vendorName: item.vendorName || record.vendorName,
      category: item.category || record.category,
      items: item.items || record.items,
      subtotal: subtotal || record.subtotal,
      grandTotal: grandTotal || record.grandTotal,
      paidAmount: paidAmount,
      paymentStatus: paymentStatus,
      paymentMode: item.paymentMode || item.paymentMethod || record.paymentMode,
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

  const buildExtra = (old = {}, item, stock) => ({
    ...old,
    stock,
    openingStock: Number(item.openingStock ?? old.openingStock ?? 0),
    inwardStock: Number(item.inwardStock ?? old.inwardStock ?? 0),
    outwardStock: Number(item.outwardStock ?? old.outwardStock ?? 0),
    reservedStock: Number(item.reservedStock ?? old.reservedStock ?? 0),
    minStock: Number(item.minStock ?? old.minStock ?? 20),
  });

  for (const item of list) {
    const productId = String(item.productId || item.id || "");
    if (!productId) continue;
    incomingIds.push(productId);

    const itemStock = Number(item.stock ?? item.currentStock ?? 0);

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
        extraData: buildExtra({}, item, itemStock),
      },
    });

    await record.update({
      name: item.name || record.name,
      category: item.category || record.category,
      unit: item.unit || record.unit,
      sku: item.sku ?? record.sku,
      hsnCode: item.hsnCode ?? record.hsnCode,
      purchasePrice: Number(item.purchasePrice ?? record.purchasePrice),
      sellingPrice: Number(item.sellingPrice || item.price || record.sellingPrice),
      gstRate: Number(item.gstRate ?? record.gstRate),
      description: item.description || record.description,
      extraData: buildExtra(record.extraData || {}, item, itemStock),
    });

    // Inventory row: nahi hai to CREATE, hai to UPDATE
    const [inv, invCreated] = await Inventory.findOrCreate({
      where: { productId },
      defaults: {
        productId,
        productName: record.name,
        category: record.category,
        unit: record.unit,
        currentStock: itemStock,
        minStockAlert: Number(item.minStock ?? 10),
        warehouseLocation: item.warehouseLocation || "Main Warehouse - Bay 01",
      },
    });

    if (!invCreated) {
      await inv.update({
        productName: record.name,
        category: record.category,
        unit: record.unit,
        currentStock: itemStock,
        minStockAlert: Number(item.minStock ?? inv.minStockAlert),
        lastUpdated: new Date(),
      });
    }
  }

  // Catalogue se hataye gaye products (+ unki inventory) delete
  if (incomingIds.length > 0) {
    await Product.destroy({ where: { productId: { [Op.notIn]: incomingIds } } });
    await Inventory.destroy({ where: { productId: { [Op.notIn]: incomingIds } } });
  } else if (Array.isArray(req.body) && req.body.length === 0) {
    await Product.destroy({ where: {} });
    await Inventory.destroy({ where: {} });
  }

  const all = await Product.findAll({ order: [["createdAt", "DESC"]] });
  return ApiResponse.success(res, all.map((p) => p.toJSON()), "Products saved in MySQL");
});

/**
 * Sync / Save Inventory to MySQL
 */
export const syncInventory = asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : req.body.inventory || [];

  for (const item of list) {
    const productId = String(item.productId || item.id || "");
    if (!productId) continue;

    // Product catalogue me hona zaroori hai, warna phantom rows ban jaati hain
    const prod = await Product.findOne({ where: { productId } });
    if (!prod) continue;

    const invStock = Number(item.stock ?? item.currentStock ?? 0);

    const [record] = await Inventory.findOrCreate({
      where: { productId },
      defaults: {
        productId,
        productName: prod.name,
        category: prod.category,
        unit: prod.unit,
        currentStock: invStock,
        minStockAlert: Number(item.minStockAlert || 10),
        warehouseLocation: item.warehouseLocation || "Main Warehouse",
      },
    });

    await record.update({
      currentStock: invStock,
      minStockAlert: Number(item.minStockAlert ?? record.minStockAlert),
      warehouseLocation: item.warehouseLocation || record.warehouseLocation,
      lastUpdated: new Date(),
    });

    prod.extraData = { ...(prod.extraData || {}), stock: invStock };
    prod.changed("extraData", true);
    await prod.save();
  }

  // NOTE: yahan jaan-boojhkar delete nahi hai. Inventory row product ke saath hi hatti hai.
  const all = await Inventory.findAll({ order: [["productName", "ASC"]] });
  return ApiResponse.success(res, all.map((i) => i.toJSON()), "Inventory saved in MySQL");
});


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
