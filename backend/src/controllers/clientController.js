import { Client } from "../models/Client.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all clients with optional filtering
 */
export const getClients = asyncHandler(async (req, res) => {
  const { clientType, search } = req.query;
  const where = {};

  if (clientType && clientType !== "All") {
    where.clientType = clientType;
  }

  const clients = await Client.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  return ApiResponse.success(res, clients, "Clients retrieved successfully");
});

/**
 * Get single client by clientId or primary key
 */
export const getClientById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await Client.findOne({
    where: { clientId: id },
  });

  if (!client) {
    throw ApiError.notFound(`Client not found with id: ${id}`);
  }

  return ApiResponse.success(res, client, "Client retrieved successfully");
});

/**
 * Create a new client
 */
export const createClient = asyncHandler(async (req, res) => {
  const clientData = req.body;

  // Auto-generate clientId if missing
  if (!clientData.clientId) {
    const count = await Client.count();
    clientData.clientId = `CL-${String(count + 1).padStart(3, "0")}`;
  }

  const existing = await Client.findOne({ where: { clientId: clientData.clientId } });
  if (existing) {
    throw ApiError.badRequest(`Client ID ${clientData.clientId} already exists`);
  }

  const client = await Client.create(clientData);
  return ApiResponse.created(res, client, "Client created successfully");
});

/**
 * Update an existing client
 */
export const updateClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await Client.findOne({ where: { clientId: id } });

  if (!client) {
    throw ApiError.notFound(`Client not found with id: ${id}`);
  }

  await client.update(req.body);
  return ApiResponse.success(res, client, "Client updated successfully");
});

/**
 * Delete a client
 */
export const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const client = await Client.findOne({ where: { clientId: id } });

  if (!client) {
    throw ApiError.notFound(`Client not found with id: ${id}`);
  }

  await client.destroy();
  return ApiResponse.success(res, null, "Client deleted successfully");
});
