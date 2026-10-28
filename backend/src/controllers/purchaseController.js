import { Op } from "sequelize";
import { Purchase } from "../models/Purchase.js";
import { Product } from "../models/Product.js";
import { Vendor } from "../models/Vendor.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { applyStockChange } from "../utils/stockSync.js";

export const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.findAll({ order: [["createdAt", "DESC"]] });
  return ApiResponse.success(res, purchases, "Purchases retrieved successfully");
});

/**
 * Record a new inward purchase & increment stock
 * Body must contain items[]: [{ productId, quantity }]
 */
export const createPurchase = asyncHandler(async (req, res) => {
  const purchaseData = req.body;

  if (!purchaseData.purchaseId) {
    const count = await Purchase.count();
    purchaseData.purchaseId = `PUR-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
  }

  const existing = await Purchase.findOne({ where: { purchaseId: purchaseData.purchaseId } });
  if (existing) {
    throw ApiError.badRequest(`Purchase ID ${purchaseData.purchaseId} already exists`);
  }

  let rawItems = purchaseData.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    if (purchaseData.productId) {
      rawItems = [
        {
          productId: purchaseData.productId,
          quantity: Number(purchaseData.inwardQty ?? purchaseData.quantity ?? 1),
        },
      ];
    }
  }

  // Validate pehle, taaki half-done state na bane
  const stockLines = [];
  if (Array.isArray(rawItems)) {
    for (const item of rawItems) {
      const prodId = item.productId || item.id;
      const quantity = Number(item.quantity ?? item.inwardQty ?? item.qty ?? 0);
      if (!prodId) {
        throw ApiError.badRequest("Each purchase item must reference a valid product (productId required)");
      }
      const prod = await Product.findOne({ where: { productId: prodId } });
      if (!prod) {
        throw ApiError.notFound(`No product found in catalogue for ID: ${prodId}. Add it to the Product Catalogue first.`);
      }
      stockLines.push({ prodId, quantity });
    }
  }

  const purchase = await Purchase.create(purchaseData);

  for (const { prodId, quantity } of stockLines) {
    if (quantity > 0) {
      await applyStockChange(prodId, quantity, { location: purchaseData.location });
    }
  }

  // Vendor ledger
  const targetVendorId = purchaseData.vendorId;
  if (targetVendorId) {
    const vendor = await Vendor.findOne({
      where: {
        [Op.or]: [
          { vendorId: targetVendorId },
          ...(isNaN(targetVendorId) ? [] : [{ id: Number(targetVendorId) }]),
        ],
      },
    });
    if (vendor) {
      const pGrandTotal = Number(purchaseData.grandTotal || purchaseData.total || 0);
      const pPaid = Number(purchaseData.paidAmount || 0);
      const pDue = Math.max(0, pGrandTotal - pPaid);
      vendor.totalOrders = Number(vendor.totalOrders || 0) + 1;
      vendor.totalPurchases = Number(vendor.totalPurchases || 0) + pGrandTotal;
      if (pDue > 0) {
        vendor.outstandingPayable = Number(vendor.outstandingPayable || 0) + pDue;
      }
      await vendor.save();
    }
  }

  return ApiResponse.created(res, purchase, "Purchase voucher recorded & inventory restocked successfully");
});

export const updatePurchase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const purchase = await Purchase.findOne({ where: { purchaseId: id } });
  if (!purchase) {
    throw ApiError.notFound(`Purchase not found with id: ${id}`);
  }
  await purchase.update(req.body);
  return ApiResponse.success(res, purchase, "Purchase updated successfully");
});

export const deletePurchase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const purchase = await Purchase.findOne({
    where: {
      [Op.or]: [{ purchaseId: id }, ...(isNaN(id) ? [] : [{ id: Number(id) }])],
    },
  });
  if (!purchase) {
    throw ApiError.notFound(`Purchase not found with id: ${id}`);
  }
  await purchase.destroy();
  return ApiResponse.success(res, null, "Purchase deleted successfully");
});