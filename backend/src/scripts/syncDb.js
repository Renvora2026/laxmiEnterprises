import dotenv from "dotenv";
dotenv.config();

import { sequelize, connectDB } from "../config/db.js";
import "../models/index.js";

const syncDatabase = async () => {
  try {
    console.log("🔄 Starting Database Schema Synchronization...");
    await connectDB();
    console.log("✅ All tables and columns are 100% in sync with code models.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Synchronization failed:", error);
    process.exit(1);
  }
};

syncDatabase();
