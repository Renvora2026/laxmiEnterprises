import { ApiError } from "../utils/apiError.js";

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Sequelize Unique Constraint Error
  if (err.name === "SequelizeUniqueConstraintError") {
    const fields = err.errors?.map((e) => e.path).join(", ");
    const message = `Duplicate value for field(s): ${fields}. Value must be unique.`;
    error = new ApiError(400, message, err.errors?.map((e) => e.message));
  }

  // Handle Sequelize Validation Error
  if (err.name === "SequelizeValidationError") {
    const messages = err.errors?.map((e) => e.message) || [];
    error = new ApiError(400, "Validation Error", messages);
  }

  // Handle Sequelize Database Connection Error
  if (
    err.name === "SequelizeConnectionError" ||
    err.name === "SequelizeConnectionRefusedError"
  ) {
    error = new ApiError(
      503,
      "Database connection failed. Please check your Hostinger MySQL credentials."
    );
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid authentication token");
  }

  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Authentication token has expired. Please login again.");
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    statusCode,
    message: error.message || "Internal Server Error",
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
};
