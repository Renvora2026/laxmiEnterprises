import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Purchase extends Model {
  toJSON() {
    const values = { ...this.get() };
    const extra = values.extraData || {};
    return {
      ...extra,
      ...values,
      id: values.purchaseId || values.id,
    };
  }
}

Purchase.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    purchaseId: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    vendorName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    vendorGstin: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    vendorContact: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    vendorInvoiceNo: {
      type: DataTypes.STRING(60),
      defaultValue: "",
    },
    date: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    category: {
      type: DataTypes.STRING(120),
      defaultValue: "Raw Feed & Supplies",
    },
    items: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    cgst: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    sgst: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    igst: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    grandTotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    paymentStatus: {
      type: DataTypes.STRING(30),
      defaultValue: "Pending",
    },
    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    paymentMode: {
      type: DataTypes.STRING(40),
      defaultValue: "NEFT/RTGS",
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
    modelName: "Purchase",
    tableName: "purchases",
    timestamps: true,
  }
);
