import { Op } from "sequelize";
import { Purchase } from "../models/Purchase.js";
import { Inventory } from "../models/Inventory.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all purchases
 */
export const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.findAll({
    order: [["createdAt", "DESC"]],
  });
  return ApiResponse.success(res, purchases, "Purchases retrieved successfully");
});

/**
 * Record a new inward purchase & increment stock
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

  const purchase = await Purchase.create(purchaseData);

  // Automatically update stock in inventory
  if (Array.isArray(purchaseData.items)) {
    for (const item of purchaseData.items) {
      if (item.productId && item.quantity) {
        const inv = await Inventory.findOne({ where: { productId: item.productId } });
        if (inv) {
          inv.currentStock = Number(inv.currentStock || 0) + Number(item.quantity);
          inv.lastUpdated = new Date();
          await inv.save();
        }
      }
    }
  }

  return ApiResponse.created(res, purchase, "Purchase voucher recorded successfully");
});

/**
 * Update purchase or payment status
 */
export const updatePurchase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const purchase = await Purchase.findOne({ where: { purchaseId: id } });

  if (!purchase) {
    throw ApiError.notFound(`Purchase not found with id: ${id}`);
  }

  await purchase.update(req.body);
  return ApiResponse.success(res, purchase, "Purchase updated successfully");
});

/**
 * Delete a purchase
 */
export const deletePurchase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const purchase = await Purchase.findOne({
    where: {
      [Op.or]: [
        { purchaseId: id },
        ...(isNaN(id) ? [] : [{ id: Number(id) }])
      ]
    }
  });

  if (!purchase) {
    throw ApiError.notFound(`Purchase not found with id: ${id}`);
  }

  await purchase.destroy();
  return ApiResponse.success(res, null, "Purchase deleted successfully");
});
