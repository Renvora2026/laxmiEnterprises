import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

// Modular UI Components
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ClientsPage from "./components/ClientsPage";
import InvoicesPage from "./components/InvoicesPage";
import PurchasesPage from "./components/PurchasesPage";
import ExpoPage from "./components/ExpoPage";
import RevenuePage from "./components/RevenuePage";
import ProductsPage from "./components/ProductsPage";
import InventoryPage from "./components/InventoryPage";
import DataHubPage from "./components/DataHubPage";
import AdminWorkspace from "./components/AdminWorkspace";
import LoginPage from "./components/LoginPage";

// Services
import { getCurrentUser, logoutUser, verifyCurrentSession } from "./services/authService";
import { erpApi } from "./services/api";

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("le_theme");
    return saved === "dark" || saved === "midnight" ? "dark" : "light";
  });

  // Client Directory state with persistence & MySQL sync
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem("le_clients");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const saveClients = (newClients) => {
    setClients(newClients);
    localStorage.setItem("le_clients", JSON.stringify(newClients));
    erpApi.syncClients(newClients).catch((e) => console.warn("Failed to sync clients to DB:", e.message));
  };

  // Invoices state with persistence & MySQL sync
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem("le_invoices");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const saveInvoices = (newInvoices) => {
    setInvoices(newInvoices);
    localStorage.setItem("le_invoices", JSON.stringify(newInvoices));
    erpApi.syncInvoices(newInvoices).catch((e) => console.warn("Failed to sync invoices to DB:", e.message));
  };

  // Purchases state with persistence & MySQL sync
  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem("le_purchases");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const savePurchases = (newPurchases) => {
    setPurchases(newPurchases);
    localStorage.setItem("le_purchases", JSON.stringify(newPurchases));
    erpApi.syncPurchases(newPurchases).catch((e) => console.warn("Failed to sync purchases to DB:", e.message));
  };

  // Expo Leads state with persistence & MySQL sync
  const [expoLeads, setExpoLeads] = useState(() => {
    const saved = localStorage.getItem("le_expo_leads");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const saveExpoLeads = (newLeads) => {
    setExpoLeads(newLeads);
    localStorage.setItem("le_expo_leads", JSON.stringify(newLeads));
    erpApi.syncExpoLeads(newLeads).catch((e) => console.warn("Failed to sync expo leads to DB:", e.message));
  };

  // Products state with persistence & MySQL sync
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("le_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem("le_products", JSON.stringify(newProducts));
    erpApi.syncProducts(newProducts).catch((e) => console.warn("Failed to sync products to DB:", e.message));
  };

  // Inventory state with persistence & MySQL sync
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("le_inventory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const saveInventory = (newInventory) => {
    setInventory(newInventory);
    localStorage.setItem("le_inventory", JSON.stringify(newInventory));
    erpApi.syncInventory(newInventory).catch((e) => console.warn("Failed to sync inventory to DB:", e.message));
  };

  // Admin Profile state (synced with authenticated user from MySQL)
  const [adminProfile, setAdminProfile] = useState(() => {
    const user = getCurrentUser();
    if (user) {
      return {
        name: user.name || "Administrator",
        role: user.role || "Administrator",
        email: user.email || "",
        phone: user.phone || "",
      };
    }
    return {
      name: "Administrator",
      role: "Super Administrator",
      email: "",
      phone: "",
    };
  });

  // Company Profile state with persistence
  const [company, setCompany] = useState(() => {
    const saved = localStorage.getItem("le_company");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
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
      try { return JSON.parse(saved); } catch (e) {}
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
  
  const [toastMessage, setToastMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  // Purge legacy mock keys and verify live JWT session on load
  useEffect(() => {
    localStorage.removeItem("le_user_credentials");
    localStorage.removeItem("le_team_members");
    localStorage.removeItem("le_admin_profile");

    verifyCurrentSession().then((user) => {
      if (user) {
        setCurrentUser(user);
        setAdminProfile(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || prev.phone
        }));
      }
    });

    // Auto-normalize Categories of existing products
    try {
      const storedProds = JSON.parse(localStorage.getItem("le_products") || "[]");
      let prodList = Array.isArray(storedProds) ? [...storedProds] : [];
      let prodsUpdated = false;

      // Map any legacy categories (Hardware, Electrical, etc.) to valid agribusiness sectors
      prodList = prodList.map(p => {
        let cat = p.category;
        if (!["Animal Feed", "Dairy Milk", "Farmer Direct"].includes(cat)) {
          cat = cat === "Dairy" ? "Dairy Milk" : cat === "Farmers" ? "Farmer Direct" : "Animal Feed";
          prodsUpdated = true;
          return { ...p, category: cat };
        }
        return p;
      });

      if (prodsUpdated) {
        setProducts(prodList);
        localStorage.setItem("le_products", JSON.stringify(prodList));
        erpApi.syncProducts(prodList).catch(() => {});
      }
    } catch (e) {
      console.warn("Auto sync error:", e);
    }
  }, []);

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
        email: user.email || user.username || prev.email,
        phone: user.phone || prev.phone
      }));
    }
    showGlobalToast(`✓ Welcome, ${user.name || user.email}!`);
  };

  const handleExportMaster = () => {
    const masterData = {
      version: "2026.1",
      exportedAt: new Date().toISOString(),
      company,
      clients,
      products,
      inventory,
      invoices,
      purchases,
      expoLeads,
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

  // Cross-Entity Relational Cascade Handlers:
  // 1. Invoice creation cascades to Inventory (decrement stock) & Client Ledger (increment orders, revenue, outstanding)
  const handleCreateInvoiceCascade = (newInvoice) => {
    const updatedInvoices = [newInvoice, ...invoices];
    saveInvoices(updatedInvoices);

    // Decrement stock for all itemized products in the invoice
    if (Array.isArray(newInvoice.items) && newInvoice.items.length > 0) {
      const updatedProducts = products.map((prod) => {
        const item = newInvoice.items.find(
          (it) => String(it.productId) === String(prod.id) || it.description?.toLowerCase() === prod.name?.toLowerCase()
        );
        if (item) {
          const qty = Number(item.qty) || 0;
          const currentOut = Number(prod.outwardStock || 0);
          const currentStock = Number(prod.stock || 0);
          return {
            ...prod,
            outwardStock: currentOut + qty,
            stock: Math.max(0, currentStock - qty),
          };
        }
        return prod;
      });
      saveProducts(updatedProducts);

      const updatedInventory = inventory.map((inv) => {
        const item = newInvoice.items.find(
          (it) => String(it.productId) === String(inv.productId) || it.description?.toLowerCase() === inv.productName?.toLowerCase()
        );
        if (item) {
          const qty = Number(item.qty) || 0;
          const cur = Number(inv.stock ?? inv.currentStock ?? 0);
          return {
            ...inv,
            stock: Math.max(0, cur - qty),
            currentStock: Math.max(0, cur - qty),
          };
        }
        return inv;
      });
      saveInventory(updatedInventory);
    }

    // Update Client's commercial ledger
    if (newInvoice.clientId || newInvoice.clientName) {
      const invTotal = Number(newInvoice.total || newInvoice.grandTotal || 0);
      const balanceDue = newInvoice.balanceDue !== undefined 
        ? Number(newInvoice.balanceDue) 
        : (newInvoice.status === "Paid" ? 0 : invTotal);

      const updatedClients = clients.map((cl) => {
        if (cl.id === newInvoice.clientId || cl.name === newInvoice.clientName) {
          return {
            ...cl,
            orders: (Number(cl.orders) || 0) + 1,
            revenue: (Number(cl.revenue) || 0) + invTotal,
            outstanding: (Number(cl.outstanding) || 0) + balanceDue,
            outstandingBalance: (Number(cl.outstandingBalance ?? cl.outstanding) || 0) + balanceDue,
          };
        }
        return cl;
      });
      saveClients(updatedClients);
    }
  };

  // 2. Inward Purchase creation cascades to Product & Inventory (increment stock)
  const handleCreatePurchaseCascade = (newPurchase) => {
    const updatedPurchases = [newPurchase, ...purchases];
    savePurchases(updatedPurchases);

    const prodId = newPurchase.productId;
    const qty = Number(newPurchase.inwardQty || newPurchase.quantity || 1);
    const purchaseRate = Number(newPurchase.unitRate || newPurchase.rate || 0);

    if (prodId || newPurchase.itemDescription) {
      const itemDesc = (newPurchase.itemDescription || newPurchase.productName || "Inward Goods").trim();
      let foundInProd = false;

      let updatedProducts = products.map((prod) => {
        const matches = (prodId && String(prod.id) === String(prodId)) || 
                        (itemDesc && prod.name?.toLowerCase().trim() === itemDesc.toLowerCase());
        if (matches) {
          foundInProd = true;
          const rawIn = Number(prod.inwardStock);
          const rawStock = Number(prod.stock);
          const baseIn = !isNaN(rawIn) && rawIn > 0 ? rawIn : (!isNaN(rawStock) && rawStock > 0 ? rawStock : 0);
          const baseStock = !isNaN(rawStock) ? rawStock : baseIn;

          const newIn = baseIn + qty;
          const newStock = baseStock + qty;

          const updatedProd = {
            ...prod,
            inwardStock: newIn,
            stock: newStock,
          };

          // Update cost/purchase price from procurement voucher if provided
          if (purchaseRate > 0) {
            updatedProd.purchasePrice = purchaseRate;
            updatedProd.costPrice = purchaseRate;
          }

          // Ensure unit selling price is never undefined or NaN
          if (!updatedProd.price && !updatedProd.sellingPrice) {
            updatedProd.price = purchaseRate > 0 ? Math.round(purchaseRate * 1.25) : 1000;
            updatedProd.sellingPrice = updatedProd.price;
          }

          return updatedProd;
        }
        return prod;
      });

      // If product does NOT exist in catalogue yet, add it automatically
      let effectiveProdId = prodId;
      if (!foundInProd && itemDesc) {
        const nextPNum = updatedProducts.length + 1;
        effectiveProdId = prodId || `PR-${String(nextPNum).padStart(3, "0")}`;
        const cat = newPurchase.category === "Dairy" ? "Dairy Milk" : newPurchase.category === "Farmers" ? "Farmer Direct" : "Animal Feed";
        const newProduct = {
          id: effectiveProdId,
          name: itemDesc,
          category: cat,
          purchasePrice: purchaseRate > 0 ? purchaseRate : 750,
          costPrice: purchaseRate > 0 ? purchaseRate : 750,
          sellingPrice: purchaseRate > 0 ? Math.round(purchaseRate * 1.25) : 1000,
          price: purchaseRate > 0 ? Math.round(purchaseRate * 1.25) : 1000,
          openingStock: 0,
          inwardStock: qty,
          outwardStock: 0,
          reservedStock: 0,
          stock: qty,
          minStock: 10,
          unit: newPurchase.unit || (cat === "Dairy Milk" ? "Liters" : cat === "Farmer Direct" ? "Tonnes" : "Bags")
        };
        updatedProducts = [newProduct, ...updatedProducts];
      }
      saveProducts(updatedProducts);

      let foundInInv = false;
      let updatedInventory = inventory.map((inv) => {
        const matches = (effectiveProdId && String(inv.productId) === String(effectiveProdId)) || 
                        (itemDesc && (inv.product || inv.productName)?.toLowerCase().trim() === itemDesc.toLowerCase());
        if (matches) {
          foundInInv = true;
          const rawCur = Number(inv.stock ?? inv.currentStock ?? inv.in ?? 0);
          const newStock = rawCur + qty;
          return {
            ...inv,
            product: itemDesc,
            productName: itemDesc,
            sku: effectiveProdId || inv.sku,
            stock: newStock,
            currentStock: newStock,
            in: (Number(inv.in) || rawCur) + qty,
          };
        }
        return inv;
      });

      // If inventory item does not exist, append it
      if (!foundInInv && itemDesc) {
        const nextInvNum = updatedInventory.length + 1;
        const newInvItem = {
          id: `INV-${String(nextInvNum).padStart(3, "0")}`,
          productId: effectiveProdId,
          product: itemDesc,
          productName: itemDesc,
          sku: effectiveProdId,
          in: qty,
          out: 0,
          stock: qty,
          currentStock: qty,
          status: qty <= 0 ? "Out of Stock" : qty <= 10 ? "Low Stock" : "In Stock",
          location: "Main Warehouse - Bay 01"
        };
        updatedInventory = [newInvItem, ...updatedInventory];
      }
      saveInventory(updatedInventory);
    }
  };

  // 3. Convert Expo Lead to Registered Client Account
  const handleConvertLeadToClient = (lead) => {
    const leadContact = lead.contact || lead.phone || lead.mobile || "";
    const leadName = lead.visitorName || lead.name || "Converted Lead";

    const exists = clients.some(
      (c) => (leadContact && c.contact === leadContact) || c.name.toLowerCase() === leadName.toLowerCase()
    );
    if (exists) {
      showGlobalToast(`⚠️ Account with this contact or name already exists in Client Directory.`);
      return;
    }

    const count = clients.length + 1;
    const newClientId = `CL-${String(count).padStart(3, "0")}`;
    const newClient = {
      id: newClientId,
      clientId: newClientId,
      name: leadName,
      clientType: lead.category === "Dairy" ? "Dairy" : lead.category === "Shopkeeper" ? "Animal Feed Shop" : "Farmers",
      contact: leadContact,
      email: lead.email || "",
      village: lead.village || "",
      taluka: lead.taluka || "",
      district: lead.district || "Pune",
      city: lead.district || "Pune",
      status: "Active",
      tier: "Gold",
      orders: 0,
      revenue: 0,
      outstanding: 0,
      outstandingBalance: 0,
      paymentTerms: "Net 30",
      productTypes: lead.notes || lead.remark || "",
      animalDetails: lead.cattleCount ? `${lead.cattleCount} Dairy Cattle` : "",
      numberOfAnimals: lead.cattleCount ? String(lead.cattleCount) : "",
    };

    saveClients([newClient, ...clients]);

    // Mark lead as Converted
    const updatedLeads = expoLeads.map((l) =>
      l.id === lead.id || l.leadId === lead.leadId ? { ...l, status: "Converted" } : l
    );
    saveExpoLeads(updatedLeads);

    showGlobalToast(`✓ Successfully converted ${newClient.name} into registered Client (${newClientId})!`);
  };

  useEffect(() => {
    const activeTheme = theme === "dark" || theme === "midnight" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", activeTheme);
    localStorage.setItem("le_theme", activeTheme);
  }, [theme]);

  // Load all live ERP records from MySQL database on initial load
  useEffect(() => {
    erpApi
      .getAllData()
      .then((res) => {
        const data = res.data;
        if (data) {
          if (Array.isArray(data.clients)) {
            setClients(data.clients);
            localStorage.setItem("le_clients", JSON.stringify(data.clients));
          }
          if (Array.isArray(data.invoices)) {
            setInvoices(data.invoices);
            localStorage.setItem("le_invoices", JSON.stringify(data.invoices));
          }
          if (Array.isArray(data.purchases)) {
            setPurchases(data.purchases);
            localStorage.setItem("le_purchases", JSON.stringify(data.purchases));
          }
          if (Array.isArray(data.products)) {
            setProducts(data.products);
            localStorage.setItem("le_products", JSON.stringify(data.products));
          }
          if (Array.isArray(data.inventory)) {
            setInventory(data.inventory);
            localStorage.setItem("le_inventory", JSON.stringify(data.inventory));
          }
          if (Array.isArray(data.expoLeads)) {
            setExpoLeads(data.expoLeads);
            localStorage.setItem("le_expo_leads", JSON.stringify(data.expoLeads));
          }
          if (data.company && data.company.name) {
            setCompany(data.company);
            localStorage.setItem("le_company", JSON.stringify(data.company));
          }
        }
      })
      .catch((err) => {
        console.warn("Backend MySQL notice:", err.message);
      });
  }, []);

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
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                clients={clients} 
                products={products} 
                inventory={inventory} 
                invoices={invoices}
                onExportMaster={handleExportMaster}
                adminProfile={adminProfile}
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
                onCreateInvoice={handleCreateInvoiceCascade}
                products={products}
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
                onCreatePurchase={handleCreatePurchaseCascade}
                clients={clients} 
                products={products}
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
                onConvertToClient={handleConvertLeadToClient}
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
                onCreateInvoice={handleCreateInvoiceCascade}
                clients={clients} 
                products={products}
                company={company} 
                showToast={showGlobalToast} 
              />
            } 
          />
          <Route 
            path="/revenue" 
            element={
              <RevenuePage 
                clients={clients} 
                invoices={invoices}
                onSaveInvoices={saveInvoices}
                onCreateInvoice={handleCreateInvoiceCascade}
                products={products}
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
              />
            } 
          />
        </Routes>
      </Layout>
    </>
  );
}