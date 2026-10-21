import React, { useState } from "react";
import {
  Cloud, CloudUpload, HardDrive, Download,
  RefreshCw, CheckCircle2, AlertCircle, ArrowUpRight,
  ShieldCheck, FileText, Check, Settings, Trash2, Key, HelpCircle,
  FolderArchive, Sparkles, Receipt, ShoppingCart, MessageCircle,
  Database, Users, Package, Boxes, TrendingUp
} from "lucide-react";
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
} from "../services/googleDriveService";
import GoogleDriveModal from "./GoogleDriveModal";
import CredentialsLedgerModal from "./CredentialsLedgerModal";
import { getStoredCredentials } from "../services/authService";

function downloadJsonFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportToCsv(data, filename) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(h => {
      const val = item[h] === null || item[h] === undefined ? "" : String(item[h]);
      return `"${val.replace(/"/g, '""')}"`;
    }).join(",")
  );
  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function DataHubPage({
  clients = [],
  setClients,
  products = [],
  setProducts,
  inventory = [],
  setInventory,
  company = {},
  revenueData = [],
  invoices = [],
  purchases = [],
  setPurchases,
  expoLeads = [],
  setExpoLeads,
  showToast
}) {
  const [driveConfig, setDriveConfig] = useState(getDriveConfig());
  const [driveFiles, setDriveFiles] = useState(getDriveFiles());
  const [syncingAll, setSyncingAll] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [credsCount, setCredsCount] = useState(() => getStoredCredentials().length);

  const refreshDriveState = () => {
    setDriveConfig(getDriveConfig());
    setDriveFiles(getDriveFiles());
  };

  const handleBackupAll = async () => {
    setSyncingAll(true);
    try {
      const uploaded = await backupAllDataToDrive({
        clients,
        products,
        inventory,
        revenueData,
        company,
        credentials: getStoredCredentials()
      });
      refreshDriveState();
      if (showToast) {
        showToast(`✓ Master ERP snapshot backed up to Google Drive: ${uploaded.name}`);
      }
    } catch (err) {
      if (showToast) showToast("Backup failed: " + err.message);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleMasterDownload = () => {
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
    downloadJsonFile(masterData, `Laxmi_Enterprises_Master_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    if (showToast) {
      showToast("✓ Exported Consolidated Master ERP Backup (.json)");
    }
  };

  const handleRestoreSnapshot = (snapshot) => {
    if (snapshot.clients && setClients) {
      setClients(snapshot.clients);
      localStorage.setItem("le_clients", JSON.stringify(snapshot.clients));
    }
    if (snapshot.products && setProducts) {
      setProducts(snapshot.products);
      localStorage.setItem("le_products", JSON.stringify(snapshot.products));
    }
    if (snapshot.inventory && setInventory) {
      setInventory(snapshot.inventory);
      localStorage.setItem("le_inventory", JSON.stringify(snapshot.inventory));
    }
    if (snapshot.purchases && setPurchases) {
      setPurchases(snapshot.purchases);
      localStorage.setItem("le_purchases", JSON.stringify(snapshot.purchases));
    }
    if (snapshot.expoLeads && setExpoLeads) {
      setExpoLeads(snapshot.expoLeads);
      localStorage.setItem("le_expo_leads", JSON.stringify(snapshot.expoLeads));
    }
    if (showToast) {
      showToast("✓ Successfully restored ERP dataset from Google Drive snapshot");
    }
  };

  const storagePercent = Math.min(
    100,
    Math.round(((driveConfig.storageUsedBytes || 400000000) / (driveConfig.storageQuotaBytes || 16106127360)) * 100)
  );

  return (
    <div className="page data-hub-page">
      {/* HERO SECTION */}
      <div className="card hero-banner" style={{
        background: "linear-gradient(135deg, #002b5c 0%, #005bb5 60%, #00b4d8 100%)",
        color: "#ffffff",
        padding: "26px 30px",
        borderRadius: 16,
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 25px -4px rgba(0, 43, 92, 0.25)"
      }}>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 840 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(10px)", padding: "4px 12px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 600, marginBottom: 12 }}>
            <Sparkles size={14} /> Enterprise Cloud & Data Hub Central
          </div>
          <h2 style={{ fontSize: "1.75rem", margin: "0 0 8px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Cloud Central & Data Hub
          </h2>
          <p style={{ margin: "0 0 20px", fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.9)", lineHeight: 1.5 }}>
            Centralized Google Drive Cloud Vault, automated disaster recovery snapshots, and enterprise data management for Laxmi Enterprises. Export structured reports, manage digital registries, and sync real-time backups.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <button
              type="button"
              className="primary"
              onClick={handleBackupAll}
              disabled={syncingAll || !driveConfig.isConnected}
              style={{
                background: "#ffffff",
                color: "var(--primary-dark)",
                fontWeight: 700,
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                fontSize: "0.9rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
              }}
            >
              <CloudUpload size={18} color="#2563eb" />
              {syncingAll ? "Syncing to Drive..." : "Backup All Data to Google Drive"}
            </button>

            <button
              type="button"
              className="outline"
              onClick={handleMasterDownload}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderColor: "rgba(255, 255, 255, 0.4)",
                color: "#ffffff",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                fontSize: "0.9rem"
              }}
            >
              <Download size={18} />
              Export Complete Backup (.json)
            </button>

            <button
              type="button"
              className="outline"
              onClick={() => setIsDriveModalOpen(true)}
              style={{
                background: "transparent",
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                fontSize: "0.85rem"
              }}
            >
              <Settings size={16} /> Cloud Settings
            </button>
          </div>
        </div>

        {/* Decorative cloud swoosh in background */}
        <div style={{
          position: "absolute",
          right: -30,
          bottom: -30,
          opacity: 0.12,
          pointerEvents: "none"
        }}>
          <Cloud size={280} />
        </div>
      </div>

      {/* QUICK STATUS STRIP */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "rgba(16, 185, 129, 0.12)",
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <Cloud size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Cloud Backup Vault
            </span>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 6 }}>
              {driveConfig.isConnected ? "Active & Protected" : "Sync Ready"}
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981"
              }} />
            </div>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              {driveFiles.length} Cloud Snapshots in Drive
            </span>
          </div>
        </div>

        <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "rgba(0, 91, 181, 0.12)",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <Database size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Local Data Engine
            </span>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
              Synchronized & Offline-Ready
            </div>
            <span style={{ fontSize: "0.76rem", color: "#059669", fontWeight: 600 }}>
              Indexed in Local Storage
            </span>
          </div>
        </div>

        <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "rgba(99, 102, 241, 0.12)",
            color: "#6366f1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Security & Audit
            </span>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)" }}>
              {credsCount} User Accounts
            </div>
            <span style={{ fontSize: "0.76rem", color: "#6366f1", fontWeight: 600 }}>
              Encrypted Access Register
            </span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: ENTERPRISE REGISTERS & GOOGLE DRIVE VAULT */}
      <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, marginBottom: 28 }}>
        
        {/* LEFT COLUMN: ENTERPRISE DATA REGISTERS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* CONSOLIDATED BACKUP BANNER */}
          <div className="card" style={{ border: "1px solid var(--border)", padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <span style={{
                  background: "rgba(0, 91, 181, 0.1)",
                  color: "var(--primary)",
                  border: "1px solid rgba(0, 91, 181, 0.3)",
                  padding: "4px 10px",
                  borderRadius: 100,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 8
                }}>
                  <FolderArchive size={13} /> Complete Enterprise Snapshot
                </span>
                <h3 style={{ margin: 0, fontSize: "1.15rem", color: "var(--text-main)" }}>
                  Consolidated Enterprise Master Register
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Contains complete digital records for clients, products catalogue, inventory movements, tax invoices, inward procurement, and expo visitors.
                </p>
              </div>

              <button
                type="button"
                className="primary"
                onClick={handleMasterDownload}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.85rem",
                  padding: "8px 16px",
                  whiteSpace: "nowrap"
                }}
              >
                <Download size={15} /> Export JSON
              </button>
            </div>

            <div className="responsive-split-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: 8,
              padding: "12px 14px",
              background: "var(--border-subtle)",
              borderRadius: 8,
              fontSize: "0.76rem",
              textAlign: "center"
            }}>
              <div>
                <strong style={{ display: "block", color: "var(--text-main)" }}>Clients</strong>
                <span style={{ color: "var(--text-muted)" }}>{clients.length} Accounts</span>
              </div>
              <div>
                <strong style={{ display: "block", color: "var(--text-main)" }}>Products</strong>
                <span style={{ color: "var(--text-muted)" }}>{products.length} Items</span>
              </div>
              <div>
                <strong style={{ display: "block", color: "var(--text-main)" }}>Inventory</strong>
                <span style={{ color: "var(--text-muted)" }}>{inventory.length} SKUs</span>
              </div>
              <div>
                <strong style={{ display: "block", color: "var(--text-main)" }}>Invoices</strong>
                <span style={{ color: "var(--text-muted)" }}>{invoices.length} Bills</span>
              </div>
              <div>
                <strong style={{ display: "block", color: "var(--text-main)" }}>Purchases</strong>
                <span style={{ color: "var(--text-muted)" }}>{purchases.length} Orders</span>
              </div>
              <div>
                <strong style={{ display: "block", color: "var(--text-main)" }}>Expo Leads</strong>
                <span style={{ color: "#25d366", fontWeight: 700 }}>{expoLeads.length} Visitors</span>
              </div>
              <div>
                <strong style={{ display: "block", color: "var(--text-main)" }}>Users</strong>
                <span style={{ color: "var(--text-muted)" }}>{credsCount} Logins</span>
              </div>
            </div>
          </div>

          {/* INDIVIDUAL MODULE CARDS */}
          <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            
            {/* CLIENTS CARD */}
            <div className="card" style={{ padding: 18, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Clients Directory</h4>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{clients.length} Active Records</span>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.4 }}>
                Animal feed shops, dairy farms, and agricultural retail buyers with GSTIN.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    exportToCsv(clients, "Clients_Directory.csv");
                    if (showToast) showToast("✓ Exported Clients Directory (.csv)");
                  }}
                  style={{ flex: 1, fontSize: "0.78rem", padding: "6px 8px" }}
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            {/* PRODUCTS CARD */}
            <div className="card" style={{ padding: 18, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Products Catalogue</h4>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{products.length} Catalog Items</span>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.4 }}>
                Feed supplements, mineral mixtures, veterinary items & hardware catalogue.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    exportToCsv(products, "Products_Catalogue.csv");
                    if (showToast) showToast("✓ Exported Products Catalogue (.csv)");
                  }}
                  style={{ flex: 1, fontSize: "0.78rem", padding: "6px 8px" }}
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            {/* INVENTORY CARD */}
            <div className="card" style={{ padding: 18, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Boxes size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Warehouse Inventory</h4>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{inventory.length} Tracked Batches</span>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.4 }}>
                Real-time stock on hand, reorder thresholds, and bin locations.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    exportToCsv(inventory, "Inventory_Warehouse.csv");
                    if (showToast) showToast("✓ Exported Warehouse Inventory (.csv)");
                  }}
                  style={{ flex: 1, fontSize: "0.78rem", padding: "6px 8px" }}
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            {/* INVOICES CARD */}
            <div className="card" style={{ padding: 18, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Receipt size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Tax Invoices & Billing</h4>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{invoices.length} Issued Bills</span>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.4 }}>
                Commercial GST billing register with tax calculations and payment status.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    exportToCsv(invoices, "Tax_Invoices_Ledger.csv");
                    if (showToast) showToast("✓ Exported Tax Invoices (.csv)");
                  }}
                  style={{ flex: 1, fontSize: "0.78rem", padding: "6px 8px" }}
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            {/* PURCHASES CARD */}
            <div className="card" style={{ padding: 18, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Procurement & Purchases</h4>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{purchases.length} Inward POs</span>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.4 }}>
                Manufacturer supplier bills, HSN verification, and inward procurement log.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    exportToCsv(purchases, "Purchases_Procurement.csv");
                    if (showToast) showToast("✓ Exported Purchases Register (.csv)");
                  }}
                  style={{ flex: 1, fontSize: "0.78rem", padding: "6px 8px" }}
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            {/* EXPO LEADS CARD */}
            <div className="card" style={{ padding: 18, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#f0fdf4", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Expo & Kisan Mela Leads</h4>
                  <span style={{ fontSize: "0.76rem", color: "#22c55e", fontWeight: 700 }}>{expoLeads.length} Farmer Visitors</span>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.4 }}>
                Lead capture from cattle exhibitions with direct WhatsApp campaign outreach.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="outline"
                  onClick={() => {
                    exportToCsv(expoLeads, "Expo_Visitors_Leads.csv");
                    if (showToast) showToast("✓ Exported Expo Leads (.csv)");
                  }}
                  style={{ flex: 1, fontSize: "0.78rem", padding: "6px 8px" }}
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            {/* CREDENTIALS AUDIT CARD */}
            <div className="card" style={{ padding: 18, border: "1px solid var(--border)", gridColumn: "1 / -1", background: "linear-gradient(135deg, rgba(0, 91, 181, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0, 91, 181, 0.12)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Key size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-main)" }}>
                      User Credentials & Access Audit Register
                    </h4>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {credsCount} User Accounts Recorded (Usernames, Roles & Authentication Timestamps)
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="primary"
                    style={{ fontSize: "0.82rem", padding: "6px 14px", fontWeight: 600 }}
                    onClick={() => setIsCredsModalOpen(true)}
                  >
                    <ShieldCheck size={14} /> View Access Register
                  </button>
                  <button
                    type="button"
                    className="outline"
                    style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                    onClick={() => {
                      exportToCsv(getStoredCredentials(), "User_Credentials_Register.csv");
                      if (showToast) showToast("✓ Exported Credentials Audit Register (.csv)");
                    }}
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Maintains a verified record of authenticated administrative, warehouse, sales, and accounting personnel.
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: GOOGLE DRIVE CLOUD CENTER */}
        <div className="card" style={{ padding: 22, border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Cloud size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-main)" }}>
                  Google Drive Backup Vault
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Folder: <strong>{driveConfig.folderName}</strong>
                </span>
              </div>
            </div>

            <button
              type="button"
              className="outline"
              onClick={() => setIsDriveModalOpen(true)}
              style={{ fontSize: "0.78rem", padding: "5px 10px" }}
            >
              <Settings size={13} /> Manage Drive
            </button>
          </div>

          {/* STORAGE BAR */}
          <div style={{
            padding: "10px 14px",
            background: "var(--border-subtle)",
            borderRadius: 8,
            marginBottom: 14
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", marginBottom: 5 }}>
              <span style={{ fontWeight: 600 }}>Storage: {formatBytes(driveConfig.storageUsedBytes || 400000000)} of 15 GB</span>
              <span style={{ color: "var(--text-muted)" }}>{storagePercent}% Used</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ width: `${storagePercent}%`, height: "100%", background: "#2563eb", borderRadius: 100 }} />
            </div>
          </div>

          {/* FILES LIST */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto" }}>
            {driveFiles.map((file) => (
              <div
                key={file.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <FileText size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{
                      fontSize: "0.82rem",
                      display: "block",
                      color: "var(--text-main)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {file.name}
                    </strong>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", gap: 6 }}>
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{new Date(file.modifiedTime).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  {file.dataSnapshot && (
                    <button
                      type="button"
                      className="outline"
                      title="Restore data from this cloud backup"
                      onClick={() => {
                        if (window.confirm(`Restore ERP data from "${file.name}"?`)) {
                          handleRestoreSnapshot(file.dataSnapshot);
                        }
                      }}
                      style={{ fontSize: "0.72rem", padding: "3px 8px", color: "var(--primary)" }}
                    >
                      Restore
                    </button>
                  )}
                  <button
                    type="button"
                    className="icon-btn"
                    title="Download snapshot to PC"
                    onClick={() => downloadDriveFile(file)}
                    style={{ padding: 5 }}
                  >
                    <Download size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    title="Delete from Drive"
                    onClick={() => {
                      const updated = deleteFileFromDrive(file.id);
                      setDriveFiles(updated);
                      if (showToast) showToast("File deleted from Google Drive");
                    }}
                    style={{ padding: 5, color: "var(--danger)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Auto-sync: <strong>{driveConfig.autoSync ? "Enabled (Daily)" : "Disabled"}</strong>
            </span>
            <button
              type="button"
              className="primary"
              onClick={handleBackupAll}
              disabled={syncingAll || !driveConfig.isConnected}
              style={{ fontSize: "0.8rem", padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}
            >
              <RefreshCw size={13} className={syncingAll ? "spin" : ""} />
              {syncingAll ? "Syncing..." : "Sync All Now"}
            </button>
          </div>

        </div>

      </div>

      {/* GOOGLE DRIVE MANAGEMENT MODAL */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => {
          setIsDriveModalOpen(false);
          refreshDriveState();
        }}
        erpData={{ clients, products, inventory, revenueData, company }}
        onRestoreData={handleRestoreSnapshot}
        showToast={showToast}
      />

      {/* USER CREDENTIALS ACCESS AUDIT REGISTER MODAL */}
      <CredentialsLedgerModal
        isOpen={isCredsModalOpen}
        onClose={() => {
          setIsCredsModalOpen(false);
          setCredsCount(getStoredCredentials().length);
        }}
        showToast={showToast}
      />
    </div>
  );
}
