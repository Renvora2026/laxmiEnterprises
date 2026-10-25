import { Inventory } from "../models/Inventory.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all inventory records
 */
export const getInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findAll({
    order: [["productName", "ASC"]],
  });
  return ApiResponse.success(res, inventory, "Inventory records retrieved successfully");
});

/**
 * Update stock for a specific product
 */
export const updateStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { currentStock, minStockAlert, warehouseLocation } = req.body;

  const item = await Inventory.findOne({ where: { productId } });
  if (!item) {
    throw ApiError.notFound(`Inventory record not found for product: ${productId}`);
  }

  if (currentStock !== undefined) item.currentStock = currentStock;
  if (minStockAlert !== undefined) item.minStockAlert = minStockAlert;
  if (warehouseLocation !== undefined) item.warehouseLocation = warehouseLocation;
  item.lastUpdated = new Date();

  await item.save();
  return ApiResponse.success(res, item, "Inventory updated successfully");
});
