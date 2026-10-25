import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Product extends Model {
  toJSON() {
    const values = { ...this.get() };
    const extra = values.extraData || {};
    return {
      ...extra,
      ...values,
      id: values.productId || values.id,
    };
  }
}

Product.init(
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
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(120),
      defaultValue: "General",
    },
    sku: {
      type: DataTypes.STRING(60),
      defaultValue: "",
    },
    hsnCode: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    unit: {
      type: DataTypes.STRING(30),
      defaultValue: "Bags",
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    gstRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 18.0,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    extraData: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
  }
);
