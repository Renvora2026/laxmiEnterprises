import dotenv from "dotenv";
dotenv.config();

import { sequelize, User, Client, Product, Inventory, Purchase, Invoice, ExpoLead, Company } from "../models/index.js";

/**
 * Clean Database Setup
 * Ensures no dummy, seeded, or mock data exists.
 * Preserves or creates the Administrator account and clean Company profile.
 */
const resetToCleanDatabase = async () => {
  try {
    console.log("🔌 Connecting to MySQL database...");
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    // 1. Clear all dummy records
    await Promise.all([
      Client.destroy({ where: {}, truncate: false }),
      Product.destroy({ where: {}, truncate: false }),
      Inventory.destroy({ where: {}, truncate: false }),
      Purchase.destroy({ where: {}, truncate: false }),
      Invoice.destroy({ where: {}, truncate: false }),
      ExpoLead.destroy({ where: {}, truncate: false }),
    ]);
    console.log("🧹 Cleared all dummy records from tables: clients, products, inventory, purchases, invoices, expo_leads.");

    // 2. Ensure default Admin account exists
    const [admin, adminCreated] = await User.findOrCreate({
      where: { email: "admin@laxmienterprises.com" },
      defaults: {
        name: "Enterprise Administrator",
        email: "admin@laxmienterprises.com",
        password: "Admin@123",
        role: "admin",
        phone: "+91 98220 12345",
        designation: "Administrator",
      },
    });

    if (adminCreated) {
      console.log("👤 Default Administrator created: admin@laxmienterprises.com / Admin@123");
    } else {
      console.log("👤 Administrator account verified.");
    }

    // 3. Ensure Company Profile exists
    await Company.findOrCreate({
      where: { id: 1 },
      defaults: {
        name: "Laxmi Enterprises",
        tagline: "Industrial Supplies, Hardware, Agro Supplies & Trading Portal",
        address: "Baramati, Dist. Pune, Maharashtra 413102",
        gstin: "27AAACL1234F1Z5",
        pan: "AAACL1234F",
        phone: "+91 98220 12345",
        email: "contact@laxmienterprises.com",
      },
    });
    console.log("🏢 Company profile verified.");

    console.log("\n✅ Database is now 100% clean with zero dummy data! Ready for live enterprise data.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database reset error:", error);
    process.exit(1);
  }
};

resetToCleanDatabase();
