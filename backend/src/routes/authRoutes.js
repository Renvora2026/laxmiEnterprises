import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  listUsers,
  createUser,
  deleteUser,
} from "../controllers/authController.js";
import { verifyAuth, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyAuth, getMe);
router.put("/profile", verifyAuth, updateProfile);
router.put("/password", verifyAuth, updatePassword);

// Team Member Management
router.get("/users", verifyAuth, listUsers);
router.post("/users", verifyAuth, authorizeRoles("admin"), createUser);
router.delete("/users/:id", verifyAuth, authorizeRoles("admin"), deleteUser);

export default router;

