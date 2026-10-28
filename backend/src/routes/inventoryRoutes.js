import { Router } from "express";
import { getInventory, updateStock, adjustStock } from "../controllers/inventoryController.js";

const router = Router();

router.get("/", getInventory);
router.put("/:productId", updateStock);

// POST /inventory/:productId/adjust — increment (+) or decrement (-)
router.post("/:productId/adjust", adjustStock);

export default router;
