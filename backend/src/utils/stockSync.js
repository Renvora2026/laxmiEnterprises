import { Inventory } from "../models/Inventory.js";
import { Product } from "../models/Product.js";
import { ApiError } from "./apiError.js";

/**
 * Single place where stock changes happen.
 * delta > 0  => inward,  delta < 0 => outward
 * Updates Inventory.currentStock AND Product.extraData (stock / inwardStock / outwardStock)
 * so that: stock = opening + inward - outward - reserved always stays consistent.
 */
export async function applyStockChange(productId, delta, { location } = {}) {
  const qty = Number(delta) || 0;

  const prod = await Product.findOne({ where: { productId } });
  let inv = await Inventory.findOne({ where: { productId } });

  if (!inv) {
    if (!prod) {
      throw ApiError.notFound(`No product found for ID: ${productId}. Add it to the Product Catalogue first.`);
    }
    const ex = prod.extraData || {};
    inv = await Inventory.create({
      productId: prod.productId,
      productName: prod.name,
      category: prod.category,
      unit: prod.unit,
      currentStock: Number(ex.stock || 0),
      minStockAlert: Number(ex.minStock || 10),
      warehouseLocation: location || "Main Warehouse - Bay 01",
    });
  }

  const previousStock = Number(inv.currentStock || 0);
  const newStock = Math.max(0, previousStock + qty);
  const applied = newStock - previousStock; // real change after clamping

  inv.currentStock = newStock;
  inv.lastUpdated = new Date();
  if (location) inv.warehouseLocation = location;
  await inv.save();

  if (prod) {
    const ex = { ...(prod.extraData || {}) };
    ex.stock = newStock;
    if (applied > 0) ex.inwardStock = Number(ex.inwardStock || 0) + applied;
    if (applied < 0) ex.outwardStock = Number(ex.outwardStock || 0) + Math.abs(applied);
    prod.extraData = ex;
    prod.changed("extraData", true);
    await prod.save();
  }

  return { previousStock, newStock, applied };
}

/**
 * Inventory row + product breakdown => what the frontend table needs.
 * in  = opening + inward (gross received)
 * out = outward dispatched
 */
export function toInventoryView(inv, prod) {
  const json = inv.toJSON();
  const ex = (prod && prod.extraData) || {};
  const opening = Number(ex.openingStock || 0);
  const inward = Number(ex.inwardStock || 0);
  const outward = Number(ex.outwardStock || 0);
  return {
    ...json,
    in: opening + inward,
    out: outward,
    openingStock: opening,
    inwardStock: inward,
    outwardStock: outward,
    reservedStock: Number(ex.reservedStock || 0),
  };
}

/**
 * Old products that never got an inventory row (like PR-001) get one here.
 */
export async function backfillInventory() {
  const [products, inventory] = await Promise.all([
    Product.findAll(),
    Inventory.findAll({ attributes: ["productId"] }),
  ]);
  const have = new Set(inventory.map((i) => i.productId));

  for (const p of products) {
    if (have.has(p.productId)) continue;
    const ex = p.extraData || {};
    await Inventory.create({
      productId: p.productId,
      productName: p.name,
      category: p.category,
      unit: p.unit,
      currentStock: Number(ex.stock || 0),
      minStockAlert: Number(ex.minStock || 10),
      warehouseLocation: "Main Warehouse - Bay 01",
    });
  }
}