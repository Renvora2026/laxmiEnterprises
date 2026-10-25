import { ExpoLead } from "../models/ExpoLead.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all exhibition leads
 */
export const getLeads = asyncHandler(async (req, res) => {
  const leads = await ExpoLead.findAll({
    order: [["createdAt", "DESC"]],
  });
  return ApiResponse.success(res, leads, "Expo leads retrieved successfully");
});

/**
 * Create a new expo lead
 */
export const createLead = asyncHandler(async (req, res) => {
  const leadData = req.body;

  if (!leadData.leadId) {
    const count = await ExpoLead.count();
    leadData.leadId = `EXP-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
  }

  const existing = await ExpoLead.findOne({ where: { leadId: leadData.leadId } });
  if (existing) {
    throw ApiError.badRequest(`Lead ID ${leadData.leadId} already exists`);
  }

  const lead = await ExpoLead.create(leadData);
  return ApiResponse.created(res, lead, "Expo lead registered successfully");
});

/**
 * Update lead or broadcast status
 */
export const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lead = await ExpoLead.findOne({ where: { leadId: id } });

  if (!lead) {
    throw ApiError.notFound(`Lead not found with id: ${id}`);
  }

  await lead.update(req.body);
  return ApiResponse.success(res, lead, "Lead updated successfully");
});

/**
 * Mark WhatsApp broadcast sent
 */
export const markWhatsAppBroadcast = asyncHandler(async (req, res) => {
  const { ids } = req.body; // array of leadIds
  if (Array.isArray(ids) && ids.length > 0) {
    await ExpoLead.update(
      { whatsappBroadcastSent: true },
      { where: { leadId: ids } }
    );
  }
  return ApiResponse.success(res, null, "WhatsApp broadcast logged");
});
