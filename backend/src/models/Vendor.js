import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Vendor extends Model {
  toJSON() {
    const values = { ...this.get() };
    const extra = values.extraData || {};
    return {
      ...extra,
      ...values,
      id: values.vendorId || values.id,
      vendorId: values.vendorId || values.id,
    };
  }
}

Vendor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendorId: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING(200),
      defaultValue: "",
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: "Animal Feed Shop",
    },
    contactPerson: {
      type: DataTypes.STRING(120),
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
    gstin: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    pan: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    village: {
      type: DataTypes.STRING(120),
      defaultValue: "",
    },
    taluka: {
      type: DataTypes.STRING(120),
      defaultValue: "",
    },
    district: {
      type: DataTypes.STRING(120),
      defaultValue: "",
    },
    city: {
      type: DataTypes.STRING(120),
      defaultValue: "",
    },
    state: {
      type: DataTypes.STRING(120),
      defaultValue: "Maharashtra",
    },
    pincode: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    address: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    bankName: {
      type: DataTypes.STRING(120),
      defaultValue: "",
    },
    accountNumber: {
      type: DataTypes.STRING(60),
      defaultValue: "",
    },
    ifscCode: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    paymentTerms: {
      type: DataTypes.STRING(60),
      defaultValue: "Net 15 Days",
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: "Active",
    },
    totalPurchases: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    outstandingPayable: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    extraData: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Vendor",
    tableName: "vendors",
    timestamps: true,
  }
);

