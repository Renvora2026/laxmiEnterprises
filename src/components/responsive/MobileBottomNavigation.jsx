import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Receipt, Boxes, Package,
  Truck, ShoppingCart, IndianRupee, MoreHorizontal
} from "lucide-react";

/**
 * MobileBottomNavigation
 * Ergonomic fixed bottom navigation dock for smartphones.
 * Shows Home, Clients, the active module (Products/Sales/Inventory/Vendors/Purchases/Revenue),
 * and More. Active tab glows in brand sapphire blue.
 */
export default function MobileBottomNavigation({ onOpenMore, isMoreOpen = false }) {
  const location = useLocation();
  const path = location.pathname;

  // Contextual middle tab selection
  let middleTab = { to: "/products", label: "Products", icon: Package };
  if (path.startsWith("/vendors")) {
    middleTab = { to: "/vendors", label: "Vendors", icon: Truck };
  } else if (path.startsWith("/purchases")) {
    middleTab = { to: "/purchases", label: "Purchases", icon: ShoppingCart };
  } else if (path.startsWith("/invoices")) {
    middleTab = { to: "/invoices", label: "Sales", icon: Receipt };
  } else if (path.startsWith("/revenue")) {
    middleTab = { to: "/revenue", label: "Revenue", icon: IndianRupee };
  } else if (path.startsWith("/inventory")) {
    middleTab = { to: "/inventory", label: "Inventory", icon: Boxes };
  } else if (path.startsWith("/products")) {
    middleTab = { to: "/products", label: "Products", icon: Package };
  }

  const MiddleIcon = middleTab.icon;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Dock">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-bottom-item ${isActive && !isMoreOpen ? "active" : ""}`}
      >
        <LayoutDashboard size={22} className="mobile-nav-icon" />
        <span className="mobile-nav-label">Home</span>
      </NavLink>

      <NavLink
        to="/clients"
        className={({ isActive }) => `mobile-bottom-item ${isActive && !isMoreOpen ? "active" : ""}`}
      >
        <Users size={22} className="mobile-nav-icon" />
        <span className="mobile-nav-label">Clients</span>
      </NavLink>

      <NavLink
        to={middleTab.to}
        className={({ isActive }) => `mobile-bottom-item ${isActive && !isMoreOpen ? "active" : ""}`}
      >
        <MiddleIcon size={22} className="mobile-nav-icon" />
        <span className="mobile-nav-label">{middleTab.label}</span>
      </NavLink>

      <button
        type="button"
        className={`mobile-bottom-item ${isMoreOpen ? "active" : ""}`}
        onClick={onOpenMore}
        aria-label="Open More Modules"
      >
        <MoreHorizontal size={22} className="mobile-nav-icon" />
        <span className="mobile-nav-label">More</span>
      </button>
    </nav>
  );
}
