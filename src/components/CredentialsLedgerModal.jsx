import React, { useState } from "react";
import {
  X, Download, Search, ShieldCheck, Eye, EyeOff,
  CheckCircle2, Trash2, RotateCcw, Copy, Check, FileText, KeyRound
} from "lucide-react";
import {
  getStoredCredentials,
  deleteCredentialById,
  resetCredentialsToDefault
} from "../services/authService";

export default function CredentialsLedgerModal({ isOpen, onClose, showToast }) {
  const [credentials, setCredentials] = useState(getStoredCredentials());
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const filtered = credentials.filter(c =>
    (c.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.status || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (showToast) showToast("✓ Copied to clipboard");
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this credential entry from the digital register?")) {
      const updated = deleteCredentialById(id);
      setCredentials(updated);
      if (showToast) showToast("Entry removed from credentials register");
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset credentials ledger back to default enterprise accounts?")) {
      const def = resetCredentialsToDefault();
      setCredentials(def);
      if (showToast) showToast("Credentials reset to default accounts");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 940, width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: "18px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(0, 91, 181, 0.12)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)" }}>
                User Credentials & Access Audit Register
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Live record of system users & authenticated logins — secure enterprise register
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Action Toolbar */}
        <div style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12
        }}>
          {/* Search */}
          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            maxWidth: 320,
            width: "100%"
          }}>
            <Search size={16} style={{ position: "absolute", left: 12, color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Filter by username, role, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, height: 38, fontSize: "0.85rem" }}
            />
          </div>

          {/* Quick buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="outline"
              onClick={handleReset}
              title="Reset default test credentials"
              style={{ fontSize: "0.85rem", padding: "8px 12px", color: "var(--text-muted)" }}
            >
              <RotateCcw size={15} /> Reset Default Accounts
            </button>
          </div>
        </div>

        {/* Body Table */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <ShieldCheck size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>No credentials found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
              <table style={{ fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "var(--border-subtle)" }}>
                    <th style={{ width: 80 }}>ID</th>
                    <th>Username / Email</th>
                    <th>Password</th>
                    <th>User Name & Role</th>
                    <th>Logged Timestamp</th>
                    <th>Status</th>
                    <th style={{ width: 60, textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cred) => {
                    const isVisible = showPasswords[cred.id];
                    return (
                      <tr key={cred.id}>
                        <td>
                          <span style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.78rem",
                            color: "var(--primary)",
                            fontWeight: 600
                          }}>
                            {cred.id}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <strong style={{ color: "var(--text-main)" }}>{cred.username}</strong>
                            <button
                              type="button"
                              onClick={() => handleCopy(cred.username, `user-${cred.id}`)}
                              className="icon-btn"
                              style={{ width: 22, height: 22, padding: 0 }}
                              title="Copy username"
                            >
                              {copiedId === `user-${cred.id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              fontFamily: "var(--font-mono)",
                              background: "rgba(0,0,0,0.05)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              color: isVisible ? "#b91c1c" : "var(--text-muted)"
                            }}>
                              {isVisible ? cred.password : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(cred.id)}
                              className="icon-btn"
                              style={{ width: 22, height: 22, padding: 0 }}
                              title={isVisible ? "Hide password" : "Show password"}
                            >
                              {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(cred.password, `pass-${cred.id}`)}
                              className="icon-btn"
                              style={{ width: 22, height: 22, padding: 0 }}
                              title="Copy password"
                            >
                              {copiedId === `pass-${cred.id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{cred.name || "-"}</div>
                          <span className="badge brand" style={{ fontSize: "0.72rem", padding: "1px 6px" }}>
                            {cred.role || "Authorized User"}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                          {cred.timestamp}
                        </td>
                        <td>
                          <span className="badge success" style={{ fontSize: "0.72rem" }}>
                            {cred.status || "Active"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => handleDelete(cred.id)}
                            title="Delete credential"
                            style={{ color: "var(--danger)" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Showing <strong>{filtered.length}</strong> of <strong>{credentials.length}</strong> user records stored in secure register
          </div>
          <button type="button" className="outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
