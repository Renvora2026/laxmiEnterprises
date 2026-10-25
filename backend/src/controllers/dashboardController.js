import { Client } from "../models/Client.js";
import { Invoice } from "../models/Invoice.js";
import { Purchase } from "../models/Purchase.js";
import { Inventory } from "../models/Inventory.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Op } from "sequelize";

/**
 * Get aggregated ERP KPIs for executive dashboard
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalClients, totalInvoices, totalPurchases, inventoryItems] = await Promise.all([
    Client.count(),
    Invoice.findAll({ attributes: ["grandTotal", "paidAmount", "balanceDue", "date"] }),
    Purchase.findAll({ attributes: ["grandTotal", "paidAmount", "date"] }),
    Inventory.findAll(),
  ]);

  // Aggregate Sales
  const grossSales = totalInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
  const totalCollections = totalInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount || 0), 0);
  const totalReceivables = totalInvoices.reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0);

  // Aggregate Purchases
  const grossPurchases = totalPurchases.reduce((sum, pur) => sum + Number(pur.grandTotal || 0), 0);

  // Inventory Health
  const totalStockItems = inventoryItems.length;
  const lowStockCount = inventoryItems.filter(
    (item) => Number(item.currentStock) <= Number(item.minStockAlert)
  ).length;

  return ApiResponse.success(
    res,
    {
      kpis: {
        totalClients,
        grossSales,
        totalCollections,
        totalReceivables,
        grossPurchases,
        totalStockItems,
        lowStockCount,
      },
    },
    "Dashboard statistics retrieved"
  );
});
