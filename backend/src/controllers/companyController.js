import { Company } from "../models/Company.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get company profile
 */
export const getCompanyProfile = asyncHandler(async (req, res) => {
  let [company] = await Company.findOrCreate({
    where: { id: 1 },
    defaults: {
      name: "Laxmi Enterprises",
    },
  });

  return ApiResponse.success(res, company, "Company profile retrieved");
});

/**
 * Update company profile
 */
export const updateCompanyProfile = asyncHandler(async (req, res) => {
  let [company] = await Company.findOrCreate({
    where: { id: 1 },
    defaults: {
      name: "Laxmi Enterprises",
    },
  });

  await company.update(req.body);
  return ApiResponse.success(res, company, "Company profile updated successfully");
});
