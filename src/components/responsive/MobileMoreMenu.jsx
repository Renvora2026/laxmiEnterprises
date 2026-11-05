import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Truck, ShoppingCart, MessageCircle, IndianRupee, Package,
  ShieldCheck, X, RefreshCw, Moon, Sun, LogOut, ChevronRight,
  Wallet, Settings, User, HelpCircle, Building2
} from "lucide-react";

export default function MobileMoreMenu({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  onRefreshAll,
  currentUser,
  adminProfile,
  onLogout,
  isDbOnline = true
}) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const businessOperations = [
    { to: "/vendors", label: "Vendor Directory", icon: Truck, color: "var(--primary)" },
    { to: "/purchases", label: "Purchases & Inward", icon: ShoppingCart, color: "#10b981" },
    { to: "/expo", label: "Expo Leads & Campaigns", icon: MessageCircle, color: "#25D366" },
    { to: "/revenue", label: "Reports & Analytics", icon: IndianRupee, color: "#d97706" },
    { to: "/expenses", label: "Operating Expenses", icon: Wallet, color: "#ef4444" },
    { to: "/products", label: "Product Catalogue", icon: Package, color: "#6366f1" },
    { to: "/workspace", label: "Admin Workspace", icon: ShieldCheck, color: "var(--primary)" },
  ];

  const toggleTheme = () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    if (onSelectTheme) onSelectTheme(nextTheme);
  };

  return (
    <div className="mobile-more-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mobile-more-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drag Handle */}
        <div className="mobile-sheet-handle-bar">
          <span className="mobile-sheet-handle" />
        </div>

        {/* Sheet Header */}
        <div className="mobile-more-header">
          <div className="mobile-more-user-info">
            <div className="profile-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>
              {(currentUser?.name || adminProfile?.name || "LE").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong style={{ display: "block", fontSize: 14 }}>{currentUser?.name || adminProfile?.name || "Admin"}</strong>
              <small style={{ color: "var(--text-muted)", fontSize: 11 }}>{currentUser?.role || adminProfile?.role || "Administrator"}</small>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Business Operations */}
        <div className="mobile-more-section">
          <div className="mobile-more-section-title">Business Operations</div>
          <div className="mobile-more-card-group">
            {businessOperations.map(({ to, label, icon: Icon, color }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) => `mobile-more-row-item ${isActive ? "active" : ""}`}
              >
                <div className="mobile-more-item-left">
                  <div className="mobile-more-icon-wrap" style={{ background: `${color}18`, color }}>
                    <Icon size={18} />
                  </div>
                  <span className="mobile-more-item-title">{label}</span>
                </div>
                <ChevronRight size={17} className="mobile-more-chevron" />
              </NavLink>
            ))}

            {/* Quick Settings row */}
            <div className="mobile-more-row-item" onClick={toggleTheme} style={{ cursor: "pointer" }}>
              <div className="mobile-more-item-left">
                <div className="mobile-more-icon-wrap" style={{ background: "rgba(0, 180, 216, 0.12)", color: "var(--accent)" }}>
                  {currentTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </div>
                <span className="mobile-more-item-title">Settings & Theme ({currentTheme === "dark" ? "Dark" : "Light"})</span>
              </div>
              <ChevronRight size={17} className="mobile-more-chevron" />
            </div>

            {onRefreshAll && (
              <div className="mobile-more-row-item" onClick={() => { onRefreshAll(); onClose(); }} style={{ cursor: "pointer" }}>
                <div className="mobile-more-item-left">
                  <div className="mobile-more-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                    <RefreshCw size={17} />
                  </div>
                  <span className="mobile-more-item-title">Sync Live Database</span>
                </div>
                <ChevronRight size={17} className="mobile-more-chevron" />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Account */}
        <div className="mobile-more-section" style={{ marginTop: 14 }}>
          <div className="mobile-more-section-title">Account</div>
          <div className="mobile-more-card-group">
            <NavLink to="/workspace" onClick={onClose} className="mobile-more-row-item">
              <div className="mobile-more-item-left">
                <div className="mobile-more-icon-wrap" style={{ background: "rgba(0, 91, 181, 0.1)", color: "var(--primary)" }}>
                  <User size={18} />
                </div>
                <span className="mobile-more-item-title">My Profile</span>
              </div>
              <ChevronRight size={17} className="mobile-more-chevron" />
            </NavLink>

            <div
              className="mobile-more-row-item"
              onClick={() => {
                alert("Laxmi Enterprises ERP Support:\nEmail: laxmigroup616@gmail.com\nPhone: +91 99210 63187");
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="mobile-more-item-left">
                <div className="mobile-more-icon-wrap" style={{ background: "rgba(100, 116, 139, 0.12)", color: "var(--text-muted)" }}>
                  <HelpCircle size={18} />
                </div>
                <span className="mobile-more-item-title">Help & Support</span>
              </div>
              <ChevronRight size={17} className="mobile-more-chevron" />
            </div>

            <div
              className="mobile-more-row-item danger"
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="mobile-more-item-left">
                <div className="mobile-more-icon-wrap" style={{ background: "rgba(239, 68, 68, 0.12)", color: "var(--danger)" }}>
                  <LogOut size={18} />
                </div>
                <span className="mobile-more-item-title" style={{ color: "var(--danger)", fontWeight: 700 }}>Logout</span>
              </div>
              <ChevronRight size={17} className="mobile-more-chevron" style={{ color: "var(--danger)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
