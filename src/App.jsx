import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, IndianRupee, Package, Boxes, Menu, X,
  Bell, Search, TrendingUp, ShoppingCart, AlertTriangle, Plus,
  Pencil, Trash2, Download, Palette, Check, Copy, Sparkles, Building2,
  ShieldCheck, Save, Key, Lock, Mail, Phone, MapPin, Sliders, UserCheck,
  RefreshCw, FileText, CheckCircle2, Globe, Building, Filter, Layers,
  Barcode, Warehouse, Tag, Cloud, CloudUpload,
  FolderArchive, HardDrive, CreditCard, Calendar, ArrowUpRight, RotateCcw, Receipt, Shield, Award,
  LogOut, Eye, Milk, Tractor, Store, Wheat, MessageCircle, Sun, Moon,
  Calculator
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from "recharts";
import { generateInvoicePDF } from "./services/pdfService";
import {
  getDriveConfig,
  saveDriveConfig,
  getDriveFiles,
  connectGoogleDrive,
  disconnectGoogleDrive,
  deleteFileFromDrive,
  downloadDriveFile,
  backupAllDataToDrive,
  formatBytes
} from "./services/googleDriveService";
import GoogleDriveModal from "./components/GoogleDriveModal";
import ExportMenu from "./components/ExportMenu";
import DataHubPage from "./components/DataHubPage";
import InvoicesPage from "./components/InvoicesPage";
import InvoiceViewModal from "./components/InvoiceViewModal";
import InvoiceModal from "./components/InvoiceModal";
import PurchasesPage from "./components/PurchasesPage";
import ExpoPage from "./components/ExpoPage";
import LoginPage from "./components/LoginPage";
import CredentialsLedgerModal from "./components/CredentialsLedgerModal";
import ProductStockModal from "./components/ProductStockModal";
import InventoryViewDrawer from "./components/InventoryViewDrawer";
import { calculateProductStock } from "./services/stockService";
import {
  validateMobile,
  validateEmail,
  validateGSTIN,
  validatePAN,
  validateRequiredText,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateInteger,
  validateDate,
  validateUniqueId
} from "./utils/validators";
import { FieldError, RequiredStar, ValidationSummary } from "./components/ValidationFeedback";
import {
  getCurrentUser,
  logoutUser,
  getStoredCredentials
} from "./services/authService";

// Two color themes: Light and Dark
const THEMES = [
  {
    id: "light",
    name: "Light Mode",
    tagline: "Corporate Daylight Palette",
    colors: ["#005bb5", "#00b4d8", "#f8fafc"]
  },
  {
    id: "dark",
    name: "Dark Mode",
    tagline: "Executive Midnight Slate",
    colors: ["#090e17", "#38bdf8", "#0f192b"]
  }
];


const revenueData = [
  { month: "Jan", revenue: 120000 }, { month: "Feb", revenue: 145000 },
  { month: "Mar", revenue: 132000 }, { month: "Apr", revenue: 168000 },
  { month: "May", revenue: 190000 }, { month: "Jun", revenue: 215000 },
  { month: "Jul", revenue: 205000 }, { month: "Aug", revenue: 238000 },
  { month: "Sep", revenue: 252000 }, { month: "Oct", revenue: 275000 },
  { month: "Nov", revenue: 290000 }, { month: "Dec", revenue: 325000 }
];

const initialClients = [
  { 
    id: "CL-001", 
    clientType: "Animal Feed Shop",
    name: "Shree Samarth Animal Feed & Agro Traders", 
    contactPerson: "Dattatray Shinde",
    contact: "9822456789", 
    email: "samarth.feed@gmail.com", 
    dob: "1985-06-15",
    village: "Baramati Rural", 
    taluka: "Baramati", 
    district: "Pune", 
    city: "Pune", 
    productTypes: "Cattle Feed, Calf Starter, Mineral Mixture, Calcium Supplement, Maize Silage",
    companies: "Godrej Agrovet, Baramati Agro, Amul, Cargill India",
    brands: "Godrej MilkMore, Samruddhi Supreme, Kapila Gold, Amul Dan",
    numberOfAnimals: "550+ Local Cattle Network",
    gstin: "27AABCS1429B1Z2",
    tier: "Platinum",
    paymentTerms: "Net 30",
    outstanding: 32000,
    orders: 36, 
    revenue: 640000, 
    status: "Active",
    lastOrderDate: "2026-03-25"
  },
  { 
    id: "CL-002", 
    clientType: "Dairy",
    name: "Gokul Dudh Utpadak Sahakari Dairy", 
    contactPerson: "Sambhaji Patil",
    contact: "9850123456", 
    email: "gokul.dairy.karveer@gmail.com", 
    dob: "1980-04-20",
    village: "Kasaba Bawada", 
    taluka: "Karveer", 
    district: "Kolhapur", 
    city: "Kolhapur", 
    numberOfSuppliers: 92,
    milkQuantity: "4,500 Liters / Day",
    gstin: "27AAACM8821C1Z4",
    tier: "Platinum",
    paymentTerms: "Net 15",
    outstanding: 25000,
    orders: 48, 
    revenue: 980000, 
    status: "Active",
    lastOrderDate: "2026-03-28"
  },
  { 
    id: "CL-003", 
    clientType: "Farmers",
    name: "Tukaram Ramchandra Patil", 
    contactPerson: "Tukaram Patil",
    contact: "9764512390", 
    email: "tukaram.patil.farm@gmail.com", 
    dob: "1982-11-10",
    village: "Malegaon Khurd", 
    taluka: "Haveli", 
    district: "Pune", 
    city: "Pune", 
    numberOfAnimals: 18,
    animalDetails: "10 HF Crossbreed Cows, 5 Murrah Buffaloes, 3 Heifers",
    gstin: "27ABAPO9922K1Z9",
    tier: "Gold",
    paymentTerms: "Immediate",
    outstanding: 0,
    orders: 22, 
    revenue: 380000, 
    status: "Active",
    lastOrderDate: "2026-03-20"
  },
  { 
    id: "CL-004", 
    clientType: "Animal Feed Shop",
    name: "Kisan Pashu Khadya Bhandar & Agencies", 
    contactPerson: "Vinod Jadhav",
    contact: "9898989898", 
    email: "kisanfeed.satara@gmail.com", 
    dob: "1988-08-14",
    village: "Waduj", 
    taluka: "Khatav", 
    district: "Satara", 
    city: "Satara", 
    productTypes: "Layer Feed, Broiler Mash, Mineral Mixture, Calcium Gel",
    companies: "Suguna, Baramati Agro, Venkateshwara",
    brands: "Suguna Prime, SuperFeed, NutriMash",
    numberOfAnimals: "340 Dairy Cattle",
    gstin: "27AALFS4412M1Z1",
    tier: "Silver",
    paymentTerms: "Net 45",
    outstanding: 28500,
    orders: 19, 
    revenue: 294000, 
    status: "Active",
    lastOrderDate: "2026-02-15"
  },
  { 
    id: "CL-005", 
    clientType: "Dairy",
    name: "Krishna Dudh Sankalan Kendra", 
    contactPerson: "Ganesh Shinde",
    contact: "9812345678", 
    email: "krishnadairy.palus@rediffmail.com", 
    dob: "1976-02-18",
    village: "Bhilawadi", 
    taluka: "Palus", 
    district: "Sangli", 
    city: "Sangli", 
    numberOfSuppliers: 68,
    milkQuantity: "2,800 Liters / Day",
    gstin: "27AAGAG7719L1Z6",
    tier: "Gold",
    paymentTerms: "Net 30",
    outstanding: 12000,
    orders: 29, 
    revenue: 585000, 
    status: "Active",
    lastOrderDate: "2026-03-12"
  },
  { 
    id: "CL-006", 
    clientType: "Farmers",
    name: "Baburao Ganpat Deshmukh", 
    contactPerson: "Baburao Deshmukh",
    contact: "9845123987", 
    email: "bgdeshmukh.farms@gmail.com", 
    dob: "1979-05-24",
    village: "Narayangaon", 
    taluka: "Junnar", 
    district: "Pune", 
    city: "Pune", 
    numberOfAnimals: 14,
    animalDetails: "8 Jersey Crossbreed Cows, 4 Murrah Buffaloes, 2 Calves",
    gstin: "27AAFFV1298E1Z8",
    tier: "Gold",
    paymentTerms: "Net 30",
    outstanding: 8000,
    orders: 18, 
    revenue: 345000, 
    status: "Active",
    lastOrderDate: "2026-02-26"
  },
  { 
    id: "CL-007", 
    clientType: "Animal Feed Shop",
    name: "Mahalaxmi Feed & Veterinary Store", 
    contactPerson: "Rajesh Agrawal",
    contact: "9922883344", 
    email: "mahalaxmi.feednagpur@gmail.com", 
    dob: "1986-10-04",
    village: "Butibori", 
    taluka: "Nagpur Rural", 
    district: "Nagpur", 
    city: "Nagpur", 
    productTypes: "Concentrate Pellets, TMR Bags, Calcium Gel, Silage",
    companies: "Godrej Agrovet, De Heus, Kapila",
    brands: "MilkKing, CalciBoost, De Heus Dairy",
    numberOfAnimals: "480 Cattle Network",
    gstin: "27AABPB5511D1ZX",
    tier: "Platinum",
    paymentTerms: "Net 30",
    outstanding: 45000,
    orders: 25, 
    revenue: 490000, 
    status: "Active",
    lastOrderDate: "2026-03-22"
  },
  { 
    id: "CL-008", 
    clientType: "Dairy",
    name: "Sahyadri Chilling & Milk Processing Unit", 
    contactPerson: "Pandurang Mane",
    contact: "9730445566", 
    email: "sahyadridairy.karad@yahoo.com", 
    dob: "1981-09-14",
    village: "Ogalewadi", 
    taluka: "Karad", 
    district: "Satara", 
    city: "Satara", 
    numberOfSuppliers: 110,
    milkQuantity: "5,600 Liters / Day",
    gstin: "27ABCPK3329Q1Z7",
    tier: "Platinum",
    paymentTerms: "Net 15",
    outstanding: 0,
    orders: 31, 
    revenue: 720000, 
    status: "Active",
    lastOrderDate: "2026-02-10"
  },
  { 
    id: "CL-009", 
    clientType: "Farmers",
    name: "Pandurang Vitthal Shinde", 
    contactPerson: "Pandurang Shinde",
    contact: "9822001122", 
    email: "shinde.dairyfarms@gmail.com", 
    dob: "1973-12-05",
    village: "Wakhari", 
    taluka: "Pandharpur", 
    district: "Solapur", 
    city: "Solapur", 
    numberOfAnimals: 22,
    animalDetails: "14 Buffaloes (Murrah & Jaffrabadi), 8 Cows (Gir & HF)",
    gstin: "27AAAFA8833J1Z3",
    tier: "Platinum",
    paymentTerms: "Immediate",
    outstanding: 28000,
    orders: 26, 
    revenue: 520000, 
    status: "Active",
    lastOrderDate: "2026-03-28"
  },
  { 
    id: "CL-010", 
    clientType: "Animal Feed Shop",
    name: "Shree Ganesh Agro & Pashu Ahar", 
    contactPerson: "Balasaheb Thorat",
    contact: "9850112233", 
    email: "ganeshpashuahar@gmail.com", 
    dob: "1989-03-30",
    village: "Belapur", 
    taluka: "Shrirampur", 
    district: "Ahmednagar", 
    city: "Ahmednagar", 
    productTypes: "Silage Bales, Concentrate Pellets, Mineral Blocks",
    companies: "Amul, Baramati Agro, Nutreco",
    brands: "Amul Nutri, GrowMax Cattle, OptiMilk",
    numberOfAnimals: "290 Cattle Network",
    gstin: "27AAKFD6644P1Z2",
    tier: "Bronze",
    paymentTerms: "Net 15",
    outstanding: 34000,
    orders: 14, 
    revenue: 215000, 
    status: "Inactive",
    lastOrderDate: "2026-01-20"
  },
  { 
    id: "CL-011", 
    clientType: "Dairy",
    name: "Bhairavnath Milk Producers Co-op", 
    contactPerson: "Anand Bhosale",
    contact: "9860334455", 
    email: "bhairavnath.milk@gmail.com", 
    dob: "1983-07-19",
    village: "Bawada", 
    taluka: "Indapur", 
    district: "Pune", 
    city: "Pune", 
    numberOfSuppliers: 74,
    milkQuantity: "3,100 Liters / Day",
    gstin: "27ABHPS2219K1Z5",
    tier: "Gold",
    paymentTerms: "Net 30",
    outstanding: 19500,
    orders: 24, 
    revenue: 460000, 
    status: "Active",
    lastOrderDate: "2026-03-08"
  },
  { 
    id: "CL-012", 
    clientType: "Farmers",
    name: "Suresh Mahadev Jadhav", 
    contactPerson: "Suresh Jadhav",
    contact: "9821556677", 
    email: "suresh.jadhavfarm@gmail.com", 
    dob: "1984-01-28",
    village: "Pangari", 
    taluka: "Man", 
    district: "Satara", 
    city: "Satara", 
    numberOfAnimals: 12,
    animalDetails: "7 HF Cows, 3 Buffaloes, 2 Calves",
    gstin: "27AAAFN1199F1Z0",
    tier: "Bronze",
    paymentTerms: "Immediate",
    outstanding: 0,
    orders: 12, 
    revenue: 195000, 
    status: "Inactive",
    lastOrderDate: "2025-12-14"
  }
];

const initialInvoices = [
  { id: "LE-INV-2026-001", clientName: "Shree Samarth Animal Feed & Agro Traders", clientId: "CL-001", date: "2026-03-28", dueDate: "2026-04-28", amount: 145000, tax: 26100, total: 171100, status: "Paid", paymentMethod: "NEFT / Bank Transfer", category: "Cattle Feed" },
  { id: "LE-INV-2026-002", clientName: "Gokul Dudh Utpadak Sahakari Dairy", clientId: "CL-002", date: "2026-03-25", dueDate: "2026-04-25", amount: 98000, tax: 17640, total: 115640, status: "Paid", paymentMethod: "UPI Commercial", category: "Milk Testing & Supplies" },
  { id: "LE-INV-2026-003", clientName: "Tukaram Ramchandra Patil", clientId: "CL-003", date: "2026-03-22", dueDate: "2026-04-22", amount: 125000, tax: 22500, total: 147500, status: "Paid", paymentMethod: "RTGS", category: "Mineral Feed & Supplements" },
  { id: "LE-INV-2026-004", clientName: "Kisan Pashu Khadya Bhandar & Agencies", clientId: "CL-004", date: "2026-03-18", dueDate: "2026-04-02", amount: 82000, tax: 14760, total: 96760, status: "Pending", paymentMethod: "Cheque (In Clearance)", category: "Poultry & Cattle Feed" },
  { id: "LE-INV-2026-005", clientName: "Krishna Dudh Sankalan Kendra", clientId: "CL-005", date: "2026-03-12", dueDate: "2026-04-12", amount: 74000, tax: 13320, total: 87320, status: "Paid", paymentMethod: "NEFT", category: "Dairy Equipment & Feed" },
  { id: "LE-INV-2026-006", clientName: "Baburao Ganpat Deshmukh", clientId: "CL-006", date: "2026-03-08", dueDate: "2026-04-08", amount: 62000, tax: 11160, total: 73160, status: "Paid", paymentMethod: "UPI Commercial", category: "Cattle Feed" },
  { id: "LE-INV-2026-007", clientName: "Mahalaxmi Feed & Veterinary Store", clientId: "CL-007", date: "2026-03-02", dueDate: "2026-03-17", amount: 55000, tax: 9900, total: 64900, status: "Paid", paymentMethod: "Direct Deposit", category: "Veterinary Tonics" },
  { id: "LE-INV-2026-008", clientName: "Sahyadri Chilling & Milk Processing Unit", clientId: "CL-008", date: "2026-02-26", dueDate: "2026-03-26", amount: 89000, tax: 16020, total: 105020, status: "Paid", paymentMethod: "RTGS", category: "Dairy Sanitizers & Feed" },
  { id: "LE-INV-2026-009", clientName: "Pandurang Vitthal Shinde", clientId: "CL-009", date: "2026-02-15", dueDate: "2026-03-15", amount: 48000, tax: 8640, total: 56640, status: "Overdue", paymentMethod: "Net 45 Invoice", category: "Cattle Feed" },
  { id: "LE-INV-2026-010", clientName: "Shree Ganesh Agro & Pashu Ahar", clientId: "CL-010", date: "2026-02-10", dueDate: "2026-02-25", amount: 38000, tax: 6840, total: 44840, status: "Paid", paymentMethod: "UPI Commercial", category: "Silage & Minerals" },
  { id: "LE-INV-2026-011", clientName: "Bhairavnath Milk Producers Co-op", clientId: "CL-011", date: "2026-01-20", dueDate: "2026-02-05", amount: 28000, tax: 5040, total: 33040, status: "Overdue", paymentMethod: "Pending Net 15", category: "Cattle Feed" },
  { id: "LE-INV-2026-012", clientName: "Suresh Mahadev Jadhav", clientId: "CL-012", date: "2026-01-14", dueDate: "2026-02-14", amount: 165000, tax: 29700, total: 194700, status: "Paid", paymentMethod: "RTGS", category: "Mineral Feed" }
];

const initialPurchases = [
  {
    id: "LE-PUR-2026-001",
    billNumber: "BILL-AF-9021",
    category: "Animal Feed Shop",
    vendorName: "Shree Samarth Animal Feed & Agro Traders",
    contactPerson: "Dattatray Shinde",
    village: "Baramati Rural",
    taluka: "Baramati",
    district: "Pune",
    contact: "9822456789",
    email: "samarth.feed@gmail.com",
    dob: "1985-06-15",
    productTypes: "Cattle Feed, Calf Starter, Mineral Mixture, Calcium Supplement, Maize Silage",
    companies: "Godrej Agrovet, Baramati Agro, Amul, Cargill India",
    brands: "Godrej MilkMore, Samruddhi Supreme, Kapila Gold, Amul Dan",
    numberOfAnimals: "550+ Local Cattle Network",
    feedQuantity: "350 Bags (50 kg each)",
    unitRate: 1450,
    date: "2026-04-02",
    dueDate: "2026-05-02",
    itemDescription: "High-Yield Cattle Feed (Godrej MilkMore 50kg Bags)",
    taxableAmount: 507500,
    gstRate: 5,
    gstAmount: 25375,
    totalAmount: 532875,
    paidAmount: 532875,
    balanceDue: 0,
    paymentStatus: "Paid",
    paymentMethod: "RTGS / Bank Transfer",
    remarks: "Direct delivery to Silo Receiving Bay 2"
  },
  {
    id: "LE-PUR-2026-002",
    billNumber: "BILL-DR-4102",
    category: "Dairy",
    vendorName: "Gokul Dudh Utpadak Sahakari Dairy",
    contactPerson: "Sambhaji Patil",
    village: "Kasaba Bawada",
    taluka: "Karveer",
    district: "Kolhapur",
    contact: "9850123456",
    email: "gokul.dairy.karveer@gmail.com",
    dob: "1980-04-20",
    numberOfSuppliers: 92,
    milkQuantity: "4,500 Liters / Day",
    fatPercent: 4.5,
    snfPercent: 8.8,
    ratePerLiter: 38.00,
    date: "2026-04-04",
    dueDate: "2026-04-19",
    itemDescription: "Bulk Chilled Raw Cow Milk Procurement",
    taxableAmount: 171000,
    gstRate: 0,
    gstAmount: 0,
    totalAmount: 171000,
    paidAmount: 171000,
    balanceDue: 0,
    paymentStatus: "Paid",
    paymentMethod: "Direct Bank Settlement",
    remarks: "Inspected at BMC Chilling Hub"
  },
  {
    id: "LE-PUR-2026-003",
    billNumber: "BILL-FRM-018",
    category: "Farmers",
    vendorName: "Tukaram Ramchandra Patil",
    contactPerson: "Tukaram Patil",
    village: "Malegaon Khurd",
    taluka: "Haveli",
    district: "Pune",
    contact: "9764512390",
    email: "tukaram.patil.farm@gmail.com",
    dob: "1982-11-10",
    numberOfAnimals: 18,
    animalDetails: "10 HF Crossbreed Cows, 5 Murrah Buffaloes, 3 Heifers",
    farmItemsSupplied: "Sweet Corn Silage Bales & Lucerne Hay",
    farmQuantity: "15 Tonnes",
    date: "2026-04-05",
    dueDate: "2026-04-05",
    itemDescription: "Farm Green Fodder & Sweet Silage Inward",
    taxableAmount: 67500,
    gstRate: 0,
    gstAmount: 0,
    totalAmount: 67500,
    paidAmount: 67500,
    balanceDue: 0,
    paymentStatus: "Paid",
    paymentMethod: "UPI Immediate",
    remarks: "Weighed at Dhankawadi weighbridge"
  },
  {
    id: "LE-PUR-2026-004",
    billNumber: "BILL-AF-9088",
    category: "Animal Feed Shop",
    vendorName: "Kisan Pashu Khadya Bhandar & Agencies",
    contactPerson: "Vinod Jadhav",
    village: "Sangamner City",
    taluka: "Sangamner",
    district: "Ahmednagar",
    contact: "9890123789",
    email: "kisan.feed.bhandar@gmail.com",
    dob: "1978-08-22",
    productTypes: "Poultry Mash, Broiler Feed, Mineral Mixture, Calcium Gel",
    companies: "Suguna Foods, Godrej Agrovet, Venkateshwara Hatcheries",
    brands: "Suguna Feed, Godrej GroMax, Venky Broiler",
    numberOfAnimals: "1,200 Broiler Batch + 280 Cattle",
    feedQuantity: "180 Bags",
    unitRate: 1350,
    date: "2026-03-29",
    dueDate: "2026-04-14",
    itemDescription: "Poultry & Cattle Feed Mix Inward",
    taxableAmount: 243000,
    gstRate: 5,
    gstAmount: 12150,
    totalAmount: 255150,
    paidAmount: 150000,
    balanceDue: 105150,
    paymentStatus: "Partial",
    paymentMethod: "NEFT",
    day1Amount: 150000,
    day1Date: "2026-03-29",
    day1Method: "NEFT",
    day1Ref: "NEFT-N08920155",
    day1Notes: "Day 1 advance token settled upon poultry feed arrival",
    installments: [],
    remarks: "Pending second installment"
  },
  {
    id: "LE-PUR-2026-005",
    billNumber: "BILL-DR-4190",
    category: "Dairy",
    vendorName: "Krishna Dudh Sankalan Kendra",
    contactPerson: "Anandrao Mohite",
    village: "Islampur Rural",
    taluka: "Walwa",
    district: "Sangli",
    contact: "9860345678",
    email: "krishna.dudh.sangli@gmail.com",
    dob: "1992-03-14",
    numberOfSuppliers: 65,
    milkQuantity: "2,800 Liters / Day",
    fatPercent: 4.1,
    snfPercent: 8.5,
    ratePerLiter: 37.50,
    date: "2026-03-26",
    dueDate: "2026-04-10",
    itemDescription: "Evening Raw Buffalo Milk Inward",
    taxableAmount: 105000,
    gstRate: 0,
    gstAmount: 0,
    totalAmount: 105000,
    paidAmount: 105000,
    balanceDue: 0,
    paymentStatus: "Paid",
    paymentMethod: "RTGS",
    remarks: "Quality passed, lactometer 29"
  },
  {
    id: "LE-PUR-2026-006",
    billNumber: "BILL-FRM-024",
    category: "Farmers",
    vendorName: "Baburao Ganpat Deshmukh",
    contactPerson: "Baburao Deshmukh",
    village: "Chakan Dehu Road",
    taluka: "Khed",
    district: "Pune",
    contact: "9823901234",
    email: "baburao.deshmukh.farms@gmail.com",
    dob: "1975-09-05",
    numberOfAnimals: 12,
    animalDetails: "7 Gir Cows, 5 Murrah Buffaloes",
    farmItemsSupplied: "Fermented Maize Silage & Jowar Kadbi",
    farmQuantity: "8.5 Tonnes",
    date: "2026-03-20",
    dueDate: "2026-03-20",
    itemDescription: "Organic Dairy Silage & Fodder Supply",
    taxableAmount: 42500,
    gstRate: 0,
    gstAmount: 0,
    totalAmount: 42500,
    paidAmount: 42500,
    balanceDue: 0,
    paymentStatus: "Paid",
    paymentMethod: "UPI Commercial",
    remarks: "Immediate farmer settlement"
  }
];

// Expo Leads & Exhibition Visitors initial dataset
const initialExpoLeads = [
  {
    id: "EXP-001",
    name: "Ramesh Dnyandev Patil",
    village: "Baramati Rural",
    mobile: "9822456789",
    remark: "Inquired for 350 bags Godrej MilkMore cattle feed, needs dealer price sheet & freight subsidy",
    category: "Animal Feed Shop",
    expoName: "Kisan Agri Expo 2026 - Pune",
    taluka: "Baramati",
    district: "Pune",
    date: "2026-04-03",
    status: "Interested",
    email: "ramesh.patil.feed@gmail.com"
  },
  {
    id: "EXP-002",
    name: "Sambhaji Narayan Patil",
    village: "Kasaba Bawada",
    mobile: "9850123456",
    remark: "Operating chilling center with 120 farmers; looking for automated fat/SNF testing kit and bulk feed supply",
    category: "Dairy",
    expoName: "Maha Dairy Mela 2026 - Kolhapur",
    taluka: "Karveer",
    district: "Kolhapur",
    date: "2026-04-04",
    status: "New Lead",
    email: "sambhaji.gokul@gmail.com"
  },
  {
    id: "EXP-003",
    name: "Tukaram Ramchandra Patil",
    village: "Malegaon Khurd",
    mobile: "9764512390",
    remark: "Owns 18 dairy cattle (10 HF + 5 Murrah); visited stall for sweet corn silage bales and mineral mixture",
    category: "Farmers",
    expoName: "Kisan Agri Expo 2026 - Pune",
    taluka: "Haveli",
    district: "Pune",
    date: "2026-04-05",
    status: "Followed Up",
    email: "tukaram.patil.farm@gmail.com"
  },
  {
    id: "EXP-004",
    name: "Vinod Bhausaheb Jadhav",
    village: "Sangamner City",
    mobile: "9890123789",
    remark: "Feed distributor requesting exclusive sub-agency for Godrej & Suguna feed bags in Sangamner taluka",
    category: "Animal Feed Shop",
    expoName: "Krishi Mahotsav 2026 - Baramati",
    taluka: "Sangamner",
    district: "Ahmednagar",
    date: "2026-04-06",
    status: "New Lead",
    email: "vinod.feed.agencies@gmail.com"
  },
  {
    id: "EXP-005",
    name: "Anandrao Shamrao Mohite",
    village: "Islampur Rural",
    mobile: "9860345678",
    remark: "Dairy procurement unit collecting 2,800L daily; interested in tied-up feed supply with milk settlement deduction",
    category: "Dairy",
    expoName: "Maha Dairy Mela 2026 - Kolhapur",
    taluka: "Walwa",
    district: "Sangli",
    date: "2026-04-07",
    status: "Interested",
    email: "anandrao.dudh@gmail.com"
  },
  {
    id: "EXP-006",
    name: "Dattatray Sopanrao Gophane",
    village: "Nimbut",
    mobile: "9921445566",
    remark: "Progressive dairy farmer with 14 HF cows; requested feed trial batch and calcium tonic sample",
    category: "Farmers",
    expoName: "Krishi Mahotsav 2026 - Baramati",
    taluka: "Baramati",
    district: "Pune",
    date: "2026-04-08",
    status: "Converted",
    email: "datta.gophane@gmail.com"
  }
];

const quarterlyRevenue = [
  { quarter: "Q1 FY26 (Apr-Jun)", revenue: 470000, target: 450000, growth: "+12.4%", margin: "24.2%" },
  { quarter: "Q2 FY26 (Jul-Sep)", revenue: 695000, target: 650000, growth: "+15.8%", margin: "26.5%" },
  { quarter: "Q3 FY26 (Oct-Dec)", revenue: 890000, target: 820000, growth: "+18.2%", margin: "28.1%" },
  { quarter: "Q4 FY26 (Jan-Mar)", revenue: 790000, target: 750000, growth: "+14.6%", margin: "27.4%" }
];

const categoryRevenue = [
  { name: "Hardware & Fasteners", value: 1728000, percent: 45, color: "var(--primary)" },
  { name: "Electrical Equipment", value: 1152000, percent: 30, color: "var(--accent)" },
  { name: "Mechanical & Valves", value: 652000, percent: 17, color: "#10b981" },
  { name: "Piping & Conduit", value: 308000, percent: 8, color: "#f59e0b" }
];

const monthlyFinancials = [
  { month: "Apr '25", invoiced: 140000, collected: 132000 },
  { month: "May '25", invoiced: 165000, collected: 158000 },
  { month: "Jun '25", invoiced: 165000, collected: 155000 },
  { month: "Jul '25", invoiced: 215000, collected: 198000 },
  { month: "Aug '25", invoiced: 238000, collected: 222000 },
  { month: "Sep '25", invoiced: 242000, collected: 235000 },
  { month: "Oct '25", invoiced: 285000, collected: 270000 },
  { month: "Nov '25", invoiced: 295000, collected: 280000 },
  { month: "Dec '25", invoiced: 310000, collected: 295000 },
  { month: "Jan '26", invoiced: 275000, collected: 250000 },
  { month: "Feb '26", invoiced: 290000, collected: 272000 },
  { month: "Mar '26", invoiced: 345000, collected: 318000 }
];

const initialProducts = [
  { id: "PR-001", name: "Industrial Pipe Set", category: "Hardware", price: 1250, openingStock: 0, inwardStock: 300, outwardStock: 155, reservedStock: 0, stock: 145, minStock: 30 },
  { id: "PR-002", name: "Steel Conduit B", category: "Hardware", price: 850, openingStock: 0, inwardStock: 150, outwardStock: 68, reservedStock: 0, stock: 82, minStock: 25 },
  { id: "PR-003", name: "Electrical Fitting Pro", category: "Electrical", price: 2450, openingStock: 0, inwardStock: 100, outwardStock: 82, reservedStock: 0, stock: 18, minStock: 20 },
  { id: "PR-004", name: "Fastener Box Heavy", category: "Hardware", price: 675, openingStock: 0, inwardStock: 400, outwardStock: 170, reservedStock: 0, stock: 230, minStock: 40 },
  { id: "PR-005", name: "Safety Valve V3", category: "Mechanical", price: 950, openingStock: 0, inwardStock: 100, outwardStock: 92, reservedStock: 0, stock: 8, minStock: 20 }
];

const initialInventory = [
  { id: "INV-001", product: "Industrial Pipe Set", sku: "LE-PIPE-01", in: 300, out: 155, stock: 145, status: "In Stock", location: "Warehouse A - Bay 12" },
  { id: "INV-002", product: "Steel Conduit B", sku: "LE-COND-02", in: 150, out: 68, stock: 82, status: "In Stock", location: "Warehouse A - Bay 14" },
  { id: "INV-003", product: "Electrical Fitting Pro", sku: "LE-ELEC-03", in: 100, out: 82, stock: 18, status: "Low Stock", location: "Warehouse B - Shelf 03" },
  { id: "INV-004", product: "Fastener Box Heavy", sku: "LE-FAST-04", in: 400, out: 170, stock: 230, status: "In Stock", location: "Warehouse A - Bay 08" },
  { id: "INV-005", product: "Safety Valve V3", sku: "LE-VALV-05", in: 100, out: 92, stock: 8, status: "Low Stock", location: "Warehouse B - Shelf 09" }
];

// Team Members for Role Permissions
const initialTeamMembers = [
  { id: "TM-001", name: "Chaitrali Shevtekar", email: "admin@laxmienterprises.com", role: "Super Administrator", status: "Active", lastLogin: "Just now" },
  { id: "TM-002", name: "Rahul Deshmukh", email: "rahul.ops@laxmienterprises.com", role: "Warehouse & Inventory", status: "Active", lastLogin: "2 hours ago" },
  { id: "TM-003", name: "Pooja Patil", email: "pooja.sales@laxmienterprises.com", role: "Commercial Sales", status: "Active", lastLogin: "Yesterday" },
  { id: "TM-004", name: "Amit Kulkarni", email: "amit.acc@laxmienterprises.com", role: "Tax & Accounts", status: "Active", lastLogin: "3 days ago" }
];

// Reusable CSV Export Helper
function downloadCSV(filename, headers, rows) {
  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function ThemeSelector({ currentTheme, onSelectTheme }) {
  const isDark = currentTheme === "dark" || currentTheme === "midnight";

  const handleToggle = () => {
    onSelectTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="theme-selector-wrap">
      <button 
        type="button"
        className="theme-pill-btn" 
        onClick={handleToggle}
        title={`Current: ${isDark ? "Dark Mode" : "Light Mode"}. Click to toggle.`}
        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}
      >
        {isDark ? (
          <>
            <Moon size={15} style={{ color: "#38bdf8" }} />
            <span className="theme-name-text">Dark Mode</span>
          </>
        ) : (
          <>
            <Sun size={15} style={{ color: "#f59e0b" }} />
            <span className="theme-name-text">Light Mode</span>
          </>
        )}
      </button>
    </div>
  );
}

function Layout({ children, currentTheme, onSelectTheme, adminProfile, driveConfig, onOpenDrive, currentUser, onLogout, onOpenCreds }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const titles = {
    "/": ["Enterprise Dashboard", "Live operations, revenue intelligence and stock alerts"],
    "/clients": ["Client Directory", "Enterprise accounts, real-time client management, orders and billing"],
    "/purchases": ["Purchase & Inward Procurement", "Animal feed stocks inward, raw milk procurement & farm direct receipts"],
    "/expo": ["Expo Leads & WhatsApp Broadcasting", "Stall visitors registry (Name, Village, Mobile & Remark) with 1-click bulk WhatsApp campaigns"],
    "/invoices": ["Tax Invoices & Billing", "Commercial GST tax invoices, billing ledger & PDF download"],
    "/revenue": ["Revenue Intelligence", "Track financial milestones, invoicing and gross earnings"],
    "/products": ["Product Catalogue", "Manage supplies, pricing tiers, stock levels & safety thresholds"],
    "/inventory": ["Inventory Logistics", "Track inward receipts, outward dispatches, SKU flow & bay storage"],
    "/data-hub": ["Data Hub & Cloud Sync", "Enterprise data registers, CSV exports & Google Drive cloud backup"],
    "/workspace": ["Admin Workspace", "Enterprise settings, company registry, access controls & system configuration"],
    "/login": ["Authentication & Security", "User credentials, access levels and secure enterprise register"]
  };
  const [title, subtitle] = titles[location.pathname] || titles["/"];

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/clients", label: "Clients", icon: Users },
    { to: "/purchases", label: "Purchases", icon: ShoppingCart },
    { to: "/expo", label: "Expo Leads", icon: MessageCircle },
    { to: "/invoices", label: "Invoices", icon: Receipt },
    { to: "/revenue", label: "Revenue", icon: IndianRupee },
    { to: "/products", label: "Products", icon: Package },
    { to: "/inventory", label: "Inventory", icon: Boxes },
    { to: "/workspace", label: "Admin Workspace", icon: ShieldCheck }
  ];

  return (
    <div className="app-shell">
      {/* SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        {/* BRAND HEADER WITH OFFICIAL LOGO */}
        <div className="brand">
          <div className="brand-logo-container">
            <img 
              src="/logo.png" 
              alt="Laxmi Enterprises Official Logo" 
              className="brand-logo-img" 
            />
          </div>
          <div className="brand-info">
            <strong className="brand-title">LAXMI</strong>
            <span className="brand-subtitle">ENTERPRISES</span>
          </div>
          <button className="mobile-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="nav-section-title">CORE OPERATIONS</div>
          {nav.slice(0, 4).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="nav-section-title" style={{ marginTop: 10 }}>FINANCIALS & INVENTORY</div>
          {nav.slice(4, 8).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="nav-section-title" style={{ marginTop: 10 }}>ENTERPRISE & WORKSPACE</div>
          {nav.slice(8).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* SYSTEM STATUS PILL (Fills empty vertical void gracefully on mobile) */}
          <div className="sidebar-status-card">
            <span className="sidebar-status-dot" />
            <div className="sidebar-status-text">
              <strong>Enterprise ERP Online</strong>
              <small>Cloud Synced & Protected</small>
            </div>
          </div>
        </nav>

        {/* SIDEBAR FOOTER - CLICKABLE ADMIN WORKSPACE SHORTCUT WITH LOGOUT */}
        <div className="sidebar-footer-wrapper">
          <NavLink
            to="/workspace"
            className="sidebar-footer-link"
            title="Open Admin Workspace"
            onClick={() => setOpen(false)}
          >
            <div className="sidebar-footer">
              <div className="profile-avatar">
                <ShieldCheck size={18} />
              </div>
              <div className="sidebar-footer-info">
                <b className="sidebar-footer-name">
                  {currentUser?.name || adminProfile.name}
                </b>
                <small className="sidebar-footer-role">
                  {currentUser?.role || adminProfile.role}
                </small>
              </div>
            </div>
          </NavLink>
          <button
            type="button"
            className="icon-btn sidebar-logout-btn"
            onClick={onLogout}
            title="Log Out & Switch User"
            aria-label="Log Out & Switch User"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* MAIN VIEWPORT */}
      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <div className="heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          
          <div className="top-actions">
            {/* Cloud Backup Vault Pill */}
            <button
              type="button"
              className="gdrive-topbar-pill connected"
              onClick={onOpenDrive}
              title="Open Cloud Backup Vault"
              style={{
                borderColor: "rgba(37, 99, 235, 0.35)",
                color: "#1d4ed8",
                background: "rgba(37, 99, 235, 0.08)"
              }}
            >
              <Cloud size={15} color="#2563eb" />
              <span className="gdrive-dot" style={{ background: "#10b981" }} />
              <span className="topbar-pill-text">Cloud Vault</span>
            </button>

            {/* User Credentials Access Register Pill */}
            <button
              type="button"
              className="gdrive-topbar-pill"
              onClick={onOpenCreds}
              title="View User Credentials Register"
              style={{
                borderColor: "rgba(0, 91, 181, 0.4)",
                color: "var(--primary)",
                background: "rgba(0, 91, 181, 0.08)"
              }}
            >
              <ShieldCheck size={15} color="var(--primary)" />
              <span className="topbar-pill-text">Access Register</span>
            </button>

            {/* Color Palette Switcher */}
            <ThemeSelector currentTheme={currentTheme} onSelectTheme={onSelectTheme} />

            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search records, SKUs..." />
            </div>

            <button className="icon-btn" title="Notifications">
              <Bell size={18} />
              <i></i>
            </button>

            {/* Topbar User Avatar Links to Workspace */}
            <NavLink
              to="/workspace"
              className="profile-avatar"
              style={{ width: 36, height: 36, fontSize: 13, textDecoration: "none", cursor: "pointer" }}
              title={`Logged in as ${currentUser?.name || adminProfile.name}`}
            >
              {(currentUser?.name || adminProfile.name || "LE").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </NavLink>

            {/* Topbar Log Out Button */}
            <button
              type="button"
              className="icon-btn"
              onClick={onLogout}
              title="Log Out of Portal"
              style={{ color: "var(--danger)" }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <section className="content">{children}</section>
      </main>

      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <NavLink to="/" end className={({ isActive }) => `mobile-bottom-item ${isActive ? "active" : ""}`}>
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/clients" className={({ isActive }) => `mobile-bottom-item ${isActive ? "active" : ""}`}>
          <Users size={20} />
          <span>Clients</span>
        </NavLink>
        <NavLink to="/purchases" className={({ isActive }) => `mobile-bottom-item ${isActive ? "active" : ""}`}>
          <ShoppingCart size={20} />
          <span>Procure</span>
        </NavLink>
        <NavLink to="/invoices" className={({ isActive }) => `mobile-bottom-item ${isActive ? "active" : ""}`}>
          <Receipt size={20} />
          <span>Invoices</span>
        </NavLink>
        <button
          type="button"
          className="mobile-bottom-item"
          onClick={() => setOpen(true)}
          aria-label="Open full menu"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, positive = true }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className="stat-icon">
          <Icon size={19} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className={positive ? "trend positive" : "trend negative"}>
        <TrendingUp size={14} />
        {change}
        <span> vs last month</span>
      </div>
    </div>
  );
}


function Dashboard({ clients, products, inventory, onExportMaster, onOpenDrive, adminProfile, driveConfig }) {
  // Connected reactively to live products and inventory state!
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const totalWarehouseUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const firstName = adminProfile?.name ? adminProfile.name.split(" ")[0] : "Chaitrali";

  // Donut chart calculated from live products
  const inStockCount = products.filter(p => p.stock > p.minStock).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const totalProdCount = products.length || 1;
  const inStockPercent = Math.round((inStockCount / totalProdCount) * 100);
  const lowStockPercent = Math.round((lowStockCount / totalProdCount) * 100);
  const outOfStockPercent = Math.max(0, 100 - inStockPercent - lowStockPercent);

  return (
    <div className="page">
      {/* EXECUTIVE WELCOME HERO BANNER */}
      <div className="welcome-hero-banner">
        <div className="welcome-hero-content">
          <div className="welcome-hero-pill">
            <span className="live-pulse-dot" />
            <span>Laxmi Enterprises ERP • Real-Time Operations</span>
          </div>
          <h2 className="welcome-hero-title">
            Good {greeting}, <span className="welcome-hero-name">{firstName}</span> 👋
          </h2>
          <p className="welcome-hero-desc">
            Welcome to your executive overview. Real-time telemetry, automated inventory checks, and continuous Google Drive cloud synchronization are active.
          </p>
          <div className="welcome-hero-tags">
            <span className="hero-stat-badge">
              <CheckCircle2 size={13} color="#10b981" /> System Operational
            </span>
            <span className="hero-stat-badge">
              <Cloud size={13} color="#00b4d8" /> Drive: {driveConfig?.isConnected ? "Auto-Sync Active" : "Sync Ready"}
            </span>
            <span className="hero-stat-badge">
              <Package size={13} color="var(--primary)" /> {products.length} Active SKUs
            </span>
            <span className="hero-stat-badge">
              <Users size={13} color="var(--accent)" /> {clients.length} Enterprise Clients
            </span>
          </div>
        </div>
        <div className="welcome-hero-actions">
          <button type="button" className="hero-btn-primary" onClick={onExportMaster}>
            <Download size={15} /> Export Master Backup
          </button>
          <button type="button" className="hero-btn-glass" onClick={onOpenDrive}>
            <Cloud size={15} /> Cloud Central
          </button>
        </div>
        <div className="welcome-hero-glow" />
      </div>

      <div className="page-actions" style={{ flexWrap: "wrap", gap: 10 }}>
        <span className="date-pill">Fiscal Year 2026-27 • Corporate Overview</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="outline"
            onClick={onOpenDrive}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}
          >
            <Cloud size={15} color="#2563eb" /> Google Drive Cloud
          </button>
          <button
            type="button"
            className="primary"
            onClick={onExportMaster}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}
          >
            <Download size={15} /> Export Master Backup (.json)
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="stats-grid">
        <StatCard title="Total Clients" value={String(clients.length)} change="+8.2%" icon={Users} />
        <StatCard title="Total Revenue" value="₹24.8L" change="+12.5%" icon={IndianRupee} />
        <StatCard title="Active Catalogue" value={`${products.length} Products`} change="+4.8%" icon={Package} />
        <StatCard title="Warehouse Units" value={totalWarehouseUnits.toLocaleString("en-IN")} change="-2.4%" icon={Boxes} positive={false} />
      </div>

      {/* CHARTS GRID */}
      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="card-head">
            <div>
              <h3>Revenue Performance Trajectory</h3>
              <p>Monthly gross business volume in Indian Rupees</p>
            </div>
            <select aria-label="Select year">
              <option>CY 2026 (Current)</option>
              <option>CY 2025</option>
            </select>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="brandRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.32} />
                    <stop offset="70%" stopColor="var(--accent)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tickFormatter={(v) => `₹${v / 1000}k`} 
                  fontSize={12} 
                />
                <Tooltip 
                  formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
                  contentStyle={{
                    background: "var(--card-bg)",
                    borderColor: "var(--border)",
                    borderRadius: "10px",
                    boxShadow: "var(--shadow-md)"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fill="url(#brandRevGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DONUT CHART */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Inventory Health</h3>
              <p>Proportion of operational catalogue</p>
            </div>
          </div>
          <div className="donut">
            <ResponsiveContainer width="100%" height={195}>
              <PieChart>
                <Pie 
                  data={[
                    { name: "In Stock", value: inStockCount || 1, color: "var(--primary)" },
                    { name: "Low Stock", value: lowStockCount, color: "var(--warning)" },
                    { name: "Out of Stock", value: outOfStockCount, color: "var(--danger)" }
                  ]} 
                  innerRadius={55} 
                  outerRadius={78} 
                  paddingAngle={4} 
                  dataKey="value"
                >
                  <Cell fill="var(--primary)" />
                  <Cell fill="var(--warning)" />
                  <Cell fill="var(--danger)" />
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: "var(--card-bg)",
                    borderColor: "var(--border)",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <b>{products.length}</b>
              <small>Products</small>
            </div>
          </div>
          <div className="legend">
            <span>
              <i className="dot" style={{ background: "var(--primary)" }}></i>
              In Stock <b>{inStockPercent}%</b>
            </span>
            <span>
              <i className="dot low" style={{ background: "var(--warning)" }}></i>
              Low Stock <b>{lowStockPercent}%</b>
            </span>
            <span>
              <i className="dot out" style={{ background: "var(--danger)" }}></i>
              Out of Stock <b>{outOfStockPercent}%</b>
            </span>
          </div>
        </div>
      </div>

      {/* LOWER DATA SECTION */}
      <div className="bottom-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Key Enterprise Accounts</h3>
              <p>Top volume purchasers this quarter</p>
            </div>
            <NavLink to="/clients" className="view-link">View all</NavLink>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Total Orders</th>
                  <th>Revenue (YTD)</th>
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 4).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="person">
                        <div className="mini-avatar">{c.name[0]}</div>
                        <b>{c.name}</b>
                      </div>
                    </td>
                    <td>{c.orders} orders</td>
                    <td className="money">₹{Number(c.revenue).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3>Stock Replenishment Triggers</h3>
              <p>SKUs at or below safety threshold</p>
            </div>
            <NavLink to="/inventory" className="view-link">View all</NavLink>
          </div>
          <div className="alert-list">
            {lowStockItems.length === 0 ? (
              <div style={{ padding: "16px 0", fontSize: 13, color: "var(--text-muted)" }}>
                ✓ All items currently above safety threshold.
              </div>
            ) : (
              lowStockItems.map((p) => (
                <div className="alert-row" key={p.id}>
                  <div className="alert-icon">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <b>{p.name}</b>
                    <small>Only {p.stock} units available (Threshold: {p.minStock})</small>
                  </div>
                  <span className="badge warning">Restock</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// REUSABLE DELETE CONFIRMATION MODAL
// ==========================================================================
function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, details }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: "var(--danger-light)" }}>
          <h3 style={{ color: "var(--danger)" }}>
            <AlertTriangle size={19} /> {title}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={17} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: 14 }}>
          <p style={{ fontSize: 14, color: "var(--text-main)", lineHeight: 1.5 }}>
            {message}
          </p>
          {details && (
            <div style={{ background: "var(--border-subtle)", padding: 12, borderRadius: 10, fontSize: 12, color: "var(--text-muted)" }}>
              {details}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            <Trash2 size={15} /> Yes, Delete Record
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// ==========================================================================
// CLIENT DETAILS PROFILE MODAL
// ==========================================================================
function ClientDetailsModal({ isOpen, onClose, client, onEdit, onCreateInvoice, onDelete }) {
  if (!isOpen || !client) return null;

  const getAge = (dobString) => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };
  const age = getAge(client.dob);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="mini-avatar" style={{ width: 44, height: 44, fontSize: 18, background: "var(--primary-light)", color: "var(--primary)", fontWeight: 800 }}>
              {client.name ? client.name[0] : "C"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: 17 }}>{client.name}</h3>
                <span className={`client-type-badge ${
                  client.clientType === "Dairy" ? "dairy" :
                  client.clientType === "Farmers" ? "farmers" : "feed-shop"
                }`}>
                  {client.clientType === "Dairy" ? <Milk size={13} /> :
                   client.clientType === "Farmers" ? <Tractor size={13} /> :
                   <Wheat size={13} />}
                  {client.clientType || "Animal Feed Shop"}
                </span>
                <span className={`badge ${client.status === "Active" ? "success" : "muted"}`} style={{ fontSize: 11 }}>
                  {client.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                Client ID: <code>{client.id}</code> | Tier: <b>{client.tier || "Gold"}</b> | Terms: <b>{client.paymentTerms || "Net 30"}</b>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={17} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Card 1: Common Information */}
          <div className="client-detail-card">
            <div className="client-detail-card-title">
              <Building2 size={15} style={{ color: "var(--primary)" }} />
              Common Client Information
            </div>
            <div className="client-details-grid">
              <div className="client-detail-row">
                <span className="client-detail-label">Client / Firm Name:</span>
                <span className="client-detail-val">{client.name}</span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">Contact Person / Proprietor:</span>
                <span className="client-detail-val">{client.contactPerson || "-"}</span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">Village (गाव):</span>
                <span className="client-detail-val" style={{ color: "var(--primary)", fontWeight: 700 }}>{client.village || "-"}</span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">Taluka (तालुका):</span>
                <span className="client-detail-val">{client.taluka || "-"}</span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">District (जिल्हा):</span>
                <span className="client-detail-val">{client.district || client.city || "-"}</span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">Contact Phone No.:</span>
                <span className="client-detail-val">
                  <a href={`tel:${client.contact}`} style={{ color: "var(--primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Phone size={12} /> {client.contact}
                  </a>
                </span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">Email Address:</span>
                <span className="client-detail-val">
                  {client.email ? (
                    <a href={`mailto:${client.email}`} style={{ color: "var(--primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Mail size={12} /> {client.email}
                    </a>
                  ) : "-"}
                </span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">Date of Birth (DOB):</span>
                <span className="client-detail-val">
                  {client.dob ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={12} /> {client.dob} {age !== null ? `(${age} years)` : ""}
                    </span>
                  ) : "-"}
                </span>
              </div>
              {client.gstin && (
                <div className="client-detail-row">
                  <span className="client-detail-label">GSTIN / Tax ID:</span>
                  <span className="client-detail-val" style={{ fontFamily: "monospace" }}>{client.gstin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Category-Specific Information */}
          <div className="client-detail-card" style={{
            borderColor: client.clientType === "Dairy" ? "rgba(2, 132, 199, 0.35)" :
                         client.clientType === "Farmers" ? "rgba(217, 119, 6, 0.35)" :
                         "rgba(16, 185, 129, 0.35)"
          }}>
            <div className="client-detail-card-title">
              {client.clientType === "Dairy" ? <Milk size={15} style={{ color: "#0284c7" }} /> :
               client.clientType === "Farmers" ? <Tractor size={15} style={{ color: "#d97706" }} /> :
               <Wheat size={15} style={{ color: "#059669" }} />}
              {client.clientType === "Dairy" ? "Dairy & Milk Collection Specific Information" :
               client.clientType === "Farmers" ? "Farmer & Livestock Specific Information" :
               "Animal Feed Shop Specific Information"}
            </div>

            {client.clientType === "Animal Feed Shop" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <Tag size={12} /> TYPES OF PRODUCTS SOLD:
                  </div>
                  <div>
                    {client.productTypes ? client.productTypes.split(",").map((p, i) => (
                      <span key={i} className="client-tag">{p.trim()}</span>
                    )) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>-</span>}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <Building size={12} /> COMPANIES SELLING PRODUCTS:
                  </div>
                  <div>
                    {client.companies ? client.companies.split(",").map((c, i) => (
                      <span key={i} className="client-tag company">{c.trim()}</span>
                    )) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>-</span>}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <Award size={12} /> SELLING BRANDS:
                  </div>
                  <div>
                    {client.brands ? client.brands.split(",").map((b, i) => (
                      <span key={i} className="client-tag brand">{b.trim()}</span>
                    )) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>-</span>}
                  </div>
                </div>

                {client.numberOfAnimals && (
                  <div className="client-detail-row" style={{ marginTop: 4, background: "rgba(16, 185, 129, 0.06)", padding: "10px 12px", borderRadius: 8 }}>
                    <span className="client-detail-label" style={{ color: "#059669", fontWeight: 700 }}>No. Of Animals Covered / Serviced:</span>
                    <span className="client-detail-val" style={{ color: "#059669", fontWeight: 800 }}>
                      {client.numberOfAnimals}
                    </span>
                  </div>
                )}
              </div>
            )}

            {client.clientType === "Dairy" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                <div style={{ background: "rgba(2, 132, 199, 0.08)", border: "1.5px solid rgba(2, 132, 199, 0.25)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>NUMBER OF SUPPLIERS</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#0284c7", marginTop: 4 }}>
                    {client.numberOfSuppliers || 0}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Registered Dairy Milk Suppliers</div>
                </div>

                <div style={{ background: "rgba(2, 132, 199, 0.08)", border: "1.5px solid rgba(2, 132, 199, 0.25)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>QUANTITY OF MILK</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#0284c7", marginTop: 4 }}>
                    {client.milkQuantity || "0 Liters"}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>Daily / Monthly Milk Intake</div>
                </div>
              </div>
            )}

            {client.clientType === "Farmers" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "rgba(217, 119, 6, 0.08)", border: "1.5px solid rgba(217, 119, 6, 0.25)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>NUMBER OF ANIMALS (LIVESTOCK COUNT)</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#d97706", marginTop: 2 }}>
                      {client.numberOfAnimals || 0} Animals
                    </div>
                  </div>
                  <Tractor size={38} style={{ color: "#d97706", opacity: 0.7 }} />
                </div>

                {client.animalDetails && (
                  <div className="client-detail-row" style={{ background: "var(--bg)", padding: "10px 12px", borderRadius: 8 }}>
                    <span className="client-detail-label">Livestock Breakdown & Details:</span>
                    <span className="client-detail-val" style={{ fontWeight: 700 }}>{client.animalDetails}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 3: Commercial & Billing Ledger */}
          <div className="client-detail-card">
            <div className="client-detail-card-title">
              <IndianRupee size={15} style={{ color: "var(--primary)" }} />
              Commercial & Billing Ledger
            </div>
            <div className="client-details-grid">
              <div className="client-detail-row">
                <span className="client-detail-label">Commercial Tier:</span>
                <span className="client-detail-val">
                  <span className={`tier-badge ${(client.tier || 'Gold').toLowerCase()}`}>
                    {client.tier || 'Gold'}
                  </span>
                </span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">Payment Terms Agreement:</span>
                <span className="client-detail-val">{client.paymentTerms || "Net 30"}</span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">Completed Orders:</span>
                <span className="client-detail-val"><b>{client.orders || 0}</b> orders</span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">Gross Billed Revenue:</span>
                <span className="client-detail-val" style={{ color: "var(--primary)", fontWeight: 800 }}>
                  ₹{Number(client.revenue || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="client-detail-row">
                <span className="client-detail-label">Outstanding Balance:</span>
                <span className="client-detail-val" style={{ color: Number(client.outstanding) > 0 ? "var(--danger)" : "var(--success)", fontWeight: 800 }}>
                  ₹{Number(client.outstanding || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" className="outline" onClick={onClose}>
              Close
            </button>
            {onDelete && (
              <button
                type="button"
                className="outline danger"
                onClick={() => onDelete(client)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--danger)",
                  borderColor: "var(--danger)",
                  background: "rgba(239, 68, 68, 0.06)"
                }}
                title="Delete this client account"
              >
                <Trash2 size={15} /> Delete Client
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {onCreateInvoice && (
              <button type="button" className="outline" onClick={() => onCreateInvoice(client)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Receipt size={15} /> Create Tax Invoice
              </button>
            )}
            {onEdit && (
              <button type="button" className="primary" onClick={() => onEdit(client)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Pencil size={15} /> Edit Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// CLIENT MODAL (ADD / EDIT) WITH 3 CATEGORIES
// ==========================================================================
function ClientModal({ isOpen, onClose, onSave, clientToEdit, nextId, existingIds = [] }) {
  if (!isOpen) return null;
  const isEditing = !!clientToEdit;

  const [form, setForm] = useState(() => {
    if (clientToEdit) {
      return { 
        ...clientToEdit,
        clientType: clientToEdit.clientType || "Animal Feed Shop",
        village: clientToEdit.village || "",
        taluka: clientToEdit.taluka || "",
        district: clientToEdit.district || clientToEdit.city || "",
        contactPerson: clientToEdit.contactPerson || "",
        contact: clientToEdit.contact || "",
        email: clientToEdit.email || "",
        dob: clientToEdit.dob || "",
        productTypes: clientToEdit.productTypes || "",
        companies: clientToEdit.companies || "",
        brands: clientToEdit.brands || "",
        numberOfSuppliers: clientToEdit.numberOfSuppliers || "",
        milkQuantity: clientToEdit.milkQuantity || "",
        numberOfAnimals: clientToEdit.numberOfAnimals || "",
        animalDetails: clientToEdit.animalDetails || "",
        gstin: clientToEdit.gstin || "",
        tier: clientToEdit.tier || "Gold",
        paymentTerms: clientToEdit.paymentTerms || "Net 30",
        outstanding: clientToEdit.outstanding !== undefined ? clientToEdit.outstanding : 0,
        orders: clientToEdit.orders || 0,
        revenue: clientToEdit.revenue || 0,
        status: clientToEdit.status || "Active",
        city: clientToEdit.city || ""
      };
    }
    return {
      id: nextId,
      clientType: "Animal Feed Shop",
      name: "",
      village: "",
      taluka: "",
      district: "",
      contact: "",
      email: "",
      dob: "",
      contactPerson: "",
      productTypes: "",
      companies: "",
      brands: "",
      numberOfSuppliers: "",
      milkQuantity: "",
      numberOfAnimals: "",
      animalDetails: "",
      city: "",
      gstin: "",
      tier: "Gold",
      paymentTerms: "Net 30",
      outstanding: 0,
      orders: 0,
      revenue: 0,
      status: "Active"
    };
  });

  const [errors, setErrors] = useState({});

  const handleFieldChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errs = {};

    // ID validation
    const idVal = validateUniqueId(form.id, existingIds, isEditing ? clientToEdit.id : null, "Client Reference ID");
    if (!idVal.isValid) errs.id = idVal.error;

    // Name validation
    const nameLabel = form.clientType === "Farmers" ? "Farmer Full Name" :
                      form.clientType === "Dairy" ? "Dairy / Cooperative Sanstha Name" :
                      "Animal Feed Store / Firm Name";
    const nameVal = validateRequiredText(form.name, nameLabel, 2);
    if (!nameVal.isValid) errs.name = nameVal.error;

    // Location validation
    const villageVal = validateRequiredText(form.village, "Village (गाव)", 2);
    if (!villageVal.isValid) errs.village = villageVal.error;

    const talukaVal = validateRequiredText(form.taluka, "Taluka (तालुका)", 2);
    if (!talukaVal.isValid) errs.taluka = talukaVal.error;

    const districtVal = validateRequiredText(form.district, "District (जिल्हा)", 2);
    if (!districtVal.isValid) errs.district = districtVal.error;

    // Contact phone validation (Indian 10-digit mobile)
    const phoneVal = validateMobile(form.contact, true);
    if (!phoneVal.isValid) errs.contact = phoneVal.error;

    // Email validation (optional)
    if (form.email && form.email.trim()) {
      const emailVal = validateEmail(form.email, false);
      if (!emailVal.isValid) errs.email = emailVal.error;
    }

    // DOB validation (optional, must not be in future)
    if (form.dob && form.dob.trim()) {
      const dobVal = validateDate(form.dob, false, true);
      if (!dobVal.isValid) errs.dob = dobVal.error;
    }

    // GSTIN validation (optional)
    if (form.gstin && form.gstin.trim()) {
      const gstinVal = validateGSTIN(form.gstin, false);
      if (!gstinVal.isValid) errs.gstin = gstinVal.error;
    }

    // Category-specific validation
    if (form.clientType === "Animal Feed Shop") {
      const ptVal = validateRequiredText(form.productTypes, "Types of Products Sold", 2);
      if (!ptVal.isValid) errs.productTypes = ptVal.error;

      const compVal = validateRequiredText(form.companies, "Companies Selling Products", 2);
      if (!compVal.isValid) errs.companies = compVal.error;

      const brandVal = validateRequiredText(form.brands, "Selling Product Brands", 2);
      if (!brandVal.isValid) errs.brands = brandVal.error;
    } else if (form.clientType === "Dairy") {
      if (form.numberOfSuppliers === "" || form.numberOfSuppliers === null || Number(form.numberOfSuppliers) < 0) {
        errs.numberOfSuppliers = "Number of suppliers must be 0 or greater.";
      }
      const milkVal = validateRequiredText(form.milkQuantity, "Quantity of Milk", 1);
      if (!milkVal.isValid) errs.milkQuantity = milkVal.error;
    } else if (form.clientType === "Farmers") {
      const animVal = validateRequiredText(form.numberOfAnimals, "No. Of Animals", 1);
      if (!animVal.isValid) errs.numberOfAnimals = animVal.error;
    }

    // Financial balances
    const outVal = validateNonNegativeNumber(form.outstanding, "Outstanding Balance");
    if (!outVal.isValid) errs.outstanding = outVal.error;

    const ordVal = validateNonNegativeNumber(form.orders, "Total Completed Orders");
    if (!ordVal.isValid) errs.orders = ordVal.error;

    const revVal = validateNonNegativeNumber(form.revenue, "Cumulative Invoiced Revenue");
    if (!revVal.isValid) errs.revenue = revVal.error;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const finalForm = {
      ...form,
      city: form.city.trim() || form.district.trim() || "Maharashtra"
    };
    onSave(finalForm);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 740 }}>
        <div className="modal-header">
          <h3>
            <Users size={19} style={{ color: "var(--primary)" }} />
            {isEditing ? `Edit Client: ${clientToEdit.name}` : "Add New Client Account"}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
            
            <ValidationSummary errors={errors} title="Please resolve the following client errors:" />

            {/* Step 1: Client Category Selector */}
            <div className="form-group full">
              <label style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>
                Select Client Category / Type <RequiredStar />
              </label>
              <div className="client-type-selector">
                <div
                  className={`client-type-card ${form.clientType === "Animal Feed Shop" ? "active feed-shop" : ""}`}
                  onClick={() => handleFieldChange("clientType", "Animal Feed Shop")}
                >
                  <div className="client-type-card-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#059669" }}>
                    <Wheat size={18} />
                  </div>
                  <div className="client-type-card-title">1. Animal Feed Shop</div>
                  <div className="client-type-card-desc">पशूखाद्य दुकान / Retailers, supplements & cattle feed stockists</div>
                </div>

                <div
                  className={`client-type-card ${form.clientType === "Dairy" ? "active dairy" : ""}`}
                  onClick={() => handleFieldChange("clientType", "Dairy")}
                >
                  <div className="client-type-card-icon" style={{ background: "rgba(2, 132, 199, 0.15)", color: "#0284c7" }}>
                    <Milk size={18} />
                  </div>
                  <div className="client-type-card-title">2. Dairy</div>
                  <div className="client-type-card-desc">दूध डेअरी / संकलन केंद्र / Collection centers & processors</div>
                </div>

                <div
                  className={`client-type-card ${form.clientType === "Farmers" ? "active farmers" : ""}`}
                  onClick={() => handleFieldChange("clientType", "Farmers")}
                >
                  <div className="client-type-card-icon" style={{ background: "rgba(217, 119, 6, 0.15)", color: "#d97706" }}>
                    <Tractor size={18} />
                  </div>
                  <div className="client-type-card-title">3. Farmers</div>
                  <div className="client-type-card-desc">शेतकरी / Progressive farmers & dairy cattle owners</div>
                </div>
              </div>
            </div>

            {/* Step 2: Common Information */}
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)", borderBottom: "1.5px solid var(--border)", paddingBottom: 6, marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
                <Building2 size={15} /> Common Information
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Client Reference ID <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.id ? "is-invalid" : ""}`}
                    value={form.id}
                    onChange={(e) => handleFieldChange("id", e.target.value)}
                  />
                  <FieldError error={errors.id} />
                  <span className="form-help">Unique ledger code</span>
                </div>

                <div className="form-group">
                  <label>Account Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                  >
                    <option value="Active">Active Account</option>
                    <option value="Inactive">Inactive / Suspended</option>
                  </select>
                  <span className="form-help">Relationship state</span>
                </div>

                <div className="form-group full">
                  <label>
                    {form.clientType === "Farmers" ? "Farmer Full Name" :
                     form.clientType === "Dairy" ? "Dairy / Cooperative Sanstha Name" :
                     "Animal Feed Store / Firm Name"} <RequiredStar />
                  </label>
                  <input
                    className={`form-input ${errors.name ? "is-invalid" : ""}`}
                    placeholder={
                      form.clientType === "Farmers" ? "e.g. Tukaram Ramchandra Patil" :
                      form.clientType === "Dairy" ? "e.g. Gokul Dudh Utpadak Sahakari Dairy" :
                      "e.g. Shree Samarth Animal Feed & Agro Traders"
                    }
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    autoFocus
                  />
                  <FieldError error={errors.name} />
                </div>

                <div className="form-group">
                  <label>Village (गाव) <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.village ? "is-invalid" : ""}`}
                    placeholder="e.g. Baramati Rural, Kasaba Bawada"
                    value={form.village}
                    onChange={(e) => handleFieldChange("village", e.target.value)}
                  />
                  <FieldError error={errors.village} />
                </div>

                <div className="form-group">
                  <label>Taluka (तालुका) <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.taluka ? "is-invalid" : ""}`}
                    placeholder="e.g. Baramati, Karveer, Haveli"
                    value={form.taluka}
                    onChange={(e) => handleFieldChange("taluka", e.target.value)}
                  />
                  <FieldError error={errors.taluka} />
                </div>

                <div className="form-group">
                  <label>District (जिल्हा) <RequiredStar /></label>
                  <input
                    className={`form-input ${errors.district ? "is-invalid" : ""}`}
                    placeholder="e.g. Pune, Kolhapur, Satara, Sangli"
                    value={form.district}
                    onChange={(e) => handleFieldChange("district", e.target.value)}
                  />
                  <FieldError error={errors.district} />
                </div>

                <div className="form-group">
                  <label>Contact Phone Number <RequiredStar /></label>
                  <input
                    type="tel"
                    className={`form-input ${errors.contact ? "is-invalid" : ""}`}
                    placeholder="e.g. 9822456789"
                    value={form.contact}
                    onChange={(e) => handleFieldChange("contact", e.target.value)}
                  />
                  <FieldError error={errors.contact} />
                  <span className="form-help">10-digit Indian mobile number</span>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? "is-invalid" : ""}`}
                    placeholder="e.g. client@gmail.com"
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                  />
                  <FieldError error={errors.email} />
                </div>

                <div className="form-group">
                  <label>Date of Birth (DOB)</label>
                  <input
                    type="date"
                    className={`form-input ${errors.dob ? "is-invalid" : ""}`}
                    value={form.dob}
                    onChange={(e) => handleFieldChange("dob", e.target.value)}
                  />
                  <FieldError error={errors.dob} />
                  <span className="form-help">Birth date for record & loyalty verification</span>
                </div>

                <div className="form-group">
                  <label>Contact Person / Proprietor</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Dattatray Shinde, Suresh Patel"
                    value={form.contactPerson}
                    onChange={(e) => handleFieldChange("contactPerson", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>GSTIN / Tax Identifier (Optional)</label>
                  <input
                    className={`form-input ${errors.gstin ? "is-invalid" : ""}`}
                    placeholder="e.g. 27AABCS1429B1Z2"
                    value={form.gstin}
                    onChange={(e) => handleFieldChange("gstin", e.target.value.toUpperCase())}
                  />
                  <FieldError error={errors.gstin} />
                  <span className="form-help">15-character Indian GST format</span>
                </div>
              </div>
            </div>

            {/* Step 3: Specific Information Section */}
            <div className="specific-form-section" style={{
              borderLeft: form.clientType === "Dairy" ? "4px solid #0284c7" :
                          form.clientType === "Farmers" ? "4px solid #d97706" :
                          "4px solid #059669"
            }}>
              <div className="specific-form-section-header">
                {form.clientType === "Dairy" ? <Milk size={17} style={{ color: "#0284c7" }} /> :
                 form.clientType === "Farmers" ? <Tractor size={17} style={{ color: "#d97706" }} /> :
                 <Wheat size={17} style={{ color: "#059669" }} />}
                <span>
                  {form.clientType === "Dairy" ? "Dairy Specific Details" :
                   form.clientType === "Farmers" ? "Farmers Specific Details" :
                   "Animal Feed Shop Specific Details"}
                </span>
              </div>

              {/* Specific fields for Animal Feed Shop */}
              {form.clientType === "Animal Feed Shop" && (
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Types of Products Sold <RequiredStar /></label>
                    <input
                      className={`form-input ${errors.productTypes ? "is-invalid" : ""}`}
                      placeholder="e.g. Cattle Feed, Calf Starter, Mineral Mixture, Calcium Supplement, Silage"
                      value={form.productTypes}
                      onChange={(e) => handleFieldChange("productTypes", e.target.value)}
                    />
                    <FieldError error={errors.productTypes} />
                    <span className="form-help">Comma-separated product categories and inventory types</span>
                  </div>

                  <div className="form-group">
                    <label>Companies Selling Products <RequiredStar /></label>
                    <input
                      className={`form-input ${errors.companies ? "is-invalid" : ""}`}
                      placeholder="e.g. Godrej Agrovet, Baramati Agro, Amul, Cargill India"
                      value={form.companies}
                      onChange={(e) => handleFieldChange("companies", e.target.value)}
                    />
                    <FieldError error={errors.companies} />
                    <span className="form-help">Distributor / Manufacturer parent companies</span>
                  </div>

                  <div className="form-group">
                    <label>Selling Product Brands <RequiredStar /></label>
                    <input
                      className={`form-input ${errors.brands ? "is-invalid" : ""}`}
                      placeholder="e.g. Godrej MilkMore, Samruddhi Supreme, Kapila Gold, Amul Dan"
                      value={form.brands}
                      onChange={(e) => handleFieldChange("brands", e.target.value)}
                    />
                    <FieldError error={errors.brands} />
                    <span className="form-help">Major brand names stocked on shelves</span>
                  </div>

                  <div className="form-group full">
                    <label>No. Of Animals Covered / Serviced (Network)</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 550+ Local Cattle Network or 500"
                      value={form.numberOfAnimals}
                      onChange={(e) => handleFieldChange("numberOfAnimals", e.target.value)}
                    />
                    <span className="form-help">Estimated number of dairy animals / livestock served by this feed shop</span>
                  </div>
                </div>
              )}

              {/* Specific fields for Dairy */}
              {form.clientType === "Dairy" && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Number of Suppliers (पुरवठादार शेतकरी) <RequiredStar /></label>
                    <input
                      type="number"
                      min="0"
                      className={`form-input ${errors.numberOfSuppliers ? "is-invalid" : ""}`}
                      placeholder="e.g. 92"
                      value={form.numberOfSuppliers}
                      onChange={(e) => handleFieldChange("numberOfSuppliers", e.target.value)}
                    />
                    <FieldError error={errors.numberOfSuppliers} />
                    <span className="form-help">Total farmers / suppliers delivering milk</span>
                  </div>

                  <div className="form-group">
                    <label>Quantity of Milk (दूध प्रमाण / लिटर) <RequiredStar /></label>
                    <input
                      className={`form-input ${errors.milkQuantity ? "is-invalid" : ""}`}
                      placeholder="e.g. 4,500 Liters / Day or 1,20,000 Liters / Month"
                      value={form.milkQuantity}
                      onChange={(e) => handleFieldChange("milkQuantity", e.target.value)}
                    />
                    <FieldError error={errors.milkQuantity} />
                    <span className="form-help">Milk collection volume per day or month</span>
                  </div>
                </div>
              )}

              {/* Specific fields for Farmers */}
              {form.clientType === "Farmers" && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>No. Of Animals (जनावरांची संख्या) <RequiredStar /></label>
                    <input
                      className={`form-input ${errors.numberOfAnimals ? "is-invalid" : ""}`}
                      placeholder="e.g. 18 or 18 Animals"
                      value={form.numberOfAnimals}
                      onChange={(e) => handleFieldChange("numberOfAnimals", e.target.value)}
                    />
                    <FieldError error={errors.numberOfAnimals} />
                    <span className="form-help">Total cows, buffaloes, or cattle owned</span>
                  </div>

                  <div className="form-group">
                    <label>Animal Details & Breeds</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 10 HF Crossbreed Cows, 5 Murrah Buffaloes, 3 Heifers"
                      value={form.animalDetails}
                      onChange={(e) => handleFieldChange("animalDetails", e.target.value)}
                    />
                    <span className="form-help">Livestock types, breeds, and count</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Commercial & Account Details */}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)", borderBottom: "1.5px solid var(--border)", paddingBottom: 6, marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
                <CreditCard size={15} /> Commercial & Payment Terms
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Client Commercial Tier</label>
                  <select
                    className="form-select"
                    value={form.tier}
                    onChange={(e) => handleFieldChange("tier", e.target.value)}
                  >
                    <option value="Platinum">Platinum (High Volume)</option>
                    <option value="Gold">Gold (Preferred)</option>
                    <option value="Silver">Silver (Regular)</option>
                    <option value="Bronze">Bronze (Standard)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Terms Agreement</label>
                  <select
                    className="form-select"
                    value={form.paymentTerms}
                    onChange={(e) => handleFieldChange("paymentTerms", e.target.value)}
                  >
                    <option value="Immediate">Immediate / Advance</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Outstanding Balance (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    className={`form-input ${errors.outstanding ? "is-invalid" : ""}`}
                    placeholder="e.g. 32000"
                    value={form.outstanding}
                    onChange={(e) => handleFieldChange("outstanding", Number(e.target.value) || 0)}
                  />
                  <FieldError error={errors.outstanding} />
                </div>

                <div className="form-group">
                  <label>Total Completed Orders</label>
                  <input
                    type="number"
                    min="0"
                    className={`form-input ${errors.orders ? "is-invalid" : ""}`}
                    value={form.orders}
                    onChange={(e) => handleFieldChange("orders", Number(e.target.value) || 0)}
                  />
                  <FieldError error={errors.orders} />
                </div>

                <div className="form-group full">
                  <label>Cumulative Invoiced Revenue (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    className={`form-input ${errors.revenue ? "is-invalid" : ""}`}
                    placeholder="Amount in Rupees"
                    value={form.revenue}
                    onChange={(e) => handleFieldChange("revenue", Number(e.target.value) || 0)}
                  />
                  <FieldError error={errors.revenue} />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              <Save size={15} /> {isEditing ? "Save Client Details" : "Create Client Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// DEDICATED EDITABLE CLIENTS DIRECTORY PAGE
// ==========================================================================
function ClientsPage({ clients, onSaveClients, invoices = [], onSaveInvoices, company = {} }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [invoiceForClient, setInvoiceForClient] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const nextId = useMemo(() => {
    const ids = clients
      .map(c => {
        const match = c.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = ids.length ? Math.max(...ids) : 0;
    return `CL-${String(maxNum + 1).padStart(3, "0")}`;
  }, [clients]);

  const feedShopCount = useMemo(() => clients.filter(c => c.clientType === "Animal Feed Shop").length, [clients]);
  const dairyCount = useMemo(() => clients.filter(c => c.clientType === "Dairy").length, [clients]);
  const farmersCount = useMemo(() => clients.filter(c => c.clientType === "Farmers").length, [clients]);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const matchesCategory = categoryFilter === "All" || c.clientType === categoryFilter;
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      const matchesTier = tierFilter === "All" || (c.tier || "Gold") === tierFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.clientType && c.clientType.toLowerCase().includes(q)) ||
        (c.village && c.village.toLowerCase().includes(q)) ||
        (c.taluka && c.taluka.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
        (c.contact && c.contact.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.productTypes && c.productTypes.toLowerCase().includes(q)) ||
        (c.companies && c.companies.toLowerCase().includes(q)) ||
        (c.brands && c.brands.toLowerCase().includes(q)) ||
        (c.animalDetails && c.animalDetails.toLowerCase().includes(q)) ||
        (c.gstin && c.gstin.toLowerCase().includes(q))
      );
      return matchesCategory && matchesStatus && matchesTier && matchesSearch;
    });
  }, [clients, search, categoryFilter, statusFilter, tierFilter]);

  const totalRevenue = useMemo(() => clients.reduce((sum, c) => sum + (Number(c.revenue) || 0), 0), [clients]);
  const totalOutstanding = useMemo(() => clients.reduce((sum, c) => sum + (Number(c.outstanding) || 0), 0), [clients]);
  const activeCount = useMemo(() => clients.filter(c => c.status === "Active").length, [clients]);

  const handleOpenAdd = (defaultType = "Animal Feed Shop") => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleSaveClient = (clientData) => {
    if (editingClient) {
      const updated = clients.map(c => c.id === editingClient.id ? clientData : c);
      onSaveClients(updated);
      showToast(`✓ Updated ${clientData.name} details successfully!`);
    } else {
      const exists = clients.some(c => c.id.toLowerCase() === clientData.id.toLowerCase());
      if (exists) {
        showToast(`⚠️ A client with ID ${clientData.id} already exists.`);
        return;
      }
      const updated = [clientData, ...clients];
      onSaveClients(updated);
      showToast(`✓ Added ${clientData.name} (${clientData.clientType}) to directory!`);
    }
    setModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingClient) return;
    const updated = clients.filter(c => c.id !== deletingClient.id);
    onSaveClients(updated);
    showToast(`✓ Client ${deletingClient.name} deleted.`);
    setDeletingClient(null);
  };

  const handleResetDemo = () => {
    onSaveClients(initialClients);
    showToast("✓ Restored 12 verified Maharashtra agribusiness & enterprise accounts!");
  };

  const handleExportCSV = () => {
    const headers = [
      "Client ID", "Category / Type", "Client Name", "Village (गाव)", "Taluka (तालुका)",
      "District (जिल्हा)", "Contact Number", "Email", "Date of Birth (DOB)", "Animal Feed - Products",
      "Animal Feed - Companies", "Animal Feed - Brands", "Dairy - Suppliers Count", "Dairy - Milk Quantity",
      "Farmers - Animals Count", "Farmers - Animal Details", "Tier", "Payment Terms", "Orders",
      "Revenue_INR", "Outstanding_INR", "Status"
    ];
    const rows = filtered.map(c => [
      `"${c.id}"`,
      `"${c.clientType || 'Animal Feed Shop'}"`,
      `"${c.name}"`,
      `"${c.village || ''}"`,
      `"${c.taluka || ''}"`,
      `"${c.district || c.city || ''}"`,
      `"${c.contact}"`,
      `"${c.email || ''}"`,
      `"${c.dob || ''}"`,
      `"${c.productTypes || ''}"`,
      `"${c.companies || ''}"`,
      `"${c.brands || ''}"`,
      c.numberOfSuppliers || '',
      `"${c.milkQuantity || ''}"`,
      c.numberOfAnimals || '',
      `"${c.animalDetails || ''}"`,
      `"${c.tier || 'Gold'}"`,
      `"${c.paymentTerms || 'Net 30'}"`,
      c.orders,
      c.revenue,
      c.outstanding || 0,
      `"${c.status}"`
    ]);
    downloadCSV(`laxmi_enterprises_clients_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast("✓ Exported clients directory spreadsheet.");
  };

  return (
    <div className="page">
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Summary KPI Cards across 3 Agribusiness Sectors */}
      <div className="module-quick-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="client-stat-pill" onClick={() => setCategoryFilter("All")} style={{ cursor: "pointer" }}>
          <div className="client-stat-pill-icon"><Users size={20} /></div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Total Registered Accounts</div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{clients.length} Clients</div>
          </div>
        </div>

        <div className="client-stat-pill" onClick={() => setCategoryFilter("Animal Feed Shop")} style={{ cursor: "pointer" }}>
          <div className="client-stat-pill-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}>
            <Wheat size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>1. Animal Feed Shops</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#059669" }}>{feedShopCount} Shops</div>
          </div>
        </div>

        <div className="client-stat-pill" onClick={() => setCategoryFilter("Dairy")} style={{ cursor: "pointer" }}>
          <div className="client-stat-pill-icon" style={{ background: "rgba(2, 132, 199, 0.12)", color: "#0284c7" }}>
            <Milk size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>2. Dairies / Centers</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#0284c7" }}>{dairyCount} Dairies</div>
          </div>
        </div>

        <div className="client-stat-pill" onClick={() => setCategoryFilter("Farmers")} style={{ cursor: "pointer" }}>
          <div className="client-stat-pill-icon" style={{ background: "rgba(217, 119, 6, 0.12)", color: "#d97706" }}>
            <Tractor size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>3. Farmers (शेतकरी)</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#d97706" }}>{farmersCount} Farmers</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "var(--badge-brand-bg)", color: "var(--primary)" }}>
            <IndianRupee size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Total Gross Billings</div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>₹{totalRevenue.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: totalOutstanding > 0 ? "rgba(239, 68, 68, 0.12)" : "var(--badge-brand-bg)", color: totalOutstanding > 0 ? "var(--danger)" : "var(--text-muted)" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Outstanding Balance</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: totalOutstanding > 0 ? "var(--danger)" : "inherit" }}>
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Action Header & Multi-Category Filters */}
      <div className="page-actions" style={{ alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          
          {/* Category Filter Pills (Animal Feed Shop, Dairy, Farmers) */}
          <div className="filter-pills-bar">
            <button
              className={`filter-pill ${categoryFilter === "All" ? "active" : ""}`}
              onClick={() => setCategoryFilter("All")}
            >
              All Clients ({clients.length})
            </button>
            <button
              className={`filter-pill ${categoryFilter === "Animal Feed Shop" ? "active" : ""}`}
              onClick={() => setCategoryFilter("Animal Feed Shop")}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <Wheat size={13} /> 🌾 Animal Feed Shop ({feedShopCount})
            </button>
            <button
              className={`filter-pill ${categoryFilter === "Dairy" ? "active" : ""}`}
              onClick={() => setCategoryFilter("Dairy")}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <Milk size={13} /> 🥛 Dairy ({dairyCount})
            </button>
            <button
              className={`filter-pill ${categoryFilter === "Farmers" ? "active" : ""}`}
              onClick={() => setCategoryFilter("Farmers")}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <Tractor size={13} /> 🚜 Farmers ({farmersCount})
            </button>
          </div>

          <div className="filter-pills-bar">
            {["All", "Active", "Inactive"].map(st => (
              <button
                key={st}
                className={`filter-pill ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st} ({st === "All" ? clients.length : clients.filter(c => c.status === st).length})
              </button>
            ))}
          </div>

          <div className="filter-pills-bar">
            {["All", "Platinum", "Gold", "Silver", "Bronze"].map(tier => (
              <button
                key={tier}
                className={`filter-pill ${tierFilter === tier ? "active" : ""}`}
                onClick={() => setTierFilter(tier)}
              >
                {tier === "All" ? "All Tiers" : tier}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button 
            type="button"
            className="outline" 
            onClick={handleResetDemo} 
            title="Restore 12 verified demo industrial accounts"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RotateCcw size={14} /> Reset Demo Data
          </button>
          <ExportMenu
            label="Export"
            category="Clients"
            onExportCSV={handleExportCSV}
            showToast={showToast}
          />
          <button className="primary" onClick={() => handleOpenAdd(categoryFilter !== "All" ? categoryFilter : "Animal Feed Shop")}>
            <Plus size={16} /> Add Client
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card table-card">
        <div className="table-toolbar">
          <div className="local-search">
            <Search size={16} />
            <input
              placeholder="Search by client name, village, taluka, district, products, brands, contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing {filtered.length} of {clients.length} enterprise records
          </span>
        </div>

        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={26} /></div>
              <h4 style={{ fontSize: 16, color: "var(--text-main)", marginBottom: 6 }}>No Clients Found</h4>
              <p style={{ fontSize: 13, marginBottom: 16 }}>
                {clients.length === 0 
                  ? "Your client directory currently has 0 records. Click below to load 12 verified Maharashtra accounts."
                  : "No client records match your current search query or filter selection."}
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                {clients.length === 0 && (
                  <button className="primary" onClick={handleResetDemo}>
                    <RotateCcw size={15} /> Load 12 Enterprise Accounts
                  </button>
                )}
                <button className="outline" onClick={() => handleOpenAdd(categoryFilter !== "All" ? categoryFilter : "Animal Feed Shop")}><Plus size={15} /> Add New Client</button>
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Client ID & Category</th>
                  <th>Client / Firm & DOB</th>
                  <th>Location (Village / Taluka / Dist)</th>
                  <th>Contact & Email</th>
                  <th>Specific Information</th>
                  <th>Orders & Billings</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <code>{c.id}</code>
                      <div style={{ marginTop: 4 }}>
                        <span className={`client-type-badge ${
                          c.clientType === "Dairy" ? "dairy" :
                          c.clientType === "Farmers" ? "farmers" : "feed-shop"
                        }`}>
                          {c.clientType === "Dairy" ? <Milk size={11} /> :
                           c.clientType === "Farmers" ? <Tractor size={11} /> :
                           <Wheat size={11} />}
                          {c.clientType === "Dairy" ? "Dairy" :
                           c.clientType === "Farmers" ? "Farmer" : "Feed Shop"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="person">
                        <div className="mini-avatar" style={{
                          background: c.clientType === "Dairy" ? "rgba(2, 132, 199, 0.12)" :
                                      c.clientType === "Farmers" ? "rgba(217, 119, 6, 0.12)" : "rgba(16, 185, 129, 0.12)",
                          color: c.clientType === "Dairy" ? "#0284c7" :
                                 c.clientType === "Farmers" ? "#d97706" : "#059669"
                        }}>
                          {c.name ? c.name[0] : "C"}
                        </div>
                        <div>
                          <b 
                            style={{ cursor: "pointer", color: "var(--text-main)" }} 
                            onClick={() => setViewingClient(c)}
                            title="Click to view full client profile"
                          >
                            {c.name}
                          </b>
                          {c.contactPerson && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              Prop: {c.contactPerson}
                            </div>
                          )}
                          {c.dob && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                              <Calendar size={11} /> DOB: {c.dob}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                        <MapPin size={13} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 650, fontSize: "12.5px" }}>
                            {c.village || c.city || "-"}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {c.taluka ? `${c.taluka}, ` : ""}Dist: {c.district || c.city || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: 3 }}>
                        <a href={`tel:${c.contact}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "inherit", textDecoration: "none" }}>
                          <Phone size={11} style={{ color: "var(--primary)" }} /> {c.contact}
                        </a>
                        {c.email && (
                          <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", textDecoration: "none", fontSize: "11px" }}>
                            <Mail size={11} /> {c.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      {c.clientType === "Animal Feed Shop" && (
                        <div style={{ maxWidth: 260, fontSize: "11px", lineHeight: 1.4 }}>
                          {c.productTypes && (
                            <div style={{ color: "var(--text-main)", fontWeight: 600, marginBottom: 2 }}>
                              <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Products: </span>
                              {c.productTypes.length > 36 ? `${c.productTypes.slice(0, 36)}...` : c.productTypes}
                            </div>
                          )}
                          {c.brands && (
                            <div style={{ color: "var(--primary)" }}>
                              <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Brands: </span>
                              {c.brands.length > 30 ? `${c.brands.slice(0, 30)}...` : c.brands}
                            </div>
                          )}
                          {c.numberOfAnimals && (
                            <div style={{ color: "#059669", fontSize: "10.5px", marginTop: 2, fontWeight: 600 }}>
                              🐾 {c.numberOfAnimals}
                            </div>
                          )}
                        </div>
                      )}
                      {c.clientType === "Dairy" && (
                        <div style={{ fontSize: "11.5px", lineHeight: 1.4 }}>
                          <div style={{ color: "#0284c7", fontWeight: 700 }}>
                            🥛 {c.numberOfSuppliers || 0} Suppliers
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                            Qty: <b>{c.milkQuantity || "-"}</b>
                          </div>
                        </div>
                      )}
                      {c.clientType === "Farmers" && (
                        <div style={{ fontSize: "11.5px", lineHeight: 1.4 }}>
                          <div style={{ color: "#d97706", fontWeight: 700 }}>
                            🚜 {c.numberOfAnimals || 0} Animals
                          </div>
                          {c.animalDetails && (
                            <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                              {c.animalDetails.length > 32 ? `${c.animalDetails.slice(0, 32)}...` : c.animalDetails}
                            </div>
                          )}
                        </div>
                      )}
                      {!c.clientType && (
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>General Account</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: "12.5px" }}>
                        ₹{Number(c.revenue).toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {c.orders} orders • {c.paymentTerms || "Net 30"}
                      </div>
                    </td>
                    <td className="money" style={{ color: Number(c.outstanding) > 0 ? "var(--danger)" : "var(--text-muted)", fontWeight: Number(c.outstanding) > 0 ? 800 : 500 }}>
                      ₹{Number(c.outstanding || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className={`badge ${c.status === "Active" ? "success" : "muted"}`}>
                        <span
                          className={`badge-dot ${c.status === "Active" ? "pulse" : ""}`}
                          style={{
                            background: c.status === "Active" ? "#10b981" : "#94a3b8",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            display: "inline-block",
                            marginRight: 6
                          }}
                        />
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          title={`View Full Profile of ${c.name}`}
                          onClick={() => setViewingClient(c)}
                          style={{ color: "var(--accent)" }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          title={`Create & Download Tax Invoice for ${c.name} to PC`}
                          onClick={() => setInvoiceForClient(c)}
                          style={{ color: "var(--primary)" }}
                        >
                          <Receipt size={14} />
                        </button>
                        <button title="Edit Client Information" onClick={() => handleOpenEdit(c)}>
                          <Pencil size={14} />
                        </button>
                        <button title="Delete Client" onClick={() => setDeletingClient(c)}>
                          <Trash2 size={14} style={{ color: "var(--danger)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ClientModal
        key={editingClient ? editingClient.id : "new-client"}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingClient(null); }}
        onSave={handleSaveClient}
        clientToEdit={editingClient}
        nextId={nextId}
        existingIds={clients.map(c => c.id)}
      />

      <ClientDetailsModal
        isOpen={!!viewingClient}
        onClose={() => setViewingClient(null)}
        client={viewingClient}
        onEdit={(c) => { setViewingClient(null); handleOpenEdit(c); }}
        onCreateInvoice={(c) => { setViewingClient(null); setInvoiceForClient(c); }}
        onDelete={(c) => {
          setViewingClient(null);
          setDeletingClient(c);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Account Deletion"
        message={deletingClient ? `Are you sure you want to remove ${deletingClient.name} (${deletingClient.id}) from the client directory?` : ""}
        details={deletingClient ? `This account has ${deletingClient.orders} orders and ₹${Number(deletingClient.revenue).toLocaleString("en-IN")} in recorded revenue.` : ""}
      />


      {invoiceForClient && (
        <InvoiceModal
          isOpen={!!invoiceForClient}
          onClose={() => setInvoiceForClient(null)}
          onSave={(newInv) => {
            if (onSaveInvoices) onSaveInvoices([newInv, ...(invoices || [])]);
            showToast(`✓ Created and issued Invoice ${newInv.id} for ${invoiceForClient.name}`);
            setInvoiceForClient(null);
          }}
          clients={clients}
          nextId={`LE-INV-2026-${String((invoices?.length || 0) + 1).padStart(3, "0")}`}
          company={company}
          defaultClient={invoiceForClient}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// ==========================================================================
// PRODUCT MODAL (ADD / EDIT) WITH SPECIFIC STOCK CALCULATION
// ==========================================================================
function ProductModal({ isOpen, onClose, onSave, productToEdit, nextId, existingIds = [] }) {
  if (!isOpen) return null;
  const isEditing = !!productToEdit;

  const [form, setForm] = useState(() => {
    if (productToEdit) {
      const open = Number(productToEdit.openingStock) || 0;
      const inW = Number(productToEdit.inwardStock) !== undefined && !isNaN(Number(productToEdit.inwardStock))
        ? Number(productToEdit.inwardStock)
        : Number(productToEdit.stock) || 50;
      const outW = Number(productToEdit.outwardStock) || 0;
      const res = Number(productToEdit.reservedStock) || 0;
      const calcStock = Math.max(0, (open + inW) - outW - res);
      return {
        ...productToEdit,
        openingStock: open,
        inwardStock: inW,
        outwardStock: outW,
        reservedStock: res,
        stock: calcStock
      };
    }
    return {
      id: nextId,
      name: "",
      category: "Hardware",
      price: 1000,
      openingStock: 0,
      inwardStock: 50,
      outwardStock: 0,
      reservedStock: 0,
      stock: 50,
      minStock: 20
    };
  });

  const [errors, setErrors] = useState({});

  const handleFieldChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleStockParamChange = (field, val) => {
    const num = Math.max(0, Number(val) || 0);
    setForm(prev => {
      const updated = { ...prev, [field]: num };
      const open = Number(updated.openingStock) || 0;
      const inW = Number(updated.inwardStock) || 0;
      const outW = Number(updated.outwardStock) || 0;
      const res = Number(updated.reservedStock) || 0;
      updated.stock = Math.max(0, (open + inW) - outW - res);
      return updated;
    });
    if (errors[field] || errors.stock) {
      setErrors(prev => ({ ...prev, [field]: null, stock: null }));
    }
  };

  const validateForm = () => {
    const errs = {};

    const idVal = validateUniqueId(form.id, existingIds, isEditing ? productToEdit.id : null, "Product Reference ID");
    if (!idVal.isValid) errs.id = idVal.error;

    const nameVal = validateRequiredText(form.name, "Product Item Name", 2);
    if (!nameVal.isValid) errs.name = nameVal.error;

    const priceVal = validatePositiveNumber(form.price, "Unit Selling Price");
    if (!priceVal.isValid) errs.price = priceVal.error;

    const stockVal = validateNonNegativeNumber(form.stock, "Available Stock");
    if (!stockVal.isValid) errs.stock = stockVal.error;

    const minStockVal = validatePositiveNumber(form.minStock, "Safety Threshold Limit");
    if (!minStockVal.isValid) errs.minStock = minStockVal.error;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const open = Number(form.openingStock) || 0;
    const inW = Number(form.inwardStock) || 0;
    const outW = Number(form.outwardStock) || 0;
    const res = Number(form.reservedStock) || 0;
    const calculatedStock = Math.max(0, (open + inW) - outW - res);

    onSave({
      ...form,
      openingStock: open,
      inwardStock: inW,
      outwardStock: outW,
      reservedStock: res,
      stock: calculatedStock
    });
  };

  const stockStatus = form.stock <= 0 ? "Out of Stock" : form.stock <= form.minStock ? "Low Stock" : "In Stock";
  const stockBadgeClass = form.stock <= 0 ? "danger" : form.stock <= form.minStock ? "warning" : "success";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <h3>
            <Package size={19} style={{ color: "var(--primary)" }} />
            {isEditing ? `Edit Product: ${productToEdit.name}` : "Add New Catalogue Product"}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ maxHeight: "78vh", overflowY: "auto" }}>
            <ValidationSummary errors={errors} title="Please resolve the following product errors:" />

            <div className="form-grid">
              <div className="form-group">
                <label>Product Reference ID <RequiredStar /></label>
                <input
                  className={`form-input ${errors.id ? "is-invalid" : ""}`}
                  value={form.id}
                  onChange={(e) => handleFieldChange("id", e.target.value)}
                />
                <FieldError error={errors.id} />
                <span className="form-help">Unique catalog SKU code</span>
              </div>

              <div className="form-group">
                <label>Category Sector</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                >
                  <option value="Hardware">Hardware & Fasteners</option>
                  <option value="Electrical">Electrical Equipment</option>
                  <option value="Mechanical">Mechanical & Valves</option>
                  <option value="Plumbing">Piping & Conduit</option>
                  <option value="Safety">Safety & PPE</option>
                  <option value="General">General Supplies</option>
                </select>
                <span className="form-help">Classification group</span>
              </div>

              <div className="form-group full">
                <label>Product Item Name <RequiredStar /></label>
                <input
                  className={`form-input ${errors.name ? "is-invalid" : ""}`}
                  placeholder="e.g. Industrial Pipe Set, Steel Conduit B"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  autoFocus
                />
                <FieldError error={errors.name} />
              </div>

              <div className="form-group">
                <label>Unit Selling Price (₹ INR) <RequiredStar /></label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={`form-input ${errors.price ? "is-invalid" : ""}`}
                  value={form.price}
                  onChange={(e) => handleFieldChange("price", Number(e.target.value) || 0)}
                />
                <FieldError error={errors.price} />
              </div>

              <div className="form-group">
                <label>Safety Threshold Limit (Min. Stock) <RequiredStar /></label>
                <input
                  type="number"
                  min="1"
                  className={`form-input ${errors.minStock ? "is-invalid" : ""}`}
                  value={form.minStock}
                  onChange={(e) => handleFieldChange("minStock", Number(e.target.value) || 1)}
                />
                <FieldError error={errors.minStock} />
              </div>

              {/* SPECIFIC STOCK CALCULATION PARAMETERS */}
              <div className="form-group full" style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Calculator size={15} style={{ color: "var(--primary)" }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
                      Specific Stock Accounting & Calculation Parameters
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Formula: (Opening + Inward) − Outward − Reserved
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Opening Base</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={form.openingStock}
                      onChange={(e) => handleStockParamChange("openingStock", e.target.value)}
                      title="Initial baseline stock units"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>+ Inward Received</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={form.inwardStock}
                      onChange={(e) => handleStockParamChange("inwardStock", e.target.value)}
                      title="Total inward procured / supplier receipts"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: 600 }}>− Outward Sold</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={form.outwardStock}
                      onChange={(e) => handleStockParamChange("outwardStock", e.target.value)}
                      title="Total outward dispatched / billed sales"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600 }}>− Reserved Hold</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={form.reservedStock}
                      onChange={(e) => handleStockParamChange("reservedStock", e.target.value)}
                      title="Allocated orders or quarantine units"
                    />
                  </div>
                </div>

                {/* LIVE SPECIFIC CALCULATION RESULT BAR */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(0, 91, 181, 0.06) 0%, rgba(16, 185, 129, 0.06) 100%)",
                  border: "1.5px solid rgba(0, 91, 181, 0.2)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10
                }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                      Specific Mathematical Calculation:
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-main)", marginTop: 2 }}>
                      ({form.openingStock || 0} Open + {form.inwardStock || 0} Inward) − {form.outwardStock || 0} Outward − {form.reservedStock || 0} Reserved
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                      CURRENT AVAILABLE STOCK
                    </div>
                    <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                      <span>{form.stock}</span>
                      <small style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>units</small>
                      <span className={`badge ${stockBadgeClass}`} style={{ fontSize: "0.7rem", padding: "1px 6px" }}>
                        {stockStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              <Save size={15} /> {isEditing ? "Save Product & Stock" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// DEDICATED EDITABLE PRODUCTS CATALOGUE PAGE WITH STOCK CALCULATION
// ==========================================================================
function ProductsPage({ products, onSaveProducts, inventory = [] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [calculatingProduct, setCalculatingProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const nextId = useMemo(() => {
    const ids = products
      .map(p => {
        const match = p.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = ids.length ? Math.max(...ids) : 0;
    return `PR-${String(maxNum + 1).padStart(3, "0")}`;
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
      return matchesCategory && matchesSearch;
    });
  }, [products, search, categoryFilter]);

  // Specific Stock Aggregations across products and linked inventory
  const totalUnits = useMemo(() => products.reduce((sum, p) => {
    const inv = (inventory || []).find(i => 
      (i.product && i.product.toLowerCase() === p.name.toLowerCase()) || 
      (i.sku && i.sku.toLowerCase() === p.id.toLowerCase())
    );
    return sum + calculateProductStock(p, inv).currentAvailableStock;
  }, 0), [products, inventory]);

  const totalInwardUnits = useMemo(() => products.reduce((sum, p) => {
    const inv = (inventory || []).find(i => 
      (i.product && i.product.toLowerCase() === p.name.toLowerCase()) || 
      (i.sku && i.sku.toLowerCase() === p.id.toLowerCase())
    );
    return sum + calculateProductStock(p, inv).inwardStock;
  }, 0), [products, inventory]);

  const totalOutwardUnits = useMemo(() => products.reduce((sum, p) => {
    const inv = (inventory || []).find(i => 
      (i.product && i.product.toLowerCase() === p.name.toLowerCase()) || 
      (i.sku && i.sku.toLowerCase() === p.id.toLowerCase())
    );
    return sum + calculateProductStock(p, inv).outwardStock;
  }, 0), [products, inventory]);

  const totalValuation = useMemo(() => products.reduce((sum, p) => {
    const inv = (inventory || []).find(i => 
      (i.product && i.product.toLowerCase() === p.name.toLowerCase()) || 
      (i.sku && i.sku.toLowerCase() === p.id.toLowerCase())
    );
    return sum + calculateProductStock(p, inv).valuation;
  }, 0), [products, inventory]);

  const lowCount = useMemo(() => products.filter(p => {
    const inv = (inventory || []).find(i => 
      (i.product && i.product.toLowerCase() === p.name.toLowerCase()) || 
      (i.sku && i.sku.toLowerCase() === p.id.toLowerCase())
    );
    const m = calculateProductStock(p, inv);
    return m.currentAvailableStock <= m.minStock;
  }).length, [products, inventory]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const handleSaveProduct = (prodData) => {
    if (editingProduct) {
      const updated = products.map(p => p.id === editingProduct.id ? prodData : p);
      onSaveProducts(updated);
      showToast(`✓ Updated ${prodData.name} and recalculated available stock!`);
    } else {
      const exists = products.some(p => p.id.toLowerCase() === prodData.id.toLowerCase());
      if (exists) {
        showToast(`⚠️ A product with ID ${prodData.id} already exists.`);
        return;
      }
      const updated = [prodData, ...products];
      onSaveProducts(updated);
      showToast(`✓ Added ${prodData.name} to catalogue with specific stock calculation!`);
    }
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingProduct) return;
    const updated = products.filter(p => p.id !== deletingProduct.id);
    onSaveProducts(updated);
    showToast(`✓ Product ${deletingProduct.name} deleted.`);
    setDeletingProduct(null);
  };

  const handleExportCSV = () => {
    const headers = [
      "Product_ID",
      "Product_Name",
      "Category",
      "Unit_Price_INR",
      "Opening_Stock",
      "Inward_Received",
      "Outward_Dispatched",
      "Reserved_Hold",
      "Current_Available_Stock",
      "Min_Stock_Limit",
      "Buffer_Margin",
      "Status",
      "Stock_Valuation_INR"
    ];
    const rows = filtered.map(p => {
      const inv = (inventory || []).find(i => 
        (i.product && i.product.toLowerCase() === p.name.toLowerCase()) || 
        (i.sku && i.sku.toLowerCase() === p.id.toLowerCase())
      );
      const m = calculateProductStock(p, inv);
      return [
        `"${p.id}"`,
        `"${p.name}"`,
        `"${p.category}"`,
        p.price,
        m.openingStock,
        m.inwardStock,
        m.outwardStock,
        m.reservedStock,
        m.currentAvailableStock,
        m.minStock,
        m.bufferMargin,
        `"${m.status}"`,
        m.valuation
      ];
    });
    downloadCSV(`laxmi_enterprises_products_stock_audit_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast("✓ Exported products catalogue with specific stock calculation audit.");
  };

  return (
    <div className="page">
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Product Summary KPIs */}
      <div className="module-quick-stats">
        <div className="client-stat-pill">
          <div className="client-stat-pill-icon"><Package size={20} /></div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Catalogue Items</div>
            <div style={{ fontSize: "21px", fontWeight: 800 }}>{products.length} Products</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "var(--badge-brand-bg)", color: "var(--primary)" }}>
            <Calculator size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Current Available Stock</div>
            <div style={{ fontSize: "21px", fontWeight: 800 }}>{totalUnits.toLocaleString("en-IN")} Units</div>
            <div style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: 1 }}>
              (+{totalInwardUnits} in / −{totalOutwardUnits} out)
            </div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            <IndianRupee size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Total Inventory Value</div>
            <div style={{ fontSize: "21px", fontWeight: 800, color: "var(--success)" }}>₹{totalValuation.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: lowCount > 0 ? "var(--warning-light)" : "var(--primary-light)", color: lowCount > 0 ? "var(--warning)" : "var(--primary)" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Low Stock Alerts</div>
            <div style={{ fontSize: "21px", fontWeight: 800, color: lowCount > 0 ? "var(--warning)" : "var(--text-main)" }}>{lowCount} Items</div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="page-actions" style={{ alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div className="filter-pills-bar">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-pill ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat} ({cat === "All" ? products.length : products.filter(p => p.category === cat).length})
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <ExportMenu
            label="Export Stock Audit"
            category="Products"
            onExportCSV={handleExportCSV}
            showToast={showToast}
          />
          <button className="primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card table-card">
        <div className="table-toolbar">
          <div className="local-search">
            <Search size={16} />
            <input
              placeholder="Search by product name, SKU, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing {filtered.length} of {products.length} products • Specific calculation enabled
          </span>
        </div>

        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Package size={26} /></div>
              <h4 style={{ fontSize: 16, color: "var(--text-main)", marginBottom: 6 }}>No Products Found</h4>
              <p style={{ fontSize: 13, marginBottom: 16 }}>No product entries match your search query or category filter.</p>
              <button className="primary" onClick={handleOpenAdd}><Plus size={15} /> Add New Product</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span>Current Available Stock</span>
                      <Calculator size={13} style={{ color: "var(--primary)" }} />
                    </div>
                  </th>
                  <th>Min Limit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const inv = (inventory || []).find(i => 
                    (i.product && i.product.toLowerCase() === p.name.toLowerCase()) || 
                    (i.sku && i.sku.toLowerCase() === p.id.toLowerCase())
                  );
                  const metrics = calculateProductStock(p, inv);
                  const isOut = metrics.status === "Out of Stock";
                  const isLow = metrics.status === "Low Stock";

                  return (
                    <tr key={p.id}>
                      <td><code>{p.id}</code></td>
                      <td>
                        <b>{p.name}</b>
                        {inv?.location && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            📍 {inv.location}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge muted">
                          <Tag size={11} style={{ marginRight: 4 }} /> {p.category}
                        </span>
                      </td>
                      <td className="money">₹{Number(p.price).toLocaleString("en-IN")}</td>
                      
                      {/* SPECIFIC STOCK CALCULATION CELL WITH VIEW BUTTON */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <b style={{
                              fontSize: "0.95rem",
                              color: isOut ? "var(--danger)" : isLow ? "var(--warning)" : "var(--text-main)"
                            }}>
                              {metrics.currentAvailableStock.toLocaleString("en-IN")} units
                            </b>
                            <button
                              type="button"
                              onClick={() => setCalculatingProduct(p)}
                              title="View detailed stock calculation breakdown & audit formula"
                              style={{
                                padding: "2px 6px",
                                background: "rgba(0, 91, 181, 0.08)",
                                color: "var(--primary)",
                                border: "1px solid rgba(0, 91, 181, 0.22)",
                                borderRadius: 4,
                                fontSize: "11px",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                cursor: "pointer"
                              }}
                            >
                              <Calculator size={12} />
                              <span>View Calc</span>
                            </button>
                          </div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                            In: +{metrics.inwardStock} | Out: −{metrics.outwardStock}
                          </span>
                        </div>
                      </td>

                      <td>{metrics.minStock} units</td>
                      <td>
                        <span className={`badge ${isOut ? "danger" : isLow ? "warning" : "success"}`}>
                          <span
                            className={`badge-dot ${!isOut && !isLow ? "pulse" : ""}`}
                            style={{
                              background: isOut ? "#ef4444" : isLow ? "#f59e0b" : "#10b981",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              display: "inline-block",
                              marginRight: 6
                            }}
                          />
                          {metrics.status}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            title="View Stock Calculation Breakdown & Audit"
                            onClick={() => setCalculatingProduct(p)}
                            style={{ color: "var(--primary)" }}
                          >
                            <Calculator size={14} />
                          </button>
                          <button title="Edit Product Details" onClick={() => handleOpenEdit(p)}>
                            <Pencil size={14} />
                          </button>
                          <button title="Delete Product" onClick={() => setDeletingProduct(p)}>
                            <Trash2 size={14} style={{ color: "var(--danger)" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ProductModal
        key={editingProduct ? editingProduct.id : "new-product"}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
        nextId={nextId}
        existingIds={products.map(p => p.id)}
      />

      {/* DEDICATED STOCK CALCULATION AUDIT MODAL */}
      <ProductStockModal
        isOpen={!!calculatingProduct}
        onClose={() => setCalculatingProduct(null)}
        product={calculatingProduct}
        inventoryItem={(inventory || []).find(i => 
          (i.product && i.product.toLowerCase() === calculatingProduct?.name.toLowerCase()) || 
          (i.sku && i.sku.toLowerCase() === calculatingProduct?.id.toLowerCase())
        )}
        onEditProduct={(p) => {
          setCalculatingProduct(null);
          handleOpenEdit(p);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Product Deletion"
        message={deletingProduct ? `Are you sure you want to remove ${deletingProduct.name} (${deletingProduct.id}) from the catalogue?` : ""}
        details={deletingProduct ? `Current inventory has ${deletingProduct.stock} units priced at ₹${Number(deletingProduct.price).toLocaleString("en-IN")} each.` : ""}
      />

    </div>
  );
}

// ==========================================================================
// INVENTORY MODAL (ADD / EDIT)
// ==========================================================================
function InventoryModal({ isOpen, onClose, onSave, inventoryToEdit, products, nextId, existingIds = [] }) {
  if (!isOpen) return null;
  const isEditing = !!inventoryToEdit;

  const [form, setForm] = useState(() => {
    if (inventoryToEdit) {
      return { ...inventoryToEdit };
    }
    const defaultProduct = products[0]?.name || "Industrial Pipe Set";
    return {
      id: nextId,
      product: defaultProduct,
      sku: "LE-" + (products[0]?.category?.toUpperCase().slice(0, 4) || "SKU") + "-" + Math.floor(10 + Math.random() * 90),
      in: 100,
      out: 20,
      stock: 80,
      status: "In Stock",
      location: "Warehouse A - Bay 01"
    };
  });

  const [errors, setErrors] = useState({});

  const handleFieldChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleInChange = (newIn) => {
    const stockVal = Math.max(0, newIn - form.out);
    setForm(prev => ({
      ...prev,
      in: newIn,
      stock: stockVal,
      status: stockVal <= 0 ? "Out of Stock" : stockVal <= 25 ? "Low Stock" : "In Stock"
    }));
    if (errors.in || errors.stock) {
      setErrors(prev => ({ ...prev, in: null, stock: null }));
    }
  };

  const handleOutChange = (newOut) => {
    const stockVal = Math.max(0, form.in - newOut);
    setForm(prev => ({
      ...prev,
      out: newOut,
      stock: stockVal,
      status: stockVal <= 0 ? "Out of Stock" : stockVal <= 25 ? "Low Stock" : "In Stock"
    }));
    if (errors.out || errors.stock) {
      setErrors(prev => ({ ...prev, out: null, stock: null }));
    }
  };

  const validateForm = () => {
    const errs = {};

    const idVal = validateUniqueId(form.id, existingIds, isEditing ? inventoryToEdit.id : null, "Inventory Reference ID");
    if (!idVal.isValid) errs.id = idVal.error;

    const skuVal = validateRequiredText(form.sku, "SKU / Barcode Identifier", 2);
    if (!skuVal.isValid) errs.sku = skuVal.error;

    const prodVal = validateRequiredText(form.product, "Target Product Name", 2);
    if (!prodVal.isValid) errs.product = prodVal.error;

    const inVal = validateNonNegativeNumber(form.in, "Inward Received");
    if (!inVal.isValid) errs.in = inVal.error;

    const outVal = validateNonNegativeNumber(form.out, "Outward Dispatched");
    if (!outVal.isValid) {
      errs.out = outVal.error;
    } else if (Number(form.out) > Number(form.in)) {
      errs.out = "Outward dispatched cannot exceed inward received quantity.";
    }

    const stockVal = validateNonNegativeNumber(form.stock, "Current Stock Balance");
    if (!stockVal.isValid) errs.stock = stockVal.error;

    const locVal = validateRequiredText(form.location, "Warehouse Storage Bay / Location", 2);
    if (!locVal.isValid) errs.location = locVal.error;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Boxes size={19} style={{ color: "var(--primary)" }} />
            {isEditing ? `Edit Inventory Entry: ${inventoryToEdit.sku}` : "Record Stock Entry & Warehouse Movement"}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <ValidationSummary errors={errors} title="Please resolve the following inventory errors:" />

            <div className="form-grid">
              <div className="form-group">
                <label>Inventory Reference ID <RequiredStar /></label>
                <input
                  className={`form-input ${errors.id ? "is-invalid" : ""}`}
                  value={form.id}
                  onChange={(e) => handleFieldChange("id", e.target.value)}
                />
                <FieldError error={errors.id} />
              </div>

              <div className="form-group">
                <label>SKU / Barcode Identifier <RequiredStar /></label>
                <input
                  className={`form-input ${errors.sku ? "is-invalid" : ""}`}
                  placeholder="e.g. LE-PIPE-01"
                  value={form.sku}
                  onChange={(e) => handleFieldChange("sku", e.target.value)}
                />
                <FieldError error={errors.sku} />
              </div>

              <div className="form-group full">
                <label>Target Product Name <RequiredStar /></label>
                <input
                  className={`form-input ${errors.product ? "is-invalid" : ""}`}
                  list="inventoryProdList"
                  placeholder="Select or enter product name"
                  value={form.product}
                  onChange={(e) => handleFieldChange("product", e.target.value)}
                />
                <datalist id="inventoryProdList">
                  {products.map(p => <option key={p.id} value={p.name} />)}
                </datalist>
                <FieldError error={errors.product} />
                <span className="form-help">Syncs directly with catalogue items</span>
              </div>

              <div className="form-group">
                <label>Inward Received (+Stock In) <RequiredStar /></label>
                <input
                  type="number"
                  min="0"
                  className={`form-input ${errors.in ? "is-invalid" : ""}`}
                  value={form.in}
                  onChange={(e) => handleInChange(Number(e.target.value) || 0)}
                />
                <FieldError error={errors.in} />
              </div>

              <div className="form-group">
                <label>Outward Dispatched (-Stock Out) <RequiredStar /></label>
                <input
                  type="number"
                  min="0"
                  className={`form-input ${errors.out ? "is-invalid" : ""}`}
                  value={form.out}
                  onChange={(e) => handleOutChange(Number(e.target.value) || 0)}
                />
                <FieldError error={errors.out} />
              </div>

              <div className="form-group">
                <label>Current Stock Balance <RequiredStar /></label>
                <input
                  type="number"
                  min="0"
                  className={`form-input ${errors.stock ? "is-invalid" : ""}`}
                  value={form.stock}
                  onChange={(e) => handleFieldChange("stock", Number(e.target.value) || 0)}
                />
                <FieldError error={errors.stock} />
              </div>

              <div className="form-group">
                <label>Stock Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                >
                  <option value="In Stock">In Stock (Normal)</option>
                  <option value="Low Stock">Low Stock (Needs Reorder)</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div className="form-group full">
                <label>Warehouse Storage Bay / Location <RequiredStar /></label>
                <input
                  className={`form-input ${errors.location ? "is-invalid" : ""}`}
                  placeholder="e.g. Warehouse A - Bay 12, Shelf 04"
                  value={form.location || ""}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                />
                <FieldError error={errors.location} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              <Save size={15} /> {isEditing ? "Save Stock Entry" : "Record Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// DEDICATED EDITABLE INVENTORY LOGISTICS PAGE
// ==========================================================================
function InventoryPage({ inventory, onSaveInventory, products }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [deletingInventory, setDeletingInventory] = useState(null);
  const [viewingInventory, setViewingInventory] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const nextId = useMemo(() => {
    const ids = inventory
      .map(i => {
        const match = i.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = ids.length ? Math.max(...ids) : 0;
    return `INV-${String(maxNum + 1).padStart(3, "0")}`;
  }, [inventory]);

  const filtered = useMemo(() => {
    return inventory.filter(i => {
      const matchesStatus = statusFilter === "All" || i.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        i.product.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        (i.location && i.location.toLowerCase().includes(q))
      );
      return matchesStatus && matchesSearch;
    });
  }, [inventory, search, statusFilter]);

  const totalIn = useMemo(() => inventory.reduce((sum, i) => sum + (Number(i.in) || 0), 0), [inventory]);
  const totalOut = useMemo(() => inventory.reduce((sum, i) => sum + (Number(i.out) || 0), 0), [inventory]);
  const totalBalance = useMemo(() => inventory.reduce((sum, i) => sum + (Number(i.stock) || 0), 0), [inventory]);
  const lowCount = useMemo(() => inventory.filter(i => i.status === "Low Stock" || i.status === "Out of Stock").length, [inventory]);

  const handleOpenAdd = () => {
    setEditingInventory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingInventory(item);
    setModalOpen(true);
  };

  const handleSaveInventory = (itemData) => {
    if (editingInventory) {
      const updated = inventory.map(i => i.id === editingInventory.id ? itemData : i);
      onSaveInventory(updated);
      showToast(`✓ Updated stock entry for ${itemData.product}!`);
    } else {
      const exists = inventory.some(i => i.id.toLowerCase() === itemData.id.toLowerCase());
      if (exists) {
        showToast(`⚠️ An inventory record with ID ${itemData.id} already exists.`);
        return;
      }
      const updated = [itemData, ...inventory];
      onSaveInventory(updated);
      showToast(`✓ Recorded stock movement for ${itemData.product}!`);
    }
    setModalOpen(false);
    setEditingInventory(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingInventory) return;
    const updated = inventory.filter(i => i.id !== deletingInventory.id);
    onSaveInventory(updated);
    showToast(`✓ Inventory entry ${deletingInventory.sku} removed.`);
    if (viewingInventory && viewingInventory.id === deletingInventory.id) {
      setViewingInventory(null);
    }
    setDeletingInventory(null);
  };

  const handleQuickAdjust = (item, adjustments) => {
    const updated = inventory.map(i => i.id === item.id ? { ...i, ...adjustments } : i);
    onSaveInventory(updated);
    if (viewingInventory && viewingInventory.id === item.id) {
      setViewingInventory(prev => ({ ...prev, ...adjustments }));
    }
  };

  const handleExportCSV = () => {
    const headers = ["Inventory_ID", "Product_Name", "SKU_Barcode", "Received_In", "Dispatched_Out", "Current_Balance", "Status", "Storage_Location"];
    const rows = filtered.map(i => [
      `"${i.id}"`,
      `"${i.product}"`,
      `"${i.sku}"`,
      i.in,
      i.out,
      i.stock,
      `"${i.status}"`,
      `"${i.location || 'Default Warehouse'}"`
    ]);
    downloadCSV(`laxmi_enterprises_inventory_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast("✓ Exported warehouse inventory ledger.");
  };

  return (
    <div className="page">
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="module-quick-stats">
        <div className="client-stat-pill">
          <div className="client-stat-pill-icon"><Boxes size={20} /></div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Total Inward (Received)</div>
            <div style={{ fontSize: "21px", fontWeight: 800 }}>+{totalIn.toLocaleString("en-IN")} Units</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            <ShoppingCart size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Total Outward (Dispatched)</div>
            <div style={{ fontSize: "21px", fontWeight: 800 }}>-{totalOut.toLocaleString("en-IN")} Units</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            <Warehouse size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Active Storage Balance</div>
            <div style={{ fontSize: "21px", fontWeight: 800, color: "var(--success)" }}>{totalBalance.toLocaleString("en-IN")} Units</div>
          </div>
        </div>

        <div className="client-stat-pill">
          <div className="client-stat-pill-icon" style={{ background: lowCount > 0 ? "var(--warning-light)" : "var(--primary-light)", color: lowCount > 0 ? "var(--warning)" : "var(--primary)" }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>Low / Critical Stock</div>
            <div style={{ fontSize: "21px", fontWeight: 800, color: lowCount > 0 ? "var(--warning)" : "var(--text-main)" }}>{lowCount} SKUs</div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="page-actions" style={{ alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div className="filter-pills-bar">
          {["All", "In Stock", "Low Stock", "Out of Stock"].map(st => (
            <button
              key={st}
              className={`filter-pill ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st} ({st === "All" ? inventory.length : inventory.filter(i => i.status === st).length})
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <ExportMenu
            label="Export"
            category="Inventory"
            onExportCSV={handleExportCSV}
            showToast={showToast}
          />
          <button className="primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Stock Entry
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card table-card">
        <div className="table-toolbar">
          <div className="local-search">
            <Search size={16} />
            <input
              placeholder="Search by product, SKU, bay location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing {filtered.length} of {inventory.length} records
          </span>
        </div>

        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Boxes size={26} /></div>
              <h4 style={{ fontSize: 16, color: "var(--text-main)", marginBottom: 6 }}>No Stock Records Found</h4>
              <p style={{ fontSize: 13, marginBottom: 16 }}>No inventory entries match your search query or filter.</p>
              <button className="primary" onClick={handleOpenAdd}><Plus size={15} /> Record Stock Entry</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Entry ID</th>
                  <th>Product Item</th>
                  <th>SKU Code</th>
                  <th>Stock In (+)</th>
                  <th>Stock Out (-)</th>
                  <th>Balance Units</th>
                  <th>Bay Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => {
                  const isOut = i.status === "Out of Stock" || i.stock <= 0;
                  const isLow = i.status === "Low Stock";
                  return (
                    <tr key={i.id}>
                      <td>
                        <button
                          type="button"
                          onClick={() => setViewingInventory(i)}
                          title="Inspect item in slide-over drawer"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                        >
                          <code style={{
                            color: "var(--primary)",
                            fontWeight: 700,
                            background: "rgba(0, 91, 181, 0.08)",
                            padding: "3px 7px",
                            borderRadius: 4
                          }}>
                            {i.id}
                          </code>
                        </button>
                      </td>
                      <td>
                        <b
                          onClick={() => setViewingInventory(i)}
                          style={{ cursor: "pointer", color: "var(--text-main)" }}
                          title="Click to inspect stock details"
                        >
                          {i.product}
                        </b>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "monospace", fontSize: 12 }}>
                          <Barcode size={13} style={{ color: "var(--text-muted)" }} /> {i.sku}
                        </span>
                      </td>
                      <td style={{ color: "var(--success)", fontWeight: 700 }}>+{i.in}</td>
                      <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>-{i.out}</td>
                      <td>
                        <b style={{ color: isOut ? "var(--danger)" : isLow ? "var(--warning)" : "var(--text-main)" }}>
                          {i.stock}
                        </b>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Warehouse size={12} style={{ color: "var(--accent)" }} /> {i.location || "Warehouse A"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isOut ? "danger" : isLow ? "warning" : "success"}`}>
                          <span
                            className={`badge-dot ${!isOut && !isLow ? "pulse" : ""}`}
                            style={{
                              background: isOut ? "#ef4444" : isLow ? "#f59e0b" : "#10b981",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              display: "inline-block",
                              marginRight: 6
                            }}
                          />
                          {i.status}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            title="Inspect Stock Telemetry & Warehouse Bay"
                            onClick={() => setViewingInventory(i)}
                            style={{ color: "var(--accent)" }}
                          >
                            <Eye size={14} />
                          </button>
                          <button title="Edit Stock Record" onClick={() => handleOpenEdit(i)}>
                            <Pencil size={14} />
                          </button>
                          <button title="Delete Record" onClick={() => setDeletingInventory(i)}>
                            <Trash2 size={14} style={{ color: "var(--danger)" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <InventoryModal
        key={editingInventory ? editingInventory.id : "new-inventory"}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingInventory(null); }}
        onSave={handleSaveInventory}
        inventoryToEdit={editingInventory}
        products={products}
        nextId={nextId}
        existingIds={inventory.map(i => i.id)}
      />

      <DeleteConfirmModal
        isOpen={!!deletingInventory}
        onClose={() => setDeletingInventory(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Inventory Deletion"
        message={deletingInventory ? `Are you sure you want to delete the stock movement ledger for ${deletingInventory.product} (${deletingInventory.sku})?` : ""}
        details={deletingInventory ? `Entry shows ${deletingInventory.in} received, ${deletingInventory.out} dispatched, and ${deletingInventory.stock} balance units.` : ""}
      />

      {/* SLIDE-OVER INSPECTION DRAWER & TELEMETRY */}
      <InventoryViewDrawer
        isOpen={!!viewingInventory}
        onClose={() => setViewingInventory(null)}
        inventoryItem={viewingInventory}
        inventoryList={filtered}
        onNavigateItem={(item) => setViewingInventory(item)}
        products={products}
        onEdit={(item) => {
          setViewingInventory(null);
          handleOpenEdit(item);
        }}
        onDelete={(item) => {
          setViewingInventory(null);
          setDeletingInventory(item);
        }}
        onQuickAdjust={handleQuickAdjust}
        showToast={showToast}
      />

    </div>
  );
}

// ==========================================================================
// REVENUE & FINANCIAL INTELLIGENCE DASHBOARD
// ==========================================================================
function Revenue({ clients = [], invoices = initialInvoices, onSaveInvoices, company = {} }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadPDF = (inv) => {
    try {
      const client = clients.find(c => c.id === inv.clientId || c.name === inv.clientName);
      const { fileName } = generateInvoicePDF(inv, company, client || {});
      showToast(`✓ Downloaded ${fileName} to your PC`);
    } catch (err) {
      alert("Failed to download PDF: " + err.message);
    }
  };


  const currentInvoices = invoices && invoices.length > 0 ? invoices : initialInvoices;

  const nextInvoiceId = useMemo(() => {
    const ids = currentInvoices
      .map(inv => {
        const match = inv.id.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const maxNum = ids.length ? Math.max(...ids) : 0;
    return `LE-INV-2026-${String(maxNum + 1).padStart(3, "0")}`;
  }, [currentInvoices]);

  const filteredInvoices = useMemo(() => {
    return currentInvoices.filter(inv => {
      const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        inv.id.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q) ||
        (inv.category && inv.category.toLowerCase().includes(q)) ||
        (inv.paymentMethod && inv.paymentMethod.toLowerCase().includes(q))
      );
      return matchesStatus && matchesSearch;
    });
  }, [currentInvoices, search, statusFilter]);

  // High-Level Commercial KPIs
  const grossInvoiced = useMemo(() => {
    return currentInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  }, [currentInvoices]);

  const realizedCollections = useMemo(() => {
    return currentInvoices
      .filter(inv => inv.status === "Paid")
      .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  }, [currentInvoices]);

  const outstandingReceivables = useMemo(() => {
    return currentInvoices
      .filter(inv => inv.status === "Pending" || inv.status === "Overdue")
      .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  }, [currentInvoices]);

  const avgTicket = useMemo(() => {
    return currentInvoices.length ? Math.round(grossInvoiced / currentInvoices.length) : 0;
  }, [grossInvoiced, currentInvoices]);

  const handleAddInvoice = (newInv) => {
    const updated = [newInv, ...currentInvoices];
    if (onSaveInvoices) onSaveInvoices(updated);
    setIsInvoiceModalOpen(false);
    showToast(`✓ Logged invoice ${newInv.id} for ${newInv.clientName}`);
  };

  const handleToggleStatus = (invoice) => {
    const order = ["Paid", "Pending", "Overdue"];
    const currentIdx = order.indexOf(invoice.status);
    const nextStatus = order[(currentIdx + 1) % order.length];
    const updated = currentInvoices.map(inv => inv.id === invoice.id ? { ...inv, status: nextStatus } : inv);
    if (onSaveInvoices) onSaveInvoices(updated);
    showToast(`✓ Updated ${invoice.id} status to ${nextStatus}`);
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm(`Delete commercial invoice record ${id}?`)) {
      const updated = currentInvoices.filter(inv => inv.id !== id);
      if (onSaveInvoices) onSaveInvoices(updated);
      showToast(`✓ Invoice ${id} deleted.`);
    }
  };

  const handleResetDemoLedger = () => {
    if (onSaveInvoices) onSaveInvoices(initialInvoices);
    showToast("✓ Restored 12 verified commercial invoices ledger!");
  };

  const handleExportCSV = () => {
    const headers = ["Invoice ID", "Client Name", "Client ID", "Date", "Due Date", "Taxable Value (INR)", "GST Tax (INR)", "Total Amount (INR)", "Status", "Payment Method", "Category"];
    const rows = filteredInvoices.map(inv => [
      `"${inv.id}"`,
      `"${inv.clientName}"`,
      `"${inv.clientId || ''}"`,
      `"${inv.date}"`,
      `"${inv.dueDate}"`,
      inv.amount,
      inv.tax,
      inv.total,
      `"${inv.status}"`,
      `"${inv.paymentMethod || ''}"`,
      `"${inv.category || ''}"`
    ]);
    downloadCSV(`laxmi_enterprises_invoices_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast("✓ Exported invoices ledger CSV.");
  };

  return (
    <div className="page">
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner / Actions Bar */}
      <div className="page-actions" style={{ alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
            Revenue & Commercial Intelligence
          </h2>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
            FY 2025-26 fiscal cash flows, tax invoice ledger & realization analytics
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button 
            type="button"
            className="outline" 
            onClick={handleResetDemoLedger}
            title="Restore 12 verified demo commercial invoices"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RotateCcw size={14} /> Reset Demo Ledger
          </button>

          <ExportMenu
            label="Export Financials"
            category="Revenue & Financials"
            onExportCSV={handleExportCSV}
            showToast={showToast}
          />

          <button className="primary" onClick={() => setIsInvoiceModalOpen(true)}>
            <Plus size={16} /> Log Invoice
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        <StatCard 
          title="Gross Turnover YTD" 
          value={`₹${(grossInvoiced / 100000).toFixed(2)}L`} 
          change="+14.8% YoY" 
          icon={IndianRupee} 
        />
        <StatCard 
          title="Realized Collections" 
          value={`₹${(realizedCollections / 100000).toFixed(2)}L`} 
          change="92.4% Realized" 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Outstanding Receivables" 
          value={`₹${(outstandingReceivables / 100000).toFixed(2)}L`} 
          change={`${currentInvoices.filter(i => i.status !== 'Paid').length} Invoices`} 
          icon={AlertTriangle} 
        />
        <StatCard 
          title="Average Ticket Size" 
          value={`₹${avgTicket.toLocaleString("en-IN")}`} 
          change="+6.2% vs Q3" 
          icon={ShoppingCart} 
        />
      </div>

      {/* Quarterly Targets & Milestone Grid */}
      <div className="quarter-grid">
        {quarterlyRevenue.map((q, idx) => {
          const pct = Math.min(100, Math.round((q.revenue / q.target) * 100));
          return (
            <div key={idx} className="quarter-card">
              <div className="quarter-card-header">
                <span>{q.quarter}</span>
                <span style={{ color: "var(--success)", fontWeight: 700 }}>{q.growth}</span>
              </div>
              <div className="quarter-val">₹{(q.revenue / 100000).toFixed(2)} Lakhs</div>
              <div className="quarter-target">
                <span>Target: ₹{(q.target / 100000).toFixed(2)}L</span>
                <span>Margin: {q.margin}</span>
              </div>
              <div className="quarter-progress-track">
                <div className="quarter-progress-bar" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Interactive Charts */}
      <div className="revenue-split-grid">
        {/* Left: Monthly Inflow vs Realization Area Chart */}
        <div className="card chart-card">
          <div className="card-head" style={{ padding: "18px 20px" }}>
            <div>
              <h3>12-Month Invoiced vs Realized Cash Flow</h3>
              <p>Comparative monthly billing inflow and bank collection trajectory</p>
            </div>
          </div>
          <div className="chart" style={{ padding: "10px 16px 20px 8px" }}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyFinancials}>
                <defs>
                  <linearGradient id="invoicedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `₹${v / 1000}k`} fontSize={11} />
                <Tooltip 
                  formatter={(v, name) => [`₹${Number(v).toLocaleString("en-IN")}`, name === "invoiced" ? "Gross Invoiced" : "Cash Realized"]}
                  contentStyle={{
                    background: "var(--card-bg)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-md)"
                  }}
                />
                <Area type="monotone" dataKey="invoiced" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#invoicedGrad)" />
                <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#collectedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, fontSize: "12px", color: "var(--text-muted)", marginTop: 6 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--primary)" }} /> Gross Invoiced
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#10b981" }} /> Cash Realized
              </span>
            </div>
          </div>
        </div>

        {/* Right: Industrial Category Contribution Donut */}
        <div className="card chart-card">
          <div className="card-head" style={{ padding: "18px 20px" }}>
            <div>
              <h3>Turnover by Category</h3>
              <p>Industrial product lines distribution</p>
            </div>
          </div>
          <div style={{ padding: "10px 20px 20px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(v) => [`₹${(Number(v) / 100000).toFixed(2)} Lakhs`, "Turnover"]}
                  contentStyle={{
                    background: "var(--card-bg)",
                    borderColor: "var(--border)",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="category-legend-list" style={{ width: "100%" }}>
              {categoryRevenue.map((cat, idx) => (
                <div key={idx} className="category-legend-item">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="category-legend-dot" style={{ background: cat.color }} />
                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, marginRight: 8 }}>{cat.percent}%</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>₹{(cat.value / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Invoicing & Billing Ledger */}
      <div className="card table-card">
        <div className="card-head" style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3>Commercial Invoicing & Tax Ledger</h3>
            <p>12 verified GST invoices, collection terms and accounts receivable</p>
          </div>

          <div className="filter-pills-bar">
            {["All", "Paid", "Pending", "Overdue"].map(st => (
              <button
                key={st}
                className={`filter-pill ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st} ({st === "All" ? currentInvoices.length : currentInvoices.filter(i => i.status === st).length})
              </button>
            ))}
          </div>
        </div>

        <div className="table-toolbar">
          <div className="local-search">
            <Search size={16} />
            <input
              placeholder="Search by invoice #, client name, category, payment mode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing {filteredInvoices.length} of {currentInvoices.length} commercial invoices
          </span>
        </div>

        <div className="table-wrap">
          {filteredInvoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Receipt size={26} /></div>
              <h4 style={{ fontSize: 16, color: "var(--text-main)", marginBottom: 6 }}>No Invoices Found</h4>
              <p style={{ fontSize: 13, marginBottom: 16 }}>
                {currentInvoices.length === 0
                  ? "Your commercial ledger is currently empty. Click below to load 12 verified commercial invoices."
                  : "No invoice records match your current search query or status filter."}
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                {currentInvoices.length === 0 && (
                  <button className="primary" onClick={handleResetDemoLedger}>
                    <RotateCcw size={15} /> Load 12 Commercial Invoices
                  </button>
                )}
                <button className="outline" onClick={() => setIsInvoiceModalOpen(true)}>
                  <Plus size={15} /> Log New Invoice
                </button>
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Client Account</th>
                  <th>Category & Mode</th>
                  <th>Invoice Date</th>
                  <th>Due Date</th>
                  <th>Taxable Value</th>
                  <th>Total Amount</th>
                  <th>Status (Click to Toggle)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><code>{inv.id}</code></td>
                    <td>
                      <div className="person">
                        <div className="mini-avatar">{inv.clientName[0]}</div>
                        <div>
                          <b>{inv.clientName}</b>
                          {inv.clientId && (
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              Acc: {inv.clientId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "12.5px" }}>{inv.category || "Hardware"}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{inv.paymentMethod || "NEFT / RTGS"}</div>
                      </div>
                    </td>
                    <td>{inv.date}</td>
                    <td>
                      <span style={{ 
                        color: inv.status === "Overdue" ? "var(--danger)" : "inherit",
                        fontWeight: inv.status === "Overdue" ? 700 : "normal"
                      }}>
                        {inv.dueDate}
                      </span>
                    </td>
                    <td className="money" style={{ color: "var(--text-muted)" }}>
                      ₹{Number(inv.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="money">
                      <b>₹{Number(inv.total).toLocaleString("en-IN")}</b>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(inv)}
                        title="Click to cycle status: Paid -> Pending -> Overdue"
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
                      >
                        <span className={`badge ${
                          inv.status === "Paid" 
                            ? "paid" 
                            : inv.status === "Pending" 
                              ? "pending-payment" 
                              : "overdue"
                        }`}>
                          <span
                            className={`badge-dot ${inv.status === "Paid" ? "pulse" : ""}`}
                            style={{
                              background: inv.status === "Paid" ? "#10b981" : inv.status === "Pending" ? "#f59e0b" : "#ef4444",
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              display: "inline-block",
                              marginRight: 6
                            }}
                          />
                          {inv.status}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div className="row-actions" style={{ justifyContent: "center", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(inv)}
                          title="Download PDF to PC"
                          style={{
                            background: "rgba(0, 91, 181, 0.08)",
                            color: "var(--primary)",
                            border: "1px solid rgba(0, 91, 181, 0.25)",
                            borderRadius: 6,
                            padding: "4px 8px",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          <Download size={13} />
                          <span>PDF</span>
                        </button>


                        <button
                          type="button"
                          title="Preview & Print Invoice"
                          onClick={() => setSelectedInvoice(inv)}
                          style={{
                            background: "none",
                            border: "1px solid var(--border)",
                            borderRadius: 6,
                            padding: 5,
                            cursor: "pointer"
                          }}
                        >
                          <Receipt size={14} />
                        </button>

                        <button
                          type="button"
                          title="Delete Invoice Record"
                          onClick={() => handleDeleteInvoice(inv.id)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 5,
                            color: "var(--danger)",
                            cursor: "pointer"
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSave={handleAddInvoice}
        clients={clients}
        nextId={nextInvoiceId}
      />

      <InvoiceViewModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        company={company}
        client={clients.find(c => c.id === selectedInvoice?.clientId || c.name === selectedInvoice?.clientName)}
        onDelete={(inv) => {
          setSelectedInvoice(null);
          handleDeleteInvoice(inv.id);
        }}
        showToast={showToast}
      />
    </div>
  );
}


// ==========================================================================
// ADMIN WORKSPACE COMPONENT
// ==========================================================================
function AdminWorkspace({ 
  adminProfile, setAdminProfile, 
  company, setCompany, 
  systemPrefs, setSystemPrefs,
  onOpenDriveModal,
  onOpenCredsModal
}) {
  const [activeTab, setActiveTab] = useState("company");
  const [toast, setToast] = useState(null);
  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = localStorage.getItem("le_team_members");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return initialTeamMembers;
  });
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    email: "",
    role: "Warehouse & Inventory"
  });

  // Local form states
  const [compForm, setCompForm] = useState(company);
  const [profForm, setProfForm] = useState(adminProfile);
  const [prefsForm, setPrefsForm] = useState(systemPrefs);

  // Form error states
  const [compErrors, setCompErrors] = useState({});
  const [profErrors, setProfErrors] = useState({});
  const [memberErrors, setMemberErrors] = useState({});

  // Sync if parent state changes
  useEffect(() => {
    setCompForm(company);
  }, [company]);

  useEffect(() => {
    setProfForm(adminProfile);
  }, [adminProfile]);

  useEffect(() => {
    setPrefsForm(systemPrefs);
  }, [systemPrefs]);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    const errs = {};

    const nameVal = validateRequiredText(compForm.name, "Company Legal Name", 2);
    if (!nameVal.isValid) errs.name = nameVal.error;

    const gstinVal = validateGSTIN(compForm.gstin, true);
    if (!gstinVal.isValid) errs.gstin = gstinVal.error;

    const panVal = validatePAN(compForm.pan, true);
    if (!panVal.isValid) errs.pan = panVal.error;

    const emailVal = validateEmail(compForm.email, true);
    if (!emailVal.isValid) errs.email = emailVal.error;

    const phoneVal = validateMobile(compForm.phone, true);
    if (!phoneVal.isValid) errs.phone = phoneVal.error;

    const addrVal = validateRequiredText(compForm.address, "Registered Address", 5);
    if (!addrVal.isValid) errs.address = addrVal.error;

    if (Object.keys(errs).length > 0) {
      setCompErrors(errs);
      return;
    }

    setCompErrors({});
    setCompany(compForm);
    localStorage.setItem("le_company", JSON.stringify(compForm));
    showNotification("✓ Company Profile & Tax Registration saved!");
  };

  const handleSaveAdmin = (e) => {
    e.preventDefault();
    const errs = {};

    const nameVal = validateRequiredText(profForm.name, "Admin Display Name", 2);
    if (!nameVal.isValid) errs.name = nameVal.error;

    const roleVal = validateRequiredText(profForm.role, "Assigned Administrative Role", 2);
    if (!roleVal.isValid) errs.role = roleVal.error;

    const emailVal = validateEmail(profForm.email, true);
    if (!emailVal.isValid) errs.email = emailVal.error;

    if (profForm.phone && profForm.phone.trim()) {
      const phoneVal = validateMobile(profForm.phone, false);
      if (!phoneVal.isValid) errs.phone = phoneVal.error;
    }

    if (Object.keys(errs).length > 0) {
      setProfErrors(errs);
      return;
    }

    setProfErrors({});
    setAdminProfile(profForm);
    localStorage.setItem("le_admin_profile", JSON.stringify(profForm));
    showNotification("✓ Administrator Credentials & Security settings updated!");
  };

  const handleSavePrefs = (e) => {
    e.preventDefault();
    setSystemPrefs(prefsForm);
    localStorage.setItem("le_system_prefs", JSON.stringify(prefsForm));
    showNotification("✓ Operational rules & warehouse preferences saved!");
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    const errs = {};

    const nameVal = validateRequiredText(newMemberForm.name, "Full Name", 2);
    if (!nameVal.isValid) errs.name = nameVal.error;

    const emailVal = validateEmail(newMemberForm.email, true);
    if (!emailVal.isValid) {
      errs.email = emailVal.error;
    } else {
      const emailLower = newMemberForm.email.trim().toLowerCase();
      if (teamMembers.some(m => m.email.toLowerCase() === emailLower)) {
        errs.email = "A team member with this email address already exists.";
      }
    }

    if (Object.keys(errs).length > 0) {
      setMemberErrors(errs);
      return;
    }

    setMemberErrors({});
    const newMember = {
      id: `TM-${String(teamMembers.length + 1).padStart(3, "0")}`,
      name: newMemberForm.name.trim(),
      email: newMemberForm.email.trim(),
      role: newMemberForm.role,
      status: "Active",
      lastLogin: "Never"
    };
    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    localStorage.setItem("le_team_members", JSON.stringify(updated));
    setIsAddMemberOpen(false);
    setNewMemberForm({ name: "", email: "", role: "Warehouse & Inventory" });
    showNotification(`✓ Added ${newMember.name} to team roster!`);
  };

  const handleDeleteMember = (memberId, memberName) => {
    if (teamMembers.length <= 1) {
      showNotification("⚠️ Cannot remove the primary administrator account.");
      return;
    }
    if (window.confirm(`Revoke credentials and remove ${memberName} from team access?`)) {
      const updated = teamMembers.filter(m => m.id !== memberId);
      setTeamMembers(updated);
      localStorage.setItem("le_team_members", JSON.stringify(updated));
      showNotification(`✓ Access revoked for ${memberName}`);
    }
  };

  return (
    <div className="page">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Status Banner */}
      <div className="admin-header-banner">
        <div className="admin-banner-content">
          <h2>
            <ShieldCheck size={24} style={{ color: "var(--primary)" }} />
            Laxmi Enterprises Admin Workspace
          </h2>
          <p>
            Centralized management console for enterprise settings, company registry, user permissions, and warehouse controls.
          </p>
        </div>
        <div className="admin-banner-meta">
          <span className="badge brand">Status: Operational (v1.0.0)</span>
          <span className="badge success">Role: {adminProfile.role}</span>
          <span className="badge" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", fontWeight: 600 }}>
            Cloud Vault: Protected
          </span>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === "company" ? "active" : ""}`}
          onClick={() => setActiveTab("company")}
        >
          <Building2 size={16} /> Company & Tax Registry
        </button>
        <button 
          className={`admin-tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <UserCheck size={16} /> Administrator Profile
        </button>
        <button 
          className={`admin-tab ${activeTab === "roles" ? "active" : ""}`}
          onClick={() => setActiveTab("roles")}
        >
          <Key size={16} /> Roles & Team Access
        </button>
        <button 
          className={`admin-tab ${activeTab === "system" ? "active" : ""}`}
          onClick={() => setActiveTab("system")}
        >
          <Sliders size={16} /> Operational & Warehouse Rules
        </button>
      </div>

      {/* TAB 1: COMPANY & TAX REGISTRY */}
      {activeTab === "company" && (
        <form onSubmit={handleSaveCompany} className="workspace-card" noValidate>
          <div className="workspace-card-title">
            <Building size={18} style={{ color: "var(--primary)" }} />
            Corporate Identity & Legal Registry
          </div>
          <p className="workspace-card-subtitle">
            Official company credentials printed on export reports, commercial invoices, and client billing statements.
          </p>

          <ValidationSummary errors={compErrors} title="Please resolve company form errors:" />

          <div className="form-grid">
            <div className="form-group">
              <label>Company Legal Name <RequiredStar /></label>
              <input 
                className={`form-input ${compErrors.name ? "is-invalid" : ""}`} 
                value={compForm.name} 
                onChange={(e) => {
                  setCompForm({ ...compForm, name: e.target.value });
                  if (compErrors.name) setCompErrors(prev => ({ ...prev, name: null }));
                }} 
              />
              <FieldError error={compErrors.name} />
              <span className="form-help">Appears across all generated invoices and reports</span>
            </div>

            <div className="form-group">
              <label>Trade & Industry Line</label>
              <input 
                className="form-input" 
                value={compForm.tagline} 
                onChange={(e) => setCompForm({ ...compForm, tagline: e.target.value })} 
              />
              <span className="form-help">Primary enterprise sector</span>
            </div>

            <div className="form-group">
              <label>GSTIN (Goods & Services Tax ID) <RequiredStar /></label>
              <input 
                className={`form-input ${compErrors.gstin ? "is-invalid" : ""}`} 
                value={compForm.gstin} 
                onChange={(e) => {
                  setCompForm({ ...compForm, gstin: e.target.value.toUpperCase() });
                  if (compErrors.gstin) setCompErrors(prev => ({ ...prev, gstin: null }));
                }} 
              />
              <FieldError error={compErrors.gstin} />
              <span className="form-help">Format: 27AAACL1234F1Z5 (15 characters)</span>
            </div>

            <div className="form-group">
              <label>Permanent Account Number (PAN) <RequiredStar /></label>
              <input 
                className={`form-input ${compErrors.pan ? "is-invalid" : ""}`} 
                value={compForm.pan} 
                onChange={(e) => {
                  setCompForm({ ...compForm, pan: e.target.value.toUpperCase() });
                  if (compErrors.pan) setCompErrors(prev => ({ ...prev, pan: null }));
                }} 
              />
              <FieldError error={compErrors.pan} />
              <span className="form-help">Format: ABCDE1234F (10 characters)</span>
            </div>

            <div className="form-group">
              <label>Official Contact Email <RequiredStar /></label>
              <input 
                type="email" 
                className={`form-input ${compErrors.email ? "is-invalid" : ""}`} 
                value={compForm.email} 
                onChange={(e) => {
                  setCompForm({ ...compForm, email: e.target.value });
                  if (compErrors.email) setCompErrors(prev => ({ ...prev, email: null }));
                }} 
              />
              <FieldError error={compErrors.email} />
            </div>

            <div className="form-group">
              <label>Commercial Phone Number <RequiredStar /></label>
              <input 
                className={`form-input ${compErrors.phone ? "is-invalid" : ""}`} 
                value={compForm.phone} 
                onChange={(e) => {
                  setCompForm({ ...compForm, phone: e.target.value });
                  if (compErrors.phone) setCompErrors(prev => ({ ...prev, phone: null }));
                }} 
              />
              <FieldError error={compErrors.phone} />
              <span className="form-help">10-digit Indian phone number</span>
            </div>

            <div className="form-group full">
              <label>Registered Warehouse & Commercial Address <RequiredStar /></label>
              <textarea 
                className={`form-textarea ${compErrors.address ? "is-invalid" : ""}`} 
                value={compForm.address} 
                onChange={(e) => {
                  setCompForm({ ...compForm, address: e.target.value });
                  if (compErrors.address) setCompErrors(prev => ({ ...prev, address: null }));
                }} 
              />
              <FieldError error={compErrors.address} />
              <span className="form-help">Printed in invoice dispatch headers</span>
            </div>

            <div className="form-group">
              <label>Operating Currency</label>
              <select 
                className="form-select" 
                value={compForm.currency} 
                onChange={(e) => setCompForm({ ...compForm, currency: e.target.value })}
              >
                <option value="INR (₹)">Indian Rupee — INR (₹)</option>
                <option value="USD ($)">US Dollar — USD ($)</option>
                <option value="EUR (€)">Euro — EUR (€)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Active Financial Year</label>
              <input 
                className="form-input" 
                value={compForm.financialYear} 
                onChange={(e) => setCompForm({ ...compForm, financialYear: e.target.value })} 
              />
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="primary">
              <Save size={16} /> Save Company Details
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ADMINISTRATOR PROFILE */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveAdmin} className="workspace-card" noValidate>
          <div className="workspace-card-title">
            <UserCheck size={18} style={{ color: "var(--primary)" }} />
            Administrator Credentials & Role Details
          </div>
          <p className="workspace-card-subtitle">
            Configure your administrator identity displayed in the sidebar, activity logs, and system audits.
          </p>

          <ValidationSummary errors={profErrors} title="Please resolve admin profile errors:" />

          <div className="form-grid">
            <div className="form-group">
              <label>Admin Display Name <RequiredStar /></label>
              <input 
                className={`form-input ${profErrors.name ? "is-invalid" : ""}`} 
                value={profForm.name} 
                onChange={(e) => {
                  setProfForm({ ...profForm, name: e.target.value });
                  if (profErrors.name) setProfErrors(prev => ({ ...prev, name: null }));
                }} 
              />
              <FieldError error={profErrors.name} />
              <span className="form-help">Displayed in the sidebar footer and topbar</span>
            </div>

            <div className="form-group">
              <label>Assigned Administrative Role <RequiredStar /></label>
              <input 
                className={`form-input ${profErrors.role ? "is-invalid" : ""}`} 
                value={profForm.role} 
                onChange={(e) => {
                  setProfForm({ ...profForm, role: e.target.value });
                  if (profErrors.role) setProfErrors(prev => ({ ...prev, role: null }));
                }} 
              />
              <FieldError error={profErrors.role} />
              <span className="form-help">e.g. Super Administrator, Proprietor, Operations Head</span>
            </div>

            <div className="form-group">
              <label>Admin Email Address <RequiredStar /></label>
              <input 
                type="email" 
                className={`form-input ${profErrors.email ? "is-invalid" : ""}`} 
                value={profForm.email} 
                onChange={(e) => {
                  setProfForm({ ...profForm, email: e.target.value });
                  if (profErrors.email) setProfErrors(prev => ({ ...prev, email: null }));
                }} 
              />
              <FieldError error={profErrors.email} />
            </div>

            <div className="form-group">
              <label>Security & Emergency Mobile</label>
              <input 
                className={`form-input ${profErrors.phone ? "is-invalid" : ""}`} 
                value={profForm.phone} 
                onChange={(e) => {
                  setProfForm({ ...profForm, phone: e.target.value });
                  if (profErrors.phone) setProfErrors(prev => ({ ...prev, phone: null }));
                }} 
              />
              <FieldError error={profErrors.phone} />
              <span className="form-help">10-digit emergency contact phone</span>
            </div>

            <div className="form-group full" style={{ marginTop: 12 }}>
              <label style={{ marginBottom: 10 }}>Security & Notification Channels</label>
              
              <div className="toggle-list">
                <div className="toggle-row">
                  <div className="toggle-info">
                    <b>Two-Factor Authentication (2FA)</b>
                    <small>Enforce SMS / Authenticator verification upon login</small>
                  </div>
                  <button 
                    type="button" 
                    className={`toggle-switch ${profForm.twoFactor ? "active" : ""}`}
                    onClick={() => setProfForm({ ...profForm, twoFactor: !profForm.twoFactor })}
                    aria-label="Toggle 2FA"
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>

                <div className="toggle-row">
                  <div className="toggle-info">
                    <b>Critical Email Security & Restock Alerts</b>
                    <small>Receive urgent notifications when inventory drops below threshold</small>
                  </div>
                  <button 
                    type="button" 
                    className={`toggle-switch ${profForm.emailAlerts ? "active" : ""}`}
                    onClick={() => setProfForm({ ...profForm, emailAlerts: !profForm.emailAlerts })}
                    aria-label="Toggle Email Alerts"
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>

                <div className="toggle-row">
                  <div className="toggle-info">
                    <b>WhatsApp Order & Commercial Updates</b>
                    <small>Receive daily commercial summaries and high-value orders on WhatsApp</small>
                  </div>
                  <button 
                    type="button" 
                    className={`toggle-switch ${profForm.whatsappAlerts ? "active" : ""}`}
                    onClick={() => setProfForm({ ...profForm, whatsappAlerts: !profForm.whatsappAlerts })}
                    aria-label="Toggle WhatsApp Alerts"
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="primary">
              <Save size={16} /> Save Admin Settings
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: ROLES & TEAM ACCESS */}
      {activeTab === "roles" && (
        <div className="workspace-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div className="workspace-card-title">
                <Key size={18} style={{ color: "var(--primary)" }} />
                Access Permissions & Team Members
              </div>
              <p className="workspace-card-subtitle" style={{ marginBottom: 0 }}>
                Control granular permissions for warehouse managers, sales executives, and finance staff.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {onOpenCredsModal && (
                <button
                  type="button"
                  className="outline"
                  onClick={onOpenCredsModal}
                  style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                >
                  <Key size={15} /> View Access Register
                </button>
              )}
              <button className="primary" onClick={() => setIsAddMemberOpen(true)} style={{ fontSize: "0.85rem", padding: "8px 14px" }}>
                <Plus size={15} /> Add Team Member
              </button>
            </div>
          </div>

          {/* Team Roster Table */}
          <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: 10, marginBottom: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((tm) => (
                  <tr key={tm.id}>
                    <td>
                      <div className="person">
                        <div className="mini-avatar">{tm.name[0]}</div>
                        <b>{tm.name}</b>
                      </div>
                    </td>
                    <td>{tm.email}</td>
                    <td>
                      <span className="role-tag">
                        <ShieldCheck size={12} /> {tm.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge success">{tm.status}</span>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{tm.lastLogin}</td>
                    <td>
                      <div className="row-actions">
                        <button title="Edit Role" onClick={() => {
                          const newRole = window.prompt(`Update role for ${tm.name} (Super Administrator / Warehouse & Inventory / Commercial Sales / Tax & Accounts):`, tm.role);
                          if (newRole && newRole !== tm.role) {
                            const updated = teamMembers.map(m => m.id === tm.id ? { ...m, role: newRole } : m);
                            setTeamMembers(updated);
                            localStorage.setItem("le_team_members", JSON.stringify(updated));
                            showNotification(`Updated role for ${tm.name} to ${newRole}`);
                          }
                        }}>
                          <Pencil size={14} />
                        </button>
                        <button title="Revoke Access" onClick={() => handleDeleteMember(tm.id, tm.name)}>
                          <Trash2 size={14} style={{ color: "var(--danger)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Permissions Matrix */}
          <div className="workspace-card-title" style={{ fontSize: 14 }}>
            Role Authority & Module Rights Matrix
          </div>
          <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Clients & CRM</th>
                  <th>Inventory & Products</th>
                  <th>Revenue & Invoicing</th>
                  <th>Admin Workspace</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Super Administrator</b></td>
                  <td><span className="badge success">Full Access (CRUD)</span></td>
                  <td><span className="badge success">Full Access (CRUD)</span></td>
                  <td><span className="badge success">Full Access (CRUD)</span></td>
                  <td><span className="badge success">Full Access</span></td>
                </tr>
                <tr>
                  <td><b>Warehouse & Inventory</b></td>
                  <td><span className="badge muted">Read Only</span></td>
                  <td><span className="badge success">Full Access (CRUD)</span></td>
                  <td><span className="badge warning">No Access</span></td>
                  <td><span className="badge warning">No Access</span></td>
                </tr>
                <tr>
                  <td><b>Commercial Sales</b></td>
                  <td><span className="badge success">Full Access (CRUD)</span></td>
                  <td><span className="badge muted">Read Stock</span></td>
                  <td><span className="badge brand">Create Orders</span></td>
                  <td><span className="badge warning">No Access</span></td>
                </tr>
                <tr>
                  <td><b>Tax & Accounts</b></td>
                  <td><span className="badge muted">Read Only</span></td>
                  <td><span className="badge muted">Read Only</span></td>
                  <td><span className="badge success">Full Access (Audits)</span></td>
                  <td><span className="badge warning">No Access</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: OPERATIONAL & WAREHOUSE RULES */}
      {activeTab === "system" && (
        <form onSubmit={handleSavePrefs} className="workspace-card">
          <div className="workspace-card-title">
            <Sliders size={18} style={{ color: "var(--primary)" }} />
            Operational Rules & Warehouse Configuration
          </div>
          <p className="workspace-card-subtitle">
            Configure stock safety limits, commercial invoice formatting, credit payment terms, and automated disaster recovery.
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label>Low Stock Warning Limit (Units)</label>
              <input 
                type="number"
                className="form-input" 
                value={prefsForm.minStockThreshold} 
                onChange={(e) => setPrefsForm({ ...prefsForm, minStockThreshold: Number(e.target.value) })} 
                required 
              />
              <span className="form-help">Items at or below this count trigger dashboard alerts</span>
            </div>

            <div className="form-group">
              <label>Commercial Payment Terms</label>
              <select 
                className="form-select" 
                value={prefsForm.paymentTerms || "Net 30 Days"} 
                onChange={(e) => setPrefsForm({ ...prefsForm, paymentTerms: e.target.value })}
              >
                <option value="Net 30 Days">Net 30 Days (Standard Commercial Invoice)</option>
                <option value="Net 15 Days">Net 15 Days (Prompt Settlement)</option>
                <option value="Immediate / COD">Immediate / Cash on Delivery (COD)</option>
                <option value="Advance Payment">100% Advance Payment Required</option>
                <option value="Net 60 Days">Net 60 Days (Enterprise Credit)</option>
              </select>
              <span className="form-help">Default payment credit terms applied to new invoices</span>
            </div>

            <div className="form-group">
              <label>Invoice Number Prefix</label>
              <input 
                className="form-input" 
                value={prefsForm.invoicePrefix || "LE-INV-"} 
                onChange={(e) => setPrefsForm({ ...prefsForm, invoicePrefix: e.target.value })} 
              />
              <span className="form-help">e.g. LE-INV-1001</span>
            </div>

            <div className="form-group">
              <label>Purchase Order Prefix</label>
              <input 
                className="form-input" 
                value={prefsForm.orderPrefix || "LE-ORD-"} 
                onChange={(e) => setPrefsForm({ ...prefsForm, orderPrefix: e.target.value })} 
              />
              <span className="form-help">e.g. LE-ORD-501</span>
            </div>

            <div className="form-group">
              <label>Commercial Billing Currency</label>
              <select 
                className="form-select" 
                value={prefsForm.currency || "INR (₹)"} 
                onChange={(e) => setPrefsForm({ ...prefsForm, currency: e.target.value })}
              >
                <option value="INR (₹)">INR (₹) - Indian Rupee (GST Compliant)</option>
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
              </select>
              <span className="form-help">Currency symbol printed on commercial vouchers and PDFs</span>
            </div>

            <div className="form-group">
              <label>Default Dispatch Warehouse Hub</label>
              <input 
                className="form-input" 
                value={prefsForm.dispatchWarehouse || "Central Warehouse - Bay A"} 
                onChange={(e) => setPrefsForm({ ...prefsForm, dispatchWarehouse: e.target.value })} 
                placeholder="e.g. Pune Central Logistics Hub"
              />
              <span className="form-help">Primary facility fulfillment origin</span>
            </div>

            <div className="form-group full">
              <div className="toggle-list">
                <div className="toggle-row">
                  <div className="toggle-info">
                    <b>Automated Nightly Cloud Backup</b>
                    <small>Automatically snapshot inventory and ledger records to secure cloud vault</small>
                  </div>
                  <button 
                    type="button" 
                    className={`toggle-switch ${prefsForm.autoBackup ? "active" : ""}`}
                    onClick={() => setPrefsForm({ ...prefsForm, autoBackup: !prefsForm.autoBackup })}
                    aria-label="Toggle Auto Backup"
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="primary">
              <Save size={16} /> Save Operational Rules
            </button>
          </div>
        </form>
      )}

      {/* Add Team Member Modal */}
      {isAddMemberOpen && (
        <div className="modal-backdrop" onClick={() => { setIsAddMemberOpen(false); setMemberErrors({}); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Key size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Add Team Member</h3>
              </div>
              <button className="icon-btn" onClick={() => { setIsAddMemberOpen(false); setMemberErrors({}); }} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddMember} style={{ padding: "18px 24px" }} noValidate>
              <ValidationSummary errors={memberErrors} title="Please fix team member errors:" />

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Full Name <RequiredStar /></label>
                <input
                  className={`form-input ${memberErrors.name ? "is-invalid" : ""}`}
                  placeholder="e.g. Suresh Shinde"
                  value={newMemberForm.name}
                  onChange={(e) => {
                    setNewMemberForm({ ...newMemberForm, name: e.target.value });
                    if (memberErrors.name) setMemberErrors(prev => ({ ...prev, name: null }));
                  }}
                  autoFocus
                />
                <FieldError error={memberErrors.name} />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Corporate Email <RequiredStar /></label>
                <input
                  type="email"
                  className={`form-input ${memberErrors.email ? "is-invalid" : ""}`}
                  placeholder="e.g. suresh.ops@laxmienterprises.com"
                  value={newMemberForm.email}
                  onChange={(e) => {
                    setNewMemberForm({ ...newMemberForm, email: e.target.value });
                    if (memberErrors.email) setMemberErrors(prev => ({ ...prev, email: null }));
                  }}
                />
                <FieldError error={memberErrors.email} />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Assigned Permission Role</label>
                <select
                  className="form-select"
                  value={newMemberForm.role}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                >
                  <option value="Warehouse & Inventory">Warehouse & Inventory</option>
                  <option value="Commercial Sales">Commercial Sales</option>
                  <option value="Tax & Accounts">Tax & Accounts</option>
                  <option value="Super Administrator">Super Administrator</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" className="outline" onClick={() => { setIsAddMemberOpen(false); setMemberErrors({}); }}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  <Check size={16} /> Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("le_theme");
    if (saved === "dark" || saved === "midnight") return "dark";
    return "light";
  });

  // Client Directory state with persistence (auto-populates with initialClients if empty)
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem("le_clients");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored clients were from old schema without agribusiness types, refresh to initialClients
          const hasAgriTypes = parsed.some(c => c.clientType === "Animal Feed Shop" || c.clientType === "Dairy" || c.clientType === "Farmers");
          if (!hasAgriTypes) {
            localStorage.setItem("le_clients", JSON.stringify(initialClients));
            return initialClients;
          }
          // Ensure core 3 accounts are present
          const existingIds = new Set(parsed.map(c => c.id));
          const missingCore = initialClients.filter(c => !existingIds.has(c.id));
          if (missingCore.length > 0) {
            const merged = [...missingCore, ...parsed];
            localStorage.setItem("le_clients", JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return initialClients;
  });

  const saveClients = (newClients) => {
    setClients(newClients);
    localStorage.setItem("le_clients", JSON.stringify(newClients));
  };

  // Commercial Invoices state with persistence
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem("le_invoices");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return initialInvoices;
  });

  const saveInvoices = (newInvoices) => {
    setInvoices(newInvoices);
    localStorage.setItem("le_invoices", JSON.stringify(newInvoices));
  };

  // Inward Purchases & Procurement state with persistence
  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem("le_purchases");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return initialPurchases;
  });

  const savePurchases = (newPurchases) => {
    setPurchases(newPurchases);
    localStorage.setItem("le_purchases", JSON.stringify(newPurchases));
  };

  // Expo Leads & Exhibition Visitors state with persistence
  const [expoLeads, setExpoLeads] = useState(() => {
    const saved = localStorage.getItem("le_expo_leads");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return initialExpoLeads;
  });

  const saveExpoLeads = (newLeads) => {
    setExpoLeads(newLeads);
    localStorage.setItem("le_expo_leads", JSON.stringify(newLeads));
  };

  // Products Catalogue state with persistence
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("le_products");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialProducts;
  });

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem("le_products", JSON.stringify(newProducts));
  };

  // Inventory Logistics state with persistence
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("le_inventory");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialInventory;
  });

  const saveInventory = (newInventory) => {
    setInventory(newInventory);
    localStorage.setItem("le_inventory", JSON.stringify(newInventory));
  };

  // Admin Profile state with persistence
  const [adminProfile, setAdminProfile] = useState(() => {
    const saved = localStorage.getItem("le_admin_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      name: "Chaitrali Shevtekar",
      role: "Super Administrator",
      email: "admin@laxmienterprises.com",
      phone: "+91 98234 56789",
      twoFactor: true,
      emailAlerts: true,
      whatsappAlerts: true
    };
  });

  // Company Profile state with persistence
  const [company, setCompany] = useState(() => {
    const saved = localStorage.getItem("le_company");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      name: "Laxmi Enterprises",
      tagline: "Industrial Supplies, Hardware & Trading",
      gstin: "27AAACL1234F1Z5",
      pan: "AAACL1234F",
      email: "contact@laxmienterprises.com",
      phone: "+91 98765 43210",
      address: "Shop No. 12, Commercial Complex, Near Industrial Estate, Pune - 411038, Maharashtra, India",
      currency: "INR (₹)",
      financialYear: "FY 2026-27"
    };
  });

  // System Preferences state with persistence
  const [systemPrefs, setSystemPrefs] = useState(() => {
    const saved = localStorage.getItem("le_system_prefs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      minStockThreshold: 20,
      autoBackup: true,
      orderPrefix: "LE-ORD-",
      invoicePrefix: "LE-INV-",
      paymentTerms: "Net 30 Days",
      currency: "INR (₹)",
      dispatchWarehouse: "Central Warehouse - Bay A"
    };
  });

  // Google Drive & Cloud State
  const [driveConfig, setDriveConfig] = useState(getDriveConfig());
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Authentication & Credentials State
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);

  const showGlobalToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showGlobalToast("Logged out successfully. Returned to Login screen.");
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.name) {
      setAdminProfile(prev => ({
        ...prev,
        name: user.name,
        role: user.role || prev.role,
        email: user.username || prev.email
      }));
    }
    showGlobalToast(`✓ Welcome, ${user.name || user.username}!`);
  };

  const handleExportMaster = () => {
    const masterData = {
      version: "2026.1",
      exportedAt: new Date().toISOString(),
      company,
      clients,
      products,
      inventory,
      revenueData,
      invoices,
      purchases,
      expoLeads,
      credentials: getStoredCredentials()
    };
    const blob = new Blob([JSON.stringify(masterData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laxmi_Enterprises_Master_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showGlobalToast("✓ Exported Consolidated Master ERP Backup (.json)");
  };

  const handleRestoreFromSnapshot = (snapshot) => {
    if (snapshot.clients) saveClients(snapshot.clients);
    if (snapshot.products) saveProducts(snapshot.products);
    if (snapshot.inventory) saveInventory(snapshot.inventory);
    if (snapshot.invoices) saveInvoices(snapshot.invoices);
    showGlobalToast("✓ ERP data successfully restored from Google Drive backup");
  };

  useEffect(() => {
    const activeTheme = (theme === "dark" || theme === "midnight") ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", activeTheme);
    localStorage.setItem("le_theme", activeTheme);
  }, [theme]);

  // If unauthenticated, show the Login Page directly
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="toast-notification" style={{ zIndex: 9999 }}>
            <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
            <span>{toastMessage}</span>
          </div>
        )}
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          currentTheme={theme}
          onSelectTheme={setTheme}
          showToast={showGlobalToast}
        />
        <CredentialsLedgerModal
          isOpen={isCredsModalOpen}
          onClose={() => setIsCredsModalOpen(false)}
          showToast={showGlobalToast}
        />
      </>
    );
  }

  return (
    <>
      {toastMessage && (
        <div className="toast-notification" style={{ zIndex: 9999 }}>
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <Layout 
        currentTheme={theme} 
        onSelectTheme={setTheme}
        adminProfile={adminProfile}
        driveConfig={driveConfig}
        onOpenDrive={() => setIsDriveModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenCreds={() => setIsCredsModalOpen(true)}
      >
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                clients={clients} 
                products={products} 
                inventory={inventory} 
                onExportMaster={handleExportMaster}
                onOpenDrive={() => setIsDriveModalOpen(true)}
                adminProfile={adminProfile}
                driveConfig={driveConfig}
              />
            } 
          />
          <Route 
            path="/login" 
            element={
              <LoginPage 
                onLoginSuccess={handleLoginSuccess}
                currentTheme={theme}
                onSelectTheme={setTheme}
                showToast={showGlobalToast}
              />
            } 
          />
          <Route 
            path="/clients" 
            element={
              <ClientsPage 
                clients={clients} 
                onSaveClients={saveClients} 
                invoices={invoices}
                onSaveInvoices={saveInvoices}
                company={company}
                showToast={showGlobalToast}
              />
            } 
          />
          <Route 
            path="/purchases" 
            element={
              <PurchasesPage 
                purchases={purchases} 
                onSavePurchases={savePurchases} 
                clients={clients} 
                company={company} 
                showToast={showGlobalToast} 
              />
            } 
          />
          <Route 
            path="/expo" 
            element={
              <ExpoPage 
                expoLeads={expoLeads} 
                onSaveExpoLeads={saveExpoLeads} 
                company={company} 
                showToast={showGlobalToast} 
              />
            } 
          />
          <Route 
            path="/invoices" 
            element={
              <InvoicesPage 
                invoices={invoices} 
                onSaveInvoices={saveInvoices} 
                clients={clients} 
                company={company} 
                showToast={showGlobalToast} 
              />
            } 
          />
          <Route 
            path="/revenue" 
            element={
              <Revenue 
                clients={clients} 
                invoices={invoices}
                onSaveInvoices={saveInvoices}
                company={company}
              />
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProductsPage 
                products={products} 
                onSaveProducts={saveProducts}
                inventory={inventory}
              />
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <InventoryPage 
                inventory={inventory} 
                onSaveInventory={saveInventory}
                products={products}
              />
            } 
          />
          <Route 
            path="/data-hub" 
            element={
              <DataHubPage 
                clients={clients} 
                setClients={saveClients} 
                products={products} 
                setProducts={saveProducts} 
                inventory={inventory} 
                setInventory={saveInventory}
                company={company}
                revenueData={revenueData}
                invoices={invoices}
                purchases={purchases}
                setPurchases={savePurchases}
                expoLeads={expoLeads}
                setExpoLeads={saveExpoLeads}
                showToast={showGlobalToast}
              />
            } 
          />
          <Route 
            path="/workspace" 
            element={
              <AdminWorkspace 
                adminProfile={adminProfile}
                setAdminProfile={setAdminProfile}
                company={company}
                setCompany={setCompany}
                systemPrefs={systemPrefs}
                setSystemPrefs={setSystemPrefs}
                onOpenDriveModal={() => setIsDriveModalOpen(true)}
                onOpenCredsModal={() => setIsCredsModalOpen(true)}
              />
            } 
          />
        </Routes>
      </Layout>

      {/* Global Google Drive Cloud Management Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => {
          setIsDriveModalOpen(false);
          setDriveConfig(getDriveConfig());
        }}
        erpData={{ clients, products, inventory, revenueData, company }}
        onRestoreData={handleRestoreFromSnapshot}
        showToast={showGlobalToast}
      />

      {/* Global Credentials Ledger Modal */}
      <CredentialsLedgerModal
        isOpen={isCredsModalOpen}
        onClose={() => setIsCredsModalOpen(false)}
        showToast={showGlobalToast}
      />
    </>
  );
}