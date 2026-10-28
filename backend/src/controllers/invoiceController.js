import { Op } from "sequelize";
import { Invoice } from "../models/Invoice.js";
import { Inventory } from "../models/Inventory.js";
import { Client } from "../models/Client.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { applyStockChange } from "../utils/stockSync.js";

export const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.findAll({ order: [["createdAt", "DESC"]] });
  return ApiResponse.success(res, invoices, "Invoices retrieved successfully");
});

/**
 * Create a new GST sales tax invoice
 */
export const createInvoice = asyncHandler(async (req, res) => {
  const invoiceData = req.body;

  if (!invoiceData.invoiceNumber) {
    const count = await Invoice.count();
    invoiceData.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
  }

  const existing = await Invoice.findOne({ where: { invoiceNumber: invoiceData.invoiceNumber } });
  if (existing) {
    throw ApiError.badRequest(`Invoice ${invoiceData.invoiceNumber} already exists`);
  }

  // Stock check PEHLE (invoice create hone se pehle)
  const stockLines = [];
  if (Array.isArray(invoiceData.items)) {
    for (const item of invoiceData.items) {
      const prodId = item.productId || item.id;
      const quantity = Number(item.qty ?? item.quantity ?? 0);
      if (!prodId || quantity <= 0) continue;

      const inv = await Inventory.findOne({ where: { productId: prodId } });
      if (!inv) continue;

      const available = Number(inv.currentStock || 0);
      if (available < quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for ${inv.productName}: available ${available}, requested ${quantity}`
        );
      }
      stockLines.push({ prodId, quantity });
    }
  }

  const grandTotal = Number(invoiceData.grandTotal || 0);
  const paidAmount = Number(invoiceData.paidAmount || 0);
  const balanceDue = Math.max(0, grandTotal - paidAmount);
  invoiceData.balanceDue = balanceDue;

  if (balanceDue === 0 && grandTotal > 0) {
    invoiceData.paymentStatus = "Paid";
  } else if (paidAmount > 0) {
    invoiceData.paymentStatus = "Partial";
  } else {
    invoiceData.paymentStatus = "Unpaid";
  }

  const invoice = await Invoice.create(invoiceData);

  // Stock OUT (Inventory + Product extraData dono sync)
  for (const { prodId, quantity } of stockLines) {
    await applyStockChange(prodId, -quantity);
  }

  // Client metrics
  if (invoiceData.clientId) {
    const client = await Client.findOne({ where: { clientId: invoiceData.clientId } });
    if (client) {
      client.orders = Number(client.orders || 0) + 1;
      client.revenue = Number(client.revenue || 0) + grandTotal;
      if (balanceDue > 0) {
        client.outstandingBalance = Number(client.outstandingBalance || 0) + balanceDue;
      }
      await client.save();
    }
  }

  return ApiResponse.created(res, invoice, "Sales Invoice created successfully");
});

export const recordPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentAmount, paymentMode } = req.body;

  const invoice = await Invoice.findOne({ where: { invoiceNumber: id } });
  if (!invoice) {
    throw ApiError.notFound(`Invoice not found with number: ${id}`);
  }

  const amount = Number(paymentAmount || 0);
  if (amount <= 0) {
    throw ApiError.badRequest("Payment amount must be greater than 0");
  }

  const currentPaid = Number(invoice.paidAmount || 0);
  const grandTotal = Number(invoice.grandTotal || 0);
  const newPaid = currentPaid + amount;
  const newBalance = Math.max(0, grandTotal - newPaid);

  invoice.paidAmount = newPaid;
  invoice.balanceDue = newBalance;
  invoice.paymentStatus = newBalance === 0 ? "Paid" : "Partial";
  if (paymentMode) invoice.paymentMode = paymentMode;
  await invoice.save();

  if (invoice.clientId) {
    const client = await Client.findOne({ where: { clientId: invoice.clientId } });
    if (client) {
      client.outstandingBalance = Math.max(0, Number(client.outstandingBalance || 0) - amount);
      await client.save();
    }
  }

  return ApiResponse.success(res, invoice, "Payment recorded successfully");
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoice = await Invoice.findOne({
    where: {
      [Op.or]: [{ invoiceNumber: id }, ...(isNaN(id) ? [] : [{ id: Number(id) }])],
    },
  });
  if (!invoice) {
    throw ApiError.notFound(`Invoice not found with number: ${id}`);
  }
  await invoice.destroy();
  return ApiResponse.success(res, null, "Invoice deleted successfully");
});