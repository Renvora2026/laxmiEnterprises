import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Client extends Model {
  toJSON() {
    const values = { ...this.get() };
    return {
      ...values,
      id: values.clientId || values.id,
      outstanding: values.outstandingBalance ?? values.outstanding,
    };
  }
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientId: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    clientType: {
      type: DataTypes.STRING(60),
      defaultValue: "Farmers",
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING(120),
      defaultValue: "",
    },
    contact: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING(150),
      defaultValue: "",
    },
    dob: {
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
    address: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    pincode: {
      type: DataTypes.STRING(20),
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
    orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    revenue: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    outstandingBalance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    creditLimit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: "Active",
    },
    tier: {
      type: DataTypes.STRING(30),
      defaultValue: "Gold",
    },
    paymentTerms: {
      type: DataTypes.STRING(50),
      defaultValue: "Net 30",
    },
    // Dairy Specific
    milkQuantity: {
      type: DataTypes.STRING(100),
      defaultValue: "",
    },
    fatPercentage: {
      type: DataTypes.STRING(50),
      defaultValue: "",
    },
    snfPercentage: {
      type: DataTypes.STRING(50),
      defaultValue: "",
    },
    chillingCenter: {
      type: DataTypes.STRING(120),
      defaultValue: "",
    },
    routeNumber: {
      type: DataTypes.STRING(60),
      defaultValue: "",
    },
    collectionTiming: {
      type: DataTypes.STRING(60),
      defaultValue: "",
    },
    // Farmer Specific
    landAcres: {
      type: DataTypes.STRING(50),
      defaultValue: "",
    },
    cropTypes: {
      type: DataTypes.STRING(200),
      defaultValue: "",
    },
    soilType: {
      type: DataTypes.STRING(100),
      defaultValue: "",
    },
    irrigationSource: {
      type: DataTypes.STRING(120),
      defaultValue: "",
    },
    kisanCreditCard: {
      type: DataTypes.STRING(60),
      defaultValue: "",
    },
    subsidyScheme: {
      type: DataTypes.STRING(150),
      defaultValue: "",
    },
    animalDetails: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    numberOfAnimals: {
      type: DataTypes.STRING(50),
      defaultValue: "",
    },
    // Feed Shop Specific
    shopLicenseNumber: {
      type: DataTypes.STRING(100),
      defaultValue: "",
    },
    distributorName: {
      type: DataTypes.STRING(120),
      defaultValue: "",
    },
    territoryCoverage: {
      type: DataTypes.STRING(150),
      defaultValue: "",
    },
    storageCapacity: {
      type: DataTypes.STRING(100),
      defaultValue: "",
    },
    annualTurnover: {
      type: DataTypes.STRING(100),
      defaultValue: "",
    },
    primaryFeedCategory: {
      type: DataTypes.STRING(120),
      defaultValue: "",
    },
    productTypes: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    brands: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    companies: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Client",
    tableName: "clients",
    timestamps: true,
  }
);
