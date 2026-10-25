import { Router } from "express";
import {
  getAllData,
  syncClients,
  syncInvoices,
  syncPurchases,
  syncProducts,
  syncInventory,
  syncExpoLeads,
  syncCompany,
} from "../controllers/syncController.js";

const router = Router();

router.get("/all", getAllData);
router.post("/clients", syncClients);
router.post("/invoices", syncInvoices);
router.post("/purchases", syncPurchases);
router.post("/products", syncProducts);
router.post("/inventory", syncInventory);
router.post("/expo", syncExpoLeads);
router.post("/company", syncCompany);

export default router;
