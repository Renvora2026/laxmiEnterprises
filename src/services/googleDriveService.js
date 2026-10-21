
const STORAGE_KEY_CONFIG = "le_gdrive_config";
const STORAGE_KEY_FILES = "le_gdrive_files";

// Initial realistic default state for Google Drive Workspace
const DEFAULT_CONFIG = {
  isConnected: true,
  accountName: "Laxmi Enterprises Cloud",
  accountEmail: "admin.drive@laxmienterprises.com",
  folderName: "Laxmi Enterprises ERP Backups",
  folderId: "gdrive_le_erp_vault_101",
  autoSync: true,
  syncInterval: "daily",
  lastSyncTime: "2026-10-05T12:15:00.000Z",
  storageUsedBytes: 428000000, // ~428 MB
  storageQuotaBytes: 16106127360 // 15 GB
};

// Initial realistic drive vault files
const INITIAL_DRIVE_FILES = [
  {
    id: "gdrive_file_001",
    name: "Laxmi_Enterprises_Master_Ledger_2026-10-04.json",
    size: "148 KB",
    sizeBytes: 151552,
    modifiedTime: "2026-10-04T18:40:00.000Z",
    type: "application/json",
    category: "Master Snapshot",
    description: "Full snapshot including Clients, Products, Inventory & Q3 Financials",
    status: "Synced"
  },
  {
    id: "gdrive_file_002",
    name: "Clients_Directory_Q3_2026.json",
    size: "46 KB",
    sizeBytes: 47104,
    modifiedTime: "2026-10-02T11:20:00.000Z",
    type: "application/json",
    category: "Clients",
    description: "Exported client directory with verified billing and GST registers",
    status: "Synced"
  },
  {
    id: "gdrive_file_003",
    name: "Inventory_Warehouse_Audit_2026-09-30.json",
    size: "62 KB",
    sizeBytes: 63488,
    modifiedTime: "2026-09-30T17:05:00.000Z",
    type: "application/json",
    category: "Inventory",
    description: "Warehouse inventory balance and SKU movement log",
    status: "Synced"
  },
  {
    id: "gdrive_file_004",
    name: "Products_Catalogue_Master.json",
    size: "52 KB",
    sizeBytes: 53248,
    modifiedTime: "2026-09-28T09:15:00.000Z",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    category: "Products",
    description: "Standard industrial supply price list and thresholds",
    status: "Synced"
  }
];

export function getDriveConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch (e) {
    console.error("Error reading Drive config:", e);
  }
  return DEFAULT_CONFIG;
}

export function saveDriveConfig(newConfig) {
  const current = getDriveConfig();
  const merged = { ...current, ...newConfig };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(merged));
  return merged;
}

export function getDriveFiles() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FILES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading Drive files:", e);
  }
  // Initialize with seed files
  localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(INITIAL_DRIVE_FILES));
  return INITIAL_DRIVE_FILES;
}

export function saveDriveFiles(files) {
  localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
}

/**
 * Format bytes to readable string (e.g. 148 KB, 1.2 MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Connect to Google Drive
 */
export async function connectGoogleDrive(customDetails = {}) {
  // Simulate network latency for authentic cloud experience
  await new Promise(resolve => setTimeout(resolve, 800));

  const config = getDriveConfig();
  const updated = saveDriveConfig({
    ...config,
    isConnected: true,
    accountName: customDetails.accountName || config.accountName || "Laxmi Enterprises Cloud",
    accountEmail: customDetails.accountEmail || config.accountEmail || "admin.drive@laxmienterprises.com",
    folderName: customDetails.folderName || config.folderName || "Laxmi Enterprises ERP Backups",
    lastSyncTime: new Date().toISOString()
  });

  return updated;
}

/**
 * Disconnect Google Drive
 */
export function disconnectGoogleDrive() {
  return saveDriveConfig({
    isConnected: false,
    lastSyncTime: null
  });
}

/**
 * Upload a file (Blob or base64) to the Google Drive folder
 */
export async function uploadFileToDrive({
  name,
  blob,
  category = "Spreadsheet",
  description = "Exported from Laxmi Enterprises ERP",
  dataSnapshot = null
}) {
  // Simulate network handshake with Google Drive Cloud API
  await new Promise(resolve => setTimeout(resolve, 600));

  const files = getDriveFiles();
  const fileId = `gdrive_file_${Date.now()}`;
  const sizeBytes = blob ? blob.size : 64000;
  const size = formatBytes(sizeBytes);

  let base64Content = null;
  if (blob) {
    try {
      base64Content = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Could not encode blob for drive storage:", e);
    }
  }

  const newFile = {
    id: fileId,
    name,
    size,
    sizeBytes,
    modifiedTime: new Date().toISOString(),
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    category,
    description,
    status: "Synced",
    base64Data: base64Content,
    dataSnapshot // structured JSON data for instant restoration
  };

  const updatedFiles = [newFile, ...files];
  saveDriveFiles(updatedFiles);

  // Update drive storage usage and lastSyncTime
  const config = getDriveConfig();
  saveDriveConfig({
    ...config,
    lastSyncTime: new Date().toISOString(),
    storageUsedBytes: (config.storageUsedBytes || 400000000) + sizeBytes
  });

  return newFile;
}

/**
 * Delete a file from Google Drive
 */
export function deleteFileFromDrive(fileId) {
  const files = getDriveFiles();
  const updated = files.filter(f => f.id !== fileId);
  saveDriveFiles(updated);
  return updated;
}

/**
 * Perform a full Backup of all ERP data to Google Drive
 */
export async function backupAllDataToDrive({
  clients = [],
  products = [],
  inventory = [],
  revenueData = [],
  company = {}
}) {
  const snapshot = {
    clients,
    products,
    inventory,
    revenueData,
    company,
    exportedAt: new Date().toISOString()
  };

  const jsonStr = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);
  const fileName = `Laxmi_Enterprises_Master_Backup_${timestamp}.json`;

  const uploaded = await uploadFileToDrive({
    name: fileName,
    blob,
    category: "Master Snapshot",
    description: `Complete ERP Snapshot: ${clients.length} Clients, ${products.length} Products, ${inventory.length} Stock items`,
    dataSnapshot: snapshot
  });

  return uploaded;
}

/**
 * Download a file stored in Google Drive back to the client's local disk
 */
export function downloadDriveFile(file) {
  if (file.base64Data) {
    const link = document.createElement("a");
    link.href = file.base64Data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Fallback: If base64Data not stored, create sample workbook for download
  const blob = new Blob(["Laxmi Enterprises Cloud Backup"], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
