import { Product } from "../models/Product.js";
import { Inventory } from "../models/Inventory.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all products
 */
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    order: [["createdAt", "DESC"]],
  });
  return ApiResponse.success(res, products, "Products retrieved successfully");
});

/**
 * Create a new product
 */
export const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;

  if (!productData.productId) {
    const count = await Product.count();
    productData.productId = `PRD-${String(count + 1).padStart(3, "0")}`;
  }

  const existing = await Product.findOne({ where: { productId: productData.productId } });
  if (existing) {
    throw ApiError.badRequest(`Product ID ${productData.productId} already exists`);
  }

  const product = await Product.create(productData);

  // Automatically create inventory record
  await Inventory.findOrCreate({
    where: { productId: product.productId },
    defaults: {
      productId: product.productId,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      currentStock: 0,
      minStockAlert: 10,
    },
  });

  return ApiResponse.created(res, product, "Product created successfully");
});

/**
 * Update an existing product
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ where: { productId: id } });

  if (!product) {
    throw ApiError.notFound(`Product not found with id: ${id}`);
  }

  await product.update(req.body);

  // Sync name/category/unit in inventory
  await Inventory.update(
    {
      productName: product.name,
      category: product.category,
      unit: product.unit,
    },
    { where: { productId: id } }
  );

  return ApiResponse.success(res, product, "Product updated successfully");
});

/**
 * Delete a product
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ where: { productId: id } });

  if (!product) {
    throw ApiError.notFound(`Product not found with id: ${id}`);
  }

  await product.destroy();
  await Inventory.destroy({ where: { productId: id } });

  return ApiResponse.success(res, null, "Product deleted successfully");
});
