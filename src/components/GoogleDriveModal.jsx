import React, { useState, useEffect } from "react";
import {
  Cloud, CloudUpload, HardDrive, RefreshCw, CheckCircle2,
  AlertCircle, X, Download, Trash2, ArrowUpRight, FolderArchive,
  Key, ShieldCheck, Check, ExternalLink, Settings, Sparkles, FileText
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
import { FieldError, RequiredStar, ValidationSummary } from "./ValidationFeedback";
import { validateRequiredText, validateEmail } from "../utils/validators";

export default function GoogleDriveModal({
  isOpen,
  onClose,
  erpData, // { clients, products, inventory, revenueData, company }
  onRestoreData, // callback when user restores a backup
  showToast
}) {
  const [config, setConfig] = useState(getDriveConfig());
  const [files, setFiles] = useState(getDriveFiles());
  const [activeTab, setActiveTab] = useState("vault"); // "vault" | "settings"
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [errors, setErrors] = useState({});

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    folderName: config.folderName || "Laxmi Enterprises ERP Backups",
    accountEmail: config.accountEmail || "admin.drive@laxmienterprises.com",
    autoSync: config.autoSync !== false,
    syncInterval: config.syncInterval || "daily"
  });

  useEffect(() => {
    if (isOpen) {
      const cfg = getDriveConfig();
      setConfig(cfg);
      setFiles(getDriveFiles());
      setSettingsForm({
        folderName: cfg.folderName,
        accountEmail: cfg.accountEmail,
        autoSync: cfg.autoSync !== false,
        syncInterval: cfg.syncInterval || "daily"
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const updated = await connectGoogleDrive(settingsForm);
      setConfig(updated);
      setFiles(getDriveFiles());
      if (showToast) showToast("✓ Connected to Google Drive Workspace");
    } catch (err) {
      if (showToast) showToast("Failed to connect to Google Drive");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    const updated = disconnectGoogleDrive();
    setConfig(updated);
    if (showToast) showToast("Google Drive disconnected");
  };

  const handleSyncNow = async () => {
    if (!erpData) return;
    setSyncing(true);
    try {
      const uploaded = await backupAllDataToDrive(erpData);
      setFiles(getDriveFiles());
      const cfg = getDriveConfig();
      setConfig(cfg);
      if (showToast) {
        showToast(`✓ Backed up to Google Drive: ${uploaded.name}`);
      }
    } catch (err) {
      if (showToast) showToast("Backup failed: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteFile = (fileId) => {
    const updated = deleteFileFromDrive(fileId);
    setFiles(updated);
    if (showToast) showToast("File removed from Google Drive backup vault");
  };

  const handleDownload = (file) => {
    downloadDriveFile(file);
    if (showToast) showToast(`Downloading ${file.name}`);
  };

  const handleRestore = (file) => {
    if (!file.dataSnapshot) {
      if (showToast) showToast("This backup contains archived raw data.");
      return;
    }

    if (window.confirm(`Are you sure you want to restore ERP data from "${file.name}"? This will update your active Clients, Products, and Inventory.`)) {
      setRestoringId(file.id);
      setTimeout(() => {
        if (onRestoreData) {
          onRestoreData(file.dataSnapshot);
        }
        setRestoringId(null);
        if (showToast) showToast(`✓ Restored ERP data from ${file.name}`);
        onClose();
      }, 700);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const errs = {};
    const folderVal = validateRequiredText(settingsForm.folderName, "Google Drive Folder Name", 2);
    if (!folderVal.isValid) errs.folderName = folderVal.error;

    const emailVal = validateEmail(settingsForm.accountEmail, true);
    if (!emailVal.isValid) errs.accountEmail = emailVal.error;

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    const updated = saveDriveConfig(settingsForm);
    setConfig(updated);
    if (showToast) showToast("✓ Google Drive settings saved");
  };

  const storagePercent = Math.min(
    100,
    Math.round(((config.storageUsedBytes || 400000000) / (config.storageQuotaBytes || 16106127360)) * 100)
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card gdrive-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 840, width: "95%" }}
      >
        {/* HEADER */}
        <div className="modal-header" style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
              border: "1px solid #bfdbfe"
            }}>
              <Cloud size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)" }}>
                  Google Drive Cloud Integration
                </h3>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 100,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  background: config.isConnected ? "#ecfdf5" : "#fef2f2",
                  color: config.isConnected ? "#10b981" : "#ef4444",
                  border: `1px solid ${config.isConnected ? "#a7f3d0" : "#fecaca"}`
                }}>
                  {config.isConnected ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {config.isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Automated cloud snapshots and data synchronization for Laxmi Enterprises
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* CONNECTION STATUS BANNER */}
        <div style={{
          padding: "14px 24px",
          background: config.isConnected ? "linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%)" : "#f8fafc",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#2563eb",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.9rem"
            }}>
              LE
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>
                {config.isConnected ? config.accountName : "No Account Connected"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {config.isConnected ? (
                  <>
                    <span>{config.accountEmail}</span>
                    <span style={{ margin: "0 6px" }}>•</span>
                    <span>Folder: <strong>{config.folderName}</strong></span>
                  </>
                ) : (
                  "Connect your Google Drive account to activate automated cloud backups."
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {config.isConnected ? (
              <>
                <button
                  type="button"
                  className="primary"
                  onClick={handleSyncNow}
                  disabled={syncing}
                  style={{
                    fontSize: "0.82rem",
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <RefreshCw size={14} className={syncing ? "spin" : ""} />
                  {syncing ? "Backing up..." : "Backup to Drive Now"}
                </button>
                <button
                  type="button"
                  className="outline"
                  onClick={handleDisconnect}
                  style={{ fontSize: "0.82rem", padding: "6px 12px", color: "var(--danger)" }}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                className="primary"
                onClick={handleConnect}
                disabled={connecting}
                style={{
                  background: "#2563eb",
                  fontSize: "0.85rem",
                  padding: "7px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <CloudUpload size={16} />
                {connecting ? "Connecting..." : "Connect Google Drive"}
              </button>
            )}
          </div>
        </div>

        {/* MODAL TABS */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          background: "var(--card-bg)"
        }}>
          <button
            type="button"
            className={`admin-tab ${activeTab === "vault" ? "active" : ""}`}
            onClick={() => setActiveTab("vault")}
            style={{ padding: "12px 18px", fontSize: "0.88rem" }}
          >
            <FolderArchive size={16} /> Cloud Vault Backups ({files.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
            style={{ padding: "12px 18px", fontSize: "0.88rem" }}
          >
            <Settings size={16} /> Backup Preferences
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="modal-body" style={{ maxHeight: "58vh", overflowY: "auto", padding: "20px 24px" }}>
          
          {/* TAB 1: VAULT */}
          {activeTab === "vault" && (
            <div>
              {/* VAULT STATUS BANNER */}
              <div style={{
                padding: "14px 18px",
                background: "linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(0, 180, 216, 0.06) 100%)",
                borderRadius: 10,
                border: "1px solid rgba(37, 99, 235, 0.2)",
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ShieldCheck size={22} color="var(--primary)" />
                  <div>
                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)", display: "block" }}>
                      Cloud Vault Active & Synchronized
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Folder: <strong>{config.folderName}</strong> • {files.length} Cloud Backup Snapshots preserved
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge success" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
                    ✓ Automatic Protection
                  </span>
                </div>
              </div>

              {/* BACKUPS TABLE */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-main)" }}>
                  Cloud Snapshots & Backups in Drive ({files.length})
                </h4>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Last synced: {config.lastSyncTime ? new Date(config.lastSyncTime).toLocaleString("en-IN") : "Never"}
                </div>
              </div>

              {files.length === 0 ? (
                <div style={{
                  padding: "36px 20px",
                  textAlign: "center",
                  background: "var(--border-subtle)",
                  borderRadius: 10,
                  border: "1px dashed var(--border)"
                }}>
                  <CloudUpload size={32} color="var(--text-muted)" style={{ margin: "0 auto 10px" }} />
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--text-main)" }}>
                    No files found in Google Drive backup folder
                  </p>
                  <p style={{ margin: "4px 0 16px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    Click "Backup to Drive Now" to upload your first cloud ledger snapshot.
                  </p>
                  <button type="button" className="primary" onClick={handleSyncNow} disabled={syncing}>
                    Backup ERP to Drive
                  </button>
                </div>
              ) : (
                <div className="table-wrapper" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Category</th>
                        <th>File Size</th>
                        <th>Modified Date</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file) => (
                        <tr key={file.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                background: "#ecfdf5",
                                color: "#10b981",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                              }}>
                                <FileText size={16} />
                              </div>
                              <div>
                                <strong style={{ fontSize: "0.86rem", display: "block", color: "var(--text-main)" }}>
                                  {file.name}
                                </strong>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                  {file.description || "Laxmi Enterprises Backup Snapshot"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="category-pill" style={{ fontSize: "0.74rem" }}>
                              {file.category || "Workbook"}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                            {file.size}
                          </td>
                          <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            {new Date(file.modifiedTime).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                              {file.dataSnapshot && (
                                <button
                                  type="button"
                                  className="outline"
                                  onClick={() => handleRestore(file)}
                                  disabled={restoringId === file.id}
                                  title="Restore snapshot into ERP state"
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "4px 8px",
                                    color: "var(--primary)",
                                    borderColor: "var(--primary)"
                                  }}
                                >
                                  {restoringId === file.id ? "Restoring..." : "Restore"}
                                </button>
                              )}
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => handleDownload(file)}
                                title="Download .xlsx to PC"
                                style={{ padding: 6 }}
                              >
                                <Download size={15} />
                              </button>
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => handleDeleteFile(file.id)}
                                title="Remove from Drive"
                                style={{ padding: 6, color: "var(--danger)" }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SETTINGS */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings}>
              <ValidationSummary errors={errors} title="Please fix Google Drive settings:" />

              <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label>Google Drive Folder Name <RequiredStar /></label>
                  <input
                    type="text"
                    className={`form-input ${errors.folderName ? "is-invalid" : ""}`}
                    value={settingsForm.folderName}
                    onChange={(e) => {
                      setSettingsForm({ ...settingsForm, folderName: e.target.value });
                      if (errors.folderName) setErrors(prev => ({ ...prev, folderName: null }));
                    }}
                    placeholder="Laxmi Enterprises ERP Backups"
                  />
                  <FieldError error={errors.folderName} />
                  <small style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    Dedicated directory inside your Google Drive for all ERP files.
                  </small>
                </div>

                <div className="form-group">
                  <label>Google Account Email <RequiredStar /></label>
                  <input
                    type="email"
                    className={`form-input ${errors.accountEmail ? "is-invalid" : ""}`}
                    value={settingsForm.accountEmail}
                    onChange={(e) => {
                      setSettingsForm({ ...settingsForm, accountEmail: e.target.value });
                      if (errors.accountEmail) setErrors(prev => ({ ...prev, accountEmail: null }));
                    }}
                    placeholder="admin.drive@laxmienterprises.com"
                  />
                  <FieldError error={errors.accountEmail} />
                  <small style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    Primary email associated with your Google Cloud / Workspace.
                  </small>
                </div>
              </div>

              <div className="responsive-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label>Automated Cloud Sync</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                    <input
                      type="checkbox"
                      id="autoSyncToggle"
                      checked={settingsForm.autoSync}
                      onChange={(e) => setSettingsForm({ ...settingsForm, autoSync: e.target.checked })}
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                    />
                    <label htmlFor="autoSyncToggle" style={{ margin: 0, fontWeight: 500, cursor: "pointer" }}>
                      Auto-backup to Google Drive on data changes
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Sync Cadence</label>
                  <select
                    value={settingsForm.syncInterval}
                    onChange={(e) => setSettingsForm({ ...settingsForm, syncInterval: e.target.value })}
                  >
                    <option value="hourly">Hourly (Active Warehouse Operations)</option>
                    <option value="daily">Daily Close of Business (Recommended)</option>
                    <option value="weekly">Weekly Ledger Close</option>
                    <option value="manual">Manual On-Demand Only</option>
                  </select>
                </div>
              </div>

              <div style={{
                padding: "16px",
                background: "var(--border-subtle)",
                borderRadius: 10,
                border: "1px solid var(--border)",
                marginBottom: 18
              }}>
                <h4 style={{ margin: "0 0 8px", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldCheck size={16} color="#10b981" /> Seamless Cloud Vault Protection
                </h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Snapshots are automatically compiled into verified cloud backup archives preserving Clients, Products, Inventory, Revenue, and User Logins with instantaneous one-click disaster recovery.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Check size={16} /> Save Backup Preferences
                </button>
              </div>
            </form>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="modal-footer" style={{ borderTop: "1px solid var(--border)", padding: "14px 24px", display: "flex", justifyContent: "space-between" }}>
          <button type="button" className="outline" onClick={onClose}>
            Close
          </button>
          
          <button
            type="button"
            className="primary"
            onClick={handleSyncNow}
            disabled={syncing || !config.isConnected}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <CloudUpload size={16} />
            {syncing ? "Backing up..." : "Backup All Data to Drive"}
          </button>
        </div>

      </div>
    </div>
  );
}
