import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class ExpoLead extends Model {
  toJSON() {
    const values = { ...this.get() };
    const extra = values.extraData || {};
    return {
      ...extra,
      ...values,
      id: values.leadId || values.id,
    };
  }
}

ExpoLead.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    leadId: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    expoName: {
      type: DataTypes.STRING(150),
      defaultValue: "AgroTech Kisan Mela",
    },
    visitorName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(60),
      defaultValue: "Farmer",
    },
    contact: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING(150),
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
    cattleCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    feedRequirement: {
      type: DataTypes.STRING(150),
      defaultValue: "",
    },
    equipmentInterest: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    followUpDate: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: "New",
    },
    whatsappBroadcastSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    modelName: "ExpoLead",
    tableName: "expo_leads",
    timestamps: true,
  }
);
