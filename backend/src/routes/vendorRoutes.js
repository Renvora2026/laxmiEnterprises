import { Router } from "express";
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../controllers/vendorController.js";

const router = Router();

router.get("/", getVendors);
router.get("/:id", getVendorById);
router.post("/", createVendor);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

export default router;

