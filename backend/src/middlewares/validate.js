import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

/**
 * Validates request according to express-validator rules
 * Throws 400 ApiError if errors are present
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(new ApiError(400, "Validation failed", extractedErrors));
  }
  next();
};
