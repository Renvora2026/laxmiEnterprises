import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Register a new team member/user
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, designation } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw ApiError.badRequest("A user with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "admin",
    phone: phone || "",
    designation: designation || "Staff",
  });

  const token = user.generateAuthToken();

  return ApiResponse.created(
    res,
    { user: user.toSafeJSON(), token },
    "User registered successfully"
  );
});

/**
 * Login user & return JWT token
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest("Please provide both email and password");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Your account is deactivated. Contact an administrator.");
  }

  const token = user.generateAuthToken();

  return ApiResponse.success(
    res,
    { user: user.toSafeJSON(), token },
    "Login successful"
  );
});

/**
 * Get current authenticated user profile
 */
export const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, req.user, "User profile retrieved");
});

/**
 * Update authenticated user's profile (name, email, phone) in MySQL
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // If email is changing, ensure uniqueness
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      throw ApiError.badRequest("A user with this email address already exists");
    }
    user.email = email.toLowerCase().trim();
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  await user.save();

  // Generate a fresh token with updated claims
  const token = user.generateAuthToken();

  return ApiResponse.success(
    res,
    { user: user.toSafeJSON(), token },
    "Profile updated successfully in database"
  );
});

/**
 * Update authenticated user's password securely with bcrypt
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest("Please provide both current and new passwords");
  }

  if (newPassword.length < 6) {
    throw ApiError.badRequest("New password must be at least 6 characters long");
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest("Current password does not match");
  }

  user.password = newPassword;
  await user.save();

  const token = user.generateAuthToken();

  return ApiResponse.success(
    res,
    { user: user.toSafeJSON(), token },
    "Password changed and encrypted successfully in database"
  );
});

/**
 * List all users / team members
 */
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
  return ApiResponse.success(res, users, "Users retrieved successfully");
});

/**
 * Admin creates a team member in MySQL
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, designation } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest("Name, email and password are required");
  }

  const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    throw ApiError.badRequest("A user with this email address already exists");
  }

  const newUser = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: role || "sales",
    phone: phone || "",
    designation: designation || "Team Member",
  });

  return ApiResponse.created(res, newUser.toSafeJSON(), "Team member created in MySQL");
});

/**
 * Admin deletes a team member from MySQL
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (Number(id) === Number(req.user.id)) {
    throw ApiError.badRequest("You cannot delete your own primary administrator account");
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  await user.destroy();
  return ApiResponse.success(res, null, "User removed from database");
});

