import { Op } from "sequelize";
import { Vendor } from "../models/Vendor.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all vendors with optional filtering
 */
export const getVendors = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const where = {};

  if (category && category !== "All") {
    where.category = category;
  }

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    where[Op.or] = [
      { name: { [Op.like]: q } },
      { companyName: { [Op.like]: q } },
      { vendorId: { [Op.like]: q } },
      { phone: { [Op.like]: q } },
      { contactPerson: { [Op.like]: q } },
      { city: { [Op.like]: q } },
      { village: { [Op.like]: q } },
      { gstin: { [Op.like]: q } },
    ];
  }

  const vendors = await Vendor.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  return ApiResponse.success(res, vendors, "Vendors retrieved successfully");
});

/**
 * Get single vendor by vendorId or id
 */
export const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findOne({
    where: {
      [Op.or]: [
        { vendorId: id },
        ...(isNaN(id) ? [] : [{ id: Number(id) }]),
      ],
    },
  });

  if (!vendor) {
    throw ApiError.notFound(`Vendor not found with identifier: ${id}`);
  }

  return ApiResponse.success(res, vendor, "Vendor retrieved successfully");
});

/**
 * Create a new vendor
 */
export const createVendor = asyncHandler(async (req, res) => {
  const vendorData = req.body;

  if (!vendorData.name || !vendorData.name.trim()) {
    throw ApiError.badRequest("Vendor name is required");
  }

  // Auto-generate vendorId if not provided (e.g. VEN-001)
  if (!vendorData.vendorId) {
    const count = await Vendor.count();
    vendorData.vendorId = `VEN-${String(count + 1).padStart(3, "0")}`;
  }

  const existing = await Vendor.findOne({ where: { vendorId: vendorData.vendorId } });
  if (existing) {
    throw ApiError.badRequest(`Vendor ID ${vendorData.vendorId} already exists`);
  }

  const vendor = await Vendor.create(vendorData);
  return ApiResponse.created(res, vendor, "Vendor registered successfully");
});

/**
 * Update an existing vendor
 */
export const updateVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findOne({
    where: {
      [Op.or]: [
        { vendorId: id },
        ...(isNaN(id) ? [] : [{ id: Number(id) }]),
      ],
    },
  });

  if (!vendor) {
    throw ApiError.notFound(`Vendor not found with identifier: ${id}`);
  }

  await vendor.update(req.body);
  return ApiResponse.success(res, vendor, "Vendor updated successfully");
});

/**
 * Delete a vendor
 */
export const deleteVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findOne({
    where: {
      [Op.or]: [
        { vendorId: id },
        ...(isNaN(id) ? [] : [{ id: Number(id) }]),
      ],
    },
  });

  if (!vendor) {
    throw ApiError.notFound(`Vendor not found with identifier: ${id}`);
  }

  await vendor.destroy();
  return ApiResponse.success(res, null, "Vendor deleted successfully");
});

