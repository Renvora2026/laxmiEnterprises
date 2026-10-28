import { Inventory } from "../models/Inventory.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { applyStockChange, toInventoryView, backfillInventory } from "../utils/stockSync.js";

/**
 * Get all inventory records (with in/out computed from product breakdown)
 */
export const getInventory = asyncHandler(async (req, res) => {
  await backfillInventory();
  const [inventory, products] = await Promise.all([
    Inventory.findAll({ order: [["productName", "ASC"]] }),
    Product.findAll(),
  ]);
  const prodMap = new Map(products.map((p) => [p.productId, p]));
  const payload = inventory.map((i) => toInventoryView(i, prodMap.get(i.productId)));
  return ApiResponse.success(res, payload, "Inventory records retrieved successfully");
});

/**
 * Set absolute stock / min alert / location for one product
 */
export const updateStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { currentStock, minStockAlert, warehouseLocation } = req.body;

  const item = await Inventory.findOne({ where: { productId } });
  if (!item) {
    throw ApiError.notFound(`Inventory record not found for product: ${productId}`);
  }

  // stock change ledger ke through jaaye (inward/outward bhi update ho)
  if (currentStock !== undefined) {
    const target = Math.max(0, Number(currentStock));
    const delta = target - Number(item.currentStock || 0);
    if (delta !== 0) {
      await applyStockChange(productId, delta, { location: warehouseLocation });
    }
  }

  const fresh = await Inventory.findOne({ where: { productId } });
  if (minStockAlert !== undefined) fresh.minStockAlert = Number(minStockAlert);
  if (warehouseLocation !== undefined) fresh.warehouseLocation = warehouseLocation;
  fresh.lastUpdated = new Date();
  await fresh.save();

  if (minStockAlert !== undefined) {
    const prod = await Product.findOne({ where: { productId } });
    if (prod) {
      prod.extraData = { ...(prod.extraData || {}), minStock: Number(minStockAlert) };
      prod.changed("extraData", true);
      await prod.save();
    }
  }

  return ApiResponse.success(res, fresh, "Inventory updated successfully");
});

/**
 * Adjust stock: +inward / -outward
 * Body: { adjustment, warehouseLocation?, reason? }
 */
export const adjustStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { adjustment, warehouseLocation, reason } = req.body;

  const qty = Number(adjustment);
  if (isNaN(qty) || qty === 0) {
    throw ApiError.badRequest("adjustment must be a non-zero number (+inward / -outward)");
  }

  const { previousStock, newStock } = await applyStockChange(productId, qty, {
    location: warehouseLocation,
  });

  return ApiResponse.success(
    res,
    {
      productId,
      previousStock,
      adjustment: qty,
      newStock,
      reason: reason || (qty > 0 ? "Inward / Purchase" : "Outward / Sale"),
    },
    `Stock ${qty > 0 ? "increased" : "decreased"} successfully`
  );
});