import React, { useState, useEffect } from "react";
import {
  Lock, Mail, Eye, EyeOff, ShieldCheck,
  CheckCircle2, ArrowRight, Sparkles, User, Palette, Key, Shield,
  Layers, Check, HelpCircle, Sun, Moon, AlertCircle
} from "lucide-react";
import {
  recordAndAuthenticateUser,
  getStoredCredentials
} from "../services/authService";
import CredentialsLedgerModal from "./CredentialsLedgerModal";
import { FieldError, RequiredStar, ValidationSummary } from "./ValidationFeedback";
import {
  validateRequiredText,
  validateEmail
} from "../utils/validators";

const DEMO_ACCOUNTS = [
  {
    role: "Super Administrator",
    name: "Chaitrali Shevtekar",
    username: "admin@laxmienterprises.com",
    password: "Admin@123",
    badge: "Super Admin",
    color: "#005bb5"
  },
  {
    role: "Warehouse & Inventory",
    name: "Rahul Deshmukh",
    username: "rahul.ops@laxmienterprises.com",
    password: "Warehouse@2026",
    badge: "Warehouse",
    color: "#10b981"
  },
  {
    role: "Commercial Sales",
    name: "Pooja Patil",
    username: "pooja.sales@laxmienterprises.com",
    password: "Sales@2026",
    badge: "Sales",
    color: "#0284c7"
  },
  {
    role: "Tax & Accounts",
    name: "Amit Kulkarni",
    username: "amit.acc@laxmienterprises.com",
    password: "Finance@2026",
    badge: "Finance",
    color: "#8b5cf6"
  }
];

export default function LoginPage({
  onLoginSuccess,
  currentTheme = "light",
  onSelectTheme,
  showToast
}) {
  const [mode, setMode] = useState("signin"); // "signin" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Super Administrator");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState(null);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credentialsList, setCredentialsList] = useState(getStoredCredentials());

  // Refresh credentials count
  const refreshCredentials = () => {
    setCredentialsList(getStoredCredentials());
  };

  const handleSelectDemo = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setName(account.name);
    setRole(account.role);
    setLoginFeedback(null);
    setErrors({});
  };

  const validate = () => {
    const errs = {};

    if (mode === "register") {
      const nameVal = validateRequiredText(name, "Full Name", 2);
      if (!nameVal.isValid) errs.name = nameVal.error;

      const emailVal = validateEmail(username, true);
      if (!emailVal.isValid) errs.username = emailVal.error;

      if (!password || password.length < 6) {
        errs.password = "Password must be at least 6 characters for registration.";
      }
    } else {
      if (!username.trim()) {
        errs.username = "Username or Email is required.";
      }
      if (!password) {
        errs.password = "Password is required.";
      } else if (password.length < 4) {
        errs.password = "Password must be at least 4 characters.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setLoginFeedback(null);

    setTimeout(() => {
      try {
        const result = recordAndAuthenticateUser({
          username: username.trim(),
          password: password.trim(),
          name: mode === "register" ? name.trim() : (name || username.split("@")[0]),
          role,
          isNewRegistration: mode === "register"
        });

        refreshCredentials();
        setIsLoading(false);

        const msg = `✓ Logged in as ${result.user.name || result.user.username}! Welcome to Laxmi Enterprises ERP.`;

        setLoginFeedback({ type: "success", message: msg });
        if (showToast) showToast(msg);

        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result.user);
          }
        }, 600);
      } catch (err) {
        setIsLoading(false);
        setLoginFeedback({ type: "error", message: "Failed to process login: " + err.message });
      }
    }, 400);
  };

  return (
    <div className="login-viewport">
      {/* Dynamic Background Mesh */}
      <div className="login-bg-mesh" />

      {/* Top Utility Bar */}
      <div className="login-topbar">
        <div className="login-brand-pill">
          <img src="/logo.png" alt="Laxmi Enterprises" className="login-mini-logo" />
          <span>Laxmi Enterprises ERP</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Quick theme selector */}
          {onSelectTheme && (
            <div className="login-theme-buttons">
              <button
                type="button"
                onClick={() => onSelectTheme("light")}
                className={`login-theme-btn ${(currentTheme !== "dark" && currentTheme !== "midnight") ? "active" : ""}`}
                title="Switch to Light Mode"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: "8px",
                  border: (currentTheme !== "dark" && currentTheme !== "midnight") ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                  background: (currentTheme !== "dark" && currentTheme !== "midnight") ? "var(--primary-light)" : "transparent",
                  color: (currentTheme !== "dark" && currentTheme !== "midnight") ? "var(--primary)" : "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: 650,
                  cursor: "pointer"
                }}
              >
                <Sun size={14} style={{ color: "#f59e0b" }} />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTheme("dark")}
                className={`login-theme-btn ${(currentTheme === "dark" || currentTheme === "midnight") ? "active" : ""}`}
                title="Switch to Dark Mode"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: "8px",
                  border: (currentTheme === "dark" || currentTheme === "midnight") ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                  background: (currentTheme === "dark" || currentTheme === "midnight") ? "var(--primary-light)" : "transparent",
                  color: (currentTheme === "dark" || currentTheme === "midnight") ? "var(--primary)" : "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: 650,
                  cursor: "pointer"
                }}
              >
                <Moon size={14} style={{ color: "#38bdf8" }} />
                <span>Dark</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Login Container */}
      <div className="login-container">
        <div className="login-card">
          {/* Brand Header */}
          <div className="login-header">
            <div className="login-logo-halo">
              <img src="/logo.png" alt="Laxmi Enterprises Official Logo" className="login-hero-logo" />
            </div>
            <h1 className="login-brand-title">LAXMI ENTERPRISES</h1>
            <p className="login-brand-subtitle">
              Industrial Supplies, Hardware & Trading Portal
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab-btn ${mode === "signin" ? "active" : ""}`}
              onClick={() => { setMode("signin"); setLoginFeedback(null); setErrors({}); }}
            >
              Sign In to Portal
            </button>
            <button
              type="button"
              className={`login-tab-btn ${mode === "register" ? "active" : ""}`}
              onClick={() => { setMode("register"); setLoginFeedback(null); setErrors({}); }}
            >
              Register New Account
            </button>
          </div>

          {/* Feedback Notice */}
          {loginFeedback && (
            <div className={`login-feedback ${loginFeedback.type}`}>
              <CheckCircle2 size={16} />
              <span>{loginFeedback.message}</span>
            </div>
          )}

          <ValidationSummary errors={errors} title="Authentication errors:" />

          <form onSubmit={handleSubmit} className="login-form">
            {mode === "register" && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name <RequiredStar /></label>
                <div className="login-input-wrap">
                  <User size={16} className="login-input-icon" />
                  <input
                    id="fullName"
                    name="name"
                    type="text"
                    className={`form-input login-input ${errors.name ? "is-invalid" : ""}`}
                    placeholder="e.g. Ramesh Sharma"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                    }}
                    required
                  />
                </div>
                <FieldError error={errors.name} />
              </div>
            )}

            {/* Username / Email Field */}
            <div className="form-group">
              <label htmlFor="username">
                {mode === "register" ? "Corporate Email" : "Username or Corporate Email"} <RequiredStar />
              </label>
              <div className="login-input-wrap">
                <Mail size={16} className="login-input-icon" />
                <input
                  id="username"
                  name="username"
                  type={mode === "register" ? "email" : "text"}
                  autoComplete="username"
                  className={`form-input login-input ${errors.username ? "is-invalid" : ""}`}
                  placeholder={mode === "register" ? "ramesh@laxmienterprises.com" : "admin@laxmienterprises.com or username"}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: null }));
                  }}
                  enterKeyHint="next"
                  required
                />
              </div>
              <FieldError error={errors.username} />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="current-password">Password <RequiredStar /></label>
                {mode === "signin" && (
                  <span style={{ fontSize: "0.75rem", color: "var(--primary)", cursor: "pointer" }} onClick={() => setIsModalOpen(true)}>
                    Forgot / View Credentials?
                  </span>
                )}
              </div>
              <div className="login-input-wrap">
                <Lock size={16} className="login-input-icon" />
                <input
                  id="current-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className={`form-input login-input ${errors.password ? "is-invalid" : ""}`}
                  placeholder={mode === "register" ? "At least 6 characters" : "Enter secure password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                  }}
                  enterKeyHint="done"
                  required
                />
                <button
                  type="button"
                  className="login-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError error={errors.password} />
            </div>

            {/* Role Assignment */}
            <div className="form-group">
              <label htmlFor="userRole">Assigned Access Role</label>
              <select
                id="userRole"
                className="form-input login-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Super Administrator">Super Administrator (Full System Control)</option>
                <option value="Warehouse & Inventory">Warehouse & Inventory (Logistics & Stock)</option>
                <option value="Commercial Sales">Commercial Sales (Client Accounts & Billing)</option>
                <option value="Tax & Accounts">Tax & Accounts (GST & Financials)</option>
                <option value="Operations Staff">Operations Staff (Standard Access)</option>
              </select>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="primary login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In to ERP Portal" : "Create Account"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Bar */}
          <div className="login-demo-section">
            <div className="login-demo-title">
              <Sparkles size={14} color="var(--primary)" />
              <span>Quick Test Accounts (Click to Auto-fill):</span>
            </div>

            <div className="login-demo-grid">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  className="login-demo-pill"
                  onClick={() => handleSelectDemo(acc)}
                  title={`Use ${acc.name} (${acc.role}) credentials`}
                >
                  <span className="login-demo-dot" style={{ background: acc.color }} />
                  <div>
                    <strong style={{ display: "block", fontSize: "0.78rem" }}>{acc.badge}</strong>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{acc.username.split("@")[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Credentials Ledger Modal */}
      <CredentialsLedgerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showToast={showToast}
      />
    </div>
  );
}
