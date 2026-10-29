import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Purchase extends Model {
  toJSON() {
    const values = { ...this.get() };
    const extra = values.extraData || {};
    const grandTotal = Number(values.grandTotal ?? values.total ?? values.totalAmount ?? 0);
    const subtotal = Number(values.subtotal ?? values.amount ?? values.taxableAmount ?? 0);
    const paidAmount = Number(values.paidAmount ?? 0);
    const balanceDue = Number(values.balanceDue ?? Math.max(0, grandTotal - paidAmount));
    const status = values.paymentStatus || values.status || "Pending";

    return {
      ...extra,
      ...values,
      id: values.purchaseId || values.id,
      purchaseId: values.purchaseId || values.id,
      totalAmount: grandTotal,
      total: grandTotal,
      grandTotal: grandTotal,
      taxableAmount: subtotal,
      amount: subtotal,
      subtotal: subtotal,
      paidAmount: paidAmount,
      balanceDue: balanceDue,
      paymentStatus: status,
      status: status,
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
    vendorId: {
      type: DataTypes.STRING(60),
      defaultValue: "",
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
