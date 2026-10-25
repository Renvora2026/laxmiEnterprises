import { Router } from "express";
import {
  getLeads,
  createLead,
  updateLead,
  markWhatsAppBroadcast,
} from "../controllers/expoController.js";

const router = Router();

router.get("/", getLeads);
router.post("/", createLead);
router.put("/:id", updateLead);
router.post("/broadcast", markWhatsAppBroadcast);

export default router;
