import { Router } from "express";
import {
  getCompanyProfile,
  updateCompanyProfile,
} from "../controllers/companyController.js";

const router = Router();

router.get("/", getCompanyProfile);
router.put("/", updateCompanyProfile);

export default router;
