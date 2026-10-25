import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Inventory extends Model {
  toJSON() {
    const values = { ...this.get() };
    const extra = values.extraData || {};
    const stockVal = Number(values.currentStock ?? values.stock ?? 0);
    return {
      ...extra,
      ...values,
      id: values.productId || values.id,
      productId: values.productId || values.id,
      product: values.productName || values.product || "",
      productName: values.productName || values.product || "",
      sku: values.sku || values.productId || "",
      in: Number(values.in ?? values.inwardStock ?? 0),
      out: Number(values.out ?? values.outwardStock ?? 0),
      stock: stockVal,
      currentStock: stockVal,
      location: values.warehouseLocation || values.location || "Warehouse A",
      warehouseLocation: values.warehouseLocation || values.location || "Warehouse A",
      status: values.status || (stockVal <= 0 ? "Out of Stock" : stockVal <= 10 ? "Low Stock" : "In Stock")
    };
  }
}

Inventory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(120),
      defaultValue: "General",
    },
    unit: {
      type: DataTypes.STRING(30),
      defaultValue: "Bags",
    },
    currentStock: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    minStockAlert: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 10.0,
    },
    warehouseLocation: {
      type: DataTypes.STRING(150),
      defaultValue: "Main Warehouse",
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    extraData: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Inventory",
    tableName: "inventory",
    timestamps: true,
  }
);
