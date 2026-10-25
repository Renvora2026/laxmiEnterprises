import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Company extends Model {
  toJSON() {
    const values = { ...this.get() };
    const extra = values.extraData || {};
    return {
      ...extra,
      ...values,
    };
  }
}

Company.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      defaultValue: "Laxmi Enterprises",
    },
    tagline: {
      type: DataTypes.STRING(255),
      defaultValue: "Industrial Supplies, Hardware, Agro Supplies & Trading Portal",
    },
    address: {
      type: DataTypes.TEXT,
      defaultValue: "Indapur Road, Baramati, Dist. Pune, Maharashtra",
    },
    gstin: {
      type: DataTypes.STRING(30),
      defaultValue: "27AAACL1234F1Z5",
    },
    pan: {
      type: DataTypes.STRING(20),
      defaultValue: "AAACL1234F",
    },
    phone: {
      type: DataTypes.STRING(30),
      defaultValue: "+91 98220 12345",
    },
    email: {
      type: DataTypes.STRING(150),
      defaultValue: "contact@laxmienterprises.com",
    },
    currency: {
      type: DataTypes.STRING(20),
      defaultValue: "INR (₹)",
    },
    financialYear: {
      type: DataTypes.STRING(30),
      defaultValue: "FY 2026-27",
    },
    bankDetails: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    extraData: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Company",
    tableName: "company_profile",
    timestamps: true,
  }
);
