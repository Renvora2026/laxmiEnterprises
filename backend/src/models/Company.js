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
      defaultValue: "",
    },
    address: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    gstin: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    pan: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    phone: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING(150),
      defaultValue: "",
    },
    currency: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    financialYear: {
      type: DataTypes.STRING(30),
      defaultValue: "",
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
