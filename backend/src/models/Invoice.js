import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Invoice extends Model {
  toJSON() {
    const values = { ...this.get() };
    const extra = values.extraData || {};
    const grandTotal = Number(values.grandTotal ?? values.total ?? 0);
    const subtotal = Number(values.subtotal ?? values.amount ?? 0);
    const tax = Number(values.cgstTotal || 0) + Number(values.sgstTotal || 0) + Number(values.igstTotal || 0);

    return {
      ...extra,
      ...values,
      id: values.invoiceNumber || values.id,
      invoiceNo: values.invoiceNumber,
      total: grandTotal,
      amount: subtotal,
      tax: tax > 0 ? tax : Math.max(0, grandTotal - subtotal),
      status: values.paymentStatus || values.status || "Unpaid",
    };
  }
}

Invoice.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    clientId: {
      type: DataTypes.STRING(60),
      defaultValue: "",
    },
    clientName: {
      type: DataTypes.STRING(200),
      defaultValue: "",
    },
    clientType: {
      type: DataTypes.STRING(60),
      defaultValue: "Farmers",
    },
    clientGstin: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    clientContact: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    clientAddress: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    date: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    dueDate: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    items: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    cgstTotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    sgstTotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    igstTotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    discountTotal: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    grandTotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    paymentStatus: {
      type: DataTypes.STRING(30),
      defaultValue: "Unpaid",
    },
    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    balanceDue: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    paymentMode: {
      type: DataTypes.STRING(40),
      defaultValue: "Cash",
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
    modelName: "Invoice",
    tableName: "invoices",
    timestamps: true,
  }
);
