# Laxmi Enterprises ERP Portal

Comprehensive Business Management & ERP Portal for **Laxmi Enterprises** (Industrial Supplies, Hardware, Agribusiness & Trading).

---

## 📑 System Documentation & Developer Specifications

For the complete 24-section developer checklist, financial calculation rules, database models, and handover requirements based on the official specification, see:

👉 **[APPLICATION_DEVELOPMENT_REQUIREMENTS.md](APPLICATION_DEVELOPMENT_REQUIREMENTS.md)**

---

## 🚀 Quick Start

1. Ensure **Node.js (LTS version 18+)** is installed.
2. Clone or open this folder in your terminal / IDE:
   ```bash
   cd laxmi-enterprises-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite local development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173/` in your browser.

---

## 🛠️ Build & Verification

To verify or generate web production bundles:
```bash
npm run build
```

---

## 📱 Android APK Build

The project is configured with Capacitor to generate Android APKs:

- **Ready-to-Install APK File:** [`Laxmi-Enterprises-ERP.apk`](Laxmi-Enterprises-ERP.apk) (in project root)
- **Direct Gradle output:** [`android/app/build/outputs/apk/debug/app-debug.apk`](android/app/build/outputs/apk/debug/app-debug.apk)

### Rebuilding the Android APK:
```bash
# Build web assets, sync with Capacitor, and compile debug APK
npm run build:apk
```

### Open in Android Studio:
```bash
npm run cap:open
```

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

*Laxmi Enterprises ERP • Built with React 19, Vite, Recharts & jsPDF*

