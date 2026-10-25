import { Router } from "express";
import {
  getInvoices,
  createInvoice,
  recordPayment,
  deleteInvoice,
} from "../controllers/invoiceController.js";

const router = Router();

router.get("/", getInvoices);
router.post("/", createInvoice);
router.post("/:id/payment", recordPayment);
router.delete("/:id", deleteInvoice);

export default router;
