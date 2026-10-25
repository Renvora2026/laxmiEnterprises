import { sequelize } from "../config/db.js";
import { User } from "./User.js";
import { Client } from "./Client.js";
import { Product } from "./Product.js";
import { Inventory } from "./Inventory.js";
import { Purchase } from "./Purchase.js";
import { Invoice } from "./Invoice.js";
import { ExpoLead } from "./ExpoLead.js";
import { Company } from "./Company.js";

// Establish relational graph between entities
Client.hasMany(Invoice, {
  foreignKey: "clientId",
  sourceKey: "clientId",
  as: "invoices",
  constraints: false,
});
Invoice.belongsTo(Client, {
  foreignKey: "clientId",
  targetKey: "clientId",
  as: "client",
  constraints: false,
});

Product.hasOne(Inventory, {
  foreignKey: "productId",
  sourceKey: "productId",
  as: "inventory",
  constraints: false,
});
Inventory.belongsTo(Product, {
  foreignKey: "productId",
  targetKey: "productId",
  as: "product",
  constraints: false,
});

export {
  sequelize,
  User,
  Client,
  Product,
  Inventory,
  Purchase,
  Invoice,
  ExpoLead,
  Company,
};
