import { Product } from "../models/Product.js";
import { Inventory } from "../models/Inventory.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all products (joined with Inventory for live stock)
 */
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.findAll({
    include: [{ model: Inventory, as: "inventory" }],
    order: [["createdAt", "DESC"]],
  });

  const payload = products.map((prod) => {
    const json = prod.toJSON();
    const liveStock = prod.inventory ? Number(prod.inventory.currentStock || 0) : Number(json.stock || 0);
    return { ...json, stock: liveStock, currentStock: liveStock };
  });

  return ApiResponse.success(res, payload, "Products retrieved successfully");
});

/**
 * Create a new product (+ linked inventory row)
 */
export const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body };

  // frontend "id" bhejta hai, backend "productId" use karta hai
  if (!productData.productId && productData.id) {
    productData.productId = String(productData.id);
  }
  if (!productData.productId) {
    const count = await Product.count();
    productData.productId = `PRD-${String(count + 1).padStart(3, "0")}`;
  }
  delete productData.id; // auto-increment PK ko mat chhedo

  const existing = await Product.findOne({ where: { productId: productData.productId } });
  if (existing) {
    throw ApiError.badRequest(`Product ID ${productData.productId} already exists`);
  }

  const opening = Number(productData.openingStock ?? 0);
  const inward = Number(productData.inwardStock ?? 0);
  const outward = Number(productData.outwardStock ?? 0);
  const reserved = Number(productData.reservedStock ?? 0);
  const hasBreakdown =
    productData.openingStock !== undefined || productData.inwardStock !== undefined;

  const initialStock = hasBreakdown
    ? Math.max(0, opening + inward - outward - reserved)
    : Number(productData.stock ?? 0);

  productData.extraData = {
    ...(productData.extraData || {}),
    stock: initialStock,
    // agar sirf "stock" aaya ho to usko opening maan lo, taaki formula balance rahe
    openingStock: hasBreakdown ? opening : initialStock,
    inwardStock: hasBreakdown ? inward : 0,
    outwardStock: outward,
    reservedStock: reserved,
    minStock: Number(productData.minStock ?? 20),
  };

  const product = await Product.create(productData);

  await Inventory.findOrCreate({
    where: { productId: product.productId },
    defaults: {
      productId: product.productId,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      currentStock: initialStock,
      minStockAlert: Number(productData.minStock ?? 10),
      warehouseLocation: productData.warehouseLocation || "Main Warehouse - Bay 01",
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

  const body = { ...req.body };
  delete body.id;
  delete body.productId;
  // extraData overwrite mat karo, merge karo
  if (body.extraData) {
    body.extraData = { ...(product.extraData || {}), ...body.extraData };
  }
  if (body.minStock !== undefined) {
    body.extraData = { ...(body.extraData || product.extraData || {}), minStock: Number(body.minStock) };
  }

  await product.update(body);

  await Inventory.update(
    {
      productName: product.name,
      category: product.category,
      unit: product.unit,
      ...(body.minStock !== undefined ? { minStockAlert: Number(body.minStock) } : {}),
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