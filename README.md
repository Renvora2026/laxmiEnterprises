# Laxmi Enterprises ERP Portal

Comprehensive Business Management & ERP Portal for **Laxmi Enterprises** (Industrial Supplies, Hardware, Agribusiness & Trading).

---

## 📑 Architecture Overview

1. **Frontend (`/`):** React 19, Vite 6, Recharts, jsPDF, Lucide Icons, Vanilla CSS Design System.
2. **Backend (`/backend`):** Node.js, Express, Sequelize ORM, MySQL (Hostinger Business Plan Ready & Local MySQL).
3. **Mobile App (`/laxmi_enterprises_mobile`):** Flutter 3 Native WebApp with branded splash, offline recovery, pull-to-refresh, and Android back navigation.

---

## 🚀 Quick Start Guide

### 1. Start Frontend Web Server
```bash
# Install packages if not already installed
npm install

# Run Vite development server (http://localhost:5173)
npm run dev
```

### 2. Start Backend API Server
```bash
# From project root:
npm run server

# Or directly from backend:
cd backend
npm run dev
```
- API Base: `http://localhost:5000/api/v1`
- Health Check: `http://localhost:5000/api/health`

### 3. Database Schema Auto-Sync & Seeding (MySQL)
Configure your credentials in `backend/.env` (works with local MySQL or Hostinger remote MySQL).
```bash
cd backend
# Synchronize models and tables:
npm run db:sync

# Seed demo records and admin account:
npm run seed
```

---

## 📱 Mobile App (Flutter)

The mobile application is powered by Flutter in [`laxmi_enterprises_mobile/`](laxmi_enterprises_mobile):

### Run Mobile App:
```bash
npm run mobile:run
```

### Build Android APK:
```bash
npm run mobile:build
```
*(The compiled APK will be generated at: `laxmi_enterprises_mobile/build/app/outputs/flutter-apk/app-release.apk`)*

---

## 🧭 Application Modules

- **Dashboard (`/`):** Real-time operational KPIs, revenue trajectory, and inventory health.
- **Customers / Clients (`/clients`):** Categorized directory (Farmers, Animal Feed Shops, Dairies) with village mapping and outstanding balances.
- **Purchases (`/purchases`):** Inward procurement ledger, vendor bills, category-adaptive forms, and GST calculation.
- **Invoices & Sales (`/invoices`):** GST-compliant tax invoices, printable vector PDFs, itemized billing registers.
- **Revenue & Collections (`/revenue`):** Financial ledgers, payment modes (RTGS/NEFT/UPI/Cash), partial settlements.
- **Products & Inventory (`/products`, `/inventory`):** SKU catalog, reorder levels, warehouse tracking.
- **Expo Leads (`/expo`):** Trade fair visitor registration, filter by event, and 1-click WhatsApp broadcast campaigns.
- **Data Hub & Cloud Sync (`/data-hub`):** Digital audit registers, system restore points, and Google Drive cloud backups.
- **Admin Workspace (`/workspace`):** Corporate identity, GST settings, and credential access control.

---

*Laxmi Enterprises ERP • React 19 • Express • MySQL • Flutter*
