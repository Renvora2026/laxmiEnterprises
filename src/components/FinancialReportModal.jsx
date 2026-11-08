import React, { useState, useMemo } from "react";
import {
  FileText, Download, X, Calendar, CheckCircle2, TrendingUp,
  IndianRupee, ShoppingCart, Receipt, ShieldCheck, ArrowRight
} from "lucide-react";
import { generateFinancialReportPDF } from "../services/pdfService";
import { formatIndianCurrency } from "../utils/formatters";
import { getToday, getFiscalYear } from "../constants/erpConstants";
import { downloadCSV } from "../utils/exportUtils";

const FISCAL_MONTHS = [
  { m: 4, name: "April" },
  { m: 5, name: "May" },
  { m: 6, name: "June" },
  { m: 7, name: "July" },
  { m: 8, name: "August" },
  { m: 9, name: "September" },
  { m: 10, name: "October" },
  { m: 11, name: "November" },
  { m: 12, name: "December" },
  { m: 1, name: "January", nextYear: true },
  { m: 2, name: "February", nextYear: true },
  { m: 3, name: "March", nextYear: true },
];

export default function FinancialReportModal({
  isOpen,
  onClose,
  invoices = [],
  purchases = [],
  expenses = [],
  company = {},
  showToast,
}) {
  const todayStr = useMemo(() => getToday(), []);
  const currentFY = useMemo(() => getFiscalYear(todayStr), [todayStr]);
  const currentMonthYM = useMemo(() => todayStr.slice(0, 7), [todayStr]);

  // Current quarter derivation
  const currentQ = useMemo(() => {
    const m = parseInt(todayStr.split("-")[1], 10);
    if (m >= 4 && m <= 6) return "Q1";
    if (m >= 7 && m <= 9) return "Q2";
    if (m >= 10 && m <= 12) return "Q3";
    return "Q4";
  }, [todayStr]);

  const [timelineType, setTimelineType] = useState("monthly"); // "monthly" | "quarterly" | "yearly"
  const [selectedFY, setSelectedFY] = useState(currentFY);
  const [selectedQuarter, setSelectedQuarter] = useState(currentQ);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthYM);
  const [isGenerating, setIsGenerating] = useState(false);

  // Available Fiscal Years derived dynamically from real database records and current date
  const fyOptions = useMemo(() => {
    const fySet = new Set([currentFY]);
    [...(invoices || []), ...(purchases || []), ...(expenses || [])].forEach((item) => {
      const d = item.invoiceDate || item.purchaseDate || item.expenseDate || item.date || item.createdAt;
      if (d && typeof d === "string" && d.length >= 10) fySet.add(getFiscalYear(d));
    });
    return Array.from(fySet).sort().reverse();
  }, [currentFY, invoices, purchases, expenses]);

  // Derive date bounds [startDate, endDate] and display label
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const startYear = parseInt(selectedFY.split("-")[0], 10) || 2026;

    if (timelineType === "yearly") {
      const s = `${startYear}-04-01`;
      const e = `${startYear + 1}-03-31`;
      return {
        startDate: s,
        endDate: e,
        periodLabel: `Annual FY ${selectedFY} (01 Apr ${startYear} - 31 Mar ${startYear + 1})`,
      };
    }

    if (timelineType === "quarterly") {
      let s, e, qLabel;
      if (selectedQuarter === "Q1") {
        s = `${startYear}-04-01`;
        e = `${startYear}-06-30`;
        qLabel = `Q1 FY ${selectedFY} (Apr - Jun ${startYear})`;
      } else if (selectedQuarter === "Q2") {
        s = `${startYear}-07-01`;
        e = `${startYear}-09-30`;
        qLabel = `Q2 FY ${selectedFY} (Jul - Sep ${startYear})`;
      } else if (selectedQuarter === "Q3") {
        s = `${startYear}-10-01`;
        e = `${startYear}-12-31`;
        qLabel = `Q3 FY ${selectedFY} (Oct - Dec ${startYear})`;
      } else {
        s = `${startYear + 1}-01-01`;
        e = `${startYear + 1}-03-31`;
        qLabel = `Q4 FY ${selectedFY} (Jan - Mar ${startYear + 1})`;
      }
      return { startDate: s, endDate: e, periodLabel: qLabel };
    }

    // Monthly
    const [yStr, mStr] = selectedMonth.split("-");
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const s = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const e = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const mName = new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "long" });
    return {
      startDate: s,
      endDate: e,
      periodLabel: `${mName} ${y} (01 to ${lastDay} ${mName})`,
    };
  }, [timelineType, selectedFY, selectedQuarter, selectedMonth]);

  // Real-time Financial Calculations for chosen timeline
  const summary = useMemo(() => {
    const pInvs = (invoices || []).filter((inv) => {
      if (inv.isCancelled) return false;
      const d = inv.invoiceDate || inv.date || (inv.createdAt ? String(inv.createdAt).slice(0, 10) : "");
      return d && (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });

    const pPurs = (purchases || []).filter((p) => {
      if (p.isCancelled || p.status === "Cancelled") return false;
      const d = p.purchaseDate || p.date || (p.createdAt ? String(p.createdAt).slice(0, 10) : "");
      return d && (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });

    const pExps = (expenses || []).filter((e) => {
      if (e.isCancelled) return false;
      const d = e.expenseDate || e.date || (e.createdAt ? String(e.createdAt).slice(0, 10) : "");
      return d && (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });

    const taxableSales = pInvs.reduce((s, inv) => s + Number(inv.taxableTotal ?? inv.amount ?? 0), 0);
    const gstCollected = pInvs.reduce((s, inv) => s + Number(inv.gstTotal ?? inv.tax ?? 0), 0);
    const grandSales = pInvs.reduce((s, inv) => s + Number(inv.grandTotal ?? inv.total ?? (Number(inv.taxableTotal ?? inv.amount ?? 0) + Number(inv.gstTotal ?? inv.tax ?? 0))), 0);

    const taxablePurchases = pPurs.reduce((s, p) => s + Number(p.taxableTotal ?? p.subtotal ?? p.amount ?? 0), 0);
    const gstPurchases = pPurs.reduce((s, p) => s + Number(p.gstTotal ?? p.tax ?? 0), 0);
    const grandPurchases = pPurs.reduce((s, p) => s + Number(p.grandTotal ?? p.total ?? (Number(p.taxableTotal ?? p.subtotal ?? 0) + Number(p.gstTotal ?? p.tax ?? 0))), 0);

    const totalExpenses = pExps.reduce((s, e) => s + Number(e.amount ?? 0), 0);

    const grossProfit = taxableSales - taxablePurchases;
    const grossMarginPct = taxableSales > 0 ? (grossProfit / taxableSales) * 100 : 0;
    const profitAfterExpense = grossProfit - totalExpenses;
    const netMarginPct = taxableSales > 0 ? (profitAfterExpense / taxableSales) * 100 : 0;
    const netGstLiability = gstCollected - gstPurchases;

    return {
      taxableSales,
      gstCollected,
      grandSales,
      salesCount: pInvs.length,
      taxablePurchases,
      gstPurchases,
      grandPurchases,
      purchasesCount: pPurs.length,
      totalExpenses,
      expensesCount: pExps.length,
      grossProfit,
      grossMarginPct,
      profitAfterExpense,
      netMarginPct,
      netGstLiability,
      pInvs,
      pPurs,
      pExps,
    };
  }, [invoices, purchases, expenses, startDate, endDate]);

  if (!isOpen) return null;

  // Month options list for current selected FY
  const startYear = parseInt(selectedFY.split("-")[0], 10) || 2026;
  const monthOptions = FISCAL_MONTHS.map((fm) => {
    const yr = fm.nextYear ? startYear + 1 : startYear;
    const ym = `${yr}-${String(fm.m).padStart(2, "0")}`;
    return {
      value: ym,
      label: `${fm.name} ${yr}`,
      isCurrent: ym === currentMonthYM,
    };
  });

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      const res = generateFinancialReportPDF({
        timelineType,
        periodLabel,
        startDate,
        endDate,
        invoices,
        purchases,
        expenses,
        company,
      });
      if (showToast) {
        showToast(`✓ Downloaded ${res?.fileName || "Financial Report PDF"}`);
      }
      onClose();
    } catch (err) {
      console.error("Failed to generate financial report PDF:", err);
      alert(`Could not generate PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const headers = [
        "Record Type",
        "Document #",
        "Date",
        "Entity Name",
        "Category",
        "Payment Mode",
        "Taxable Amount (INR)",
        "GST / Tax (INR)",
        "Total (INR)",
        "Status"
      ];

      const rows = [];
      // Summary Row
      rows.push([
        `"STATEMENT SUMMARY"`,
        `"${periodLabel}"`,
        `"${startDate} to ${endDate}"`,
        `"Laxmi Enterprises"`,
        `"${timelineType.toUpperCase()}"`,
        `"All Modes"`,
        summary.taxableSales,
        summary.gstCollected,
        summary.grandSales,
        `"Net Profit: Rs. ${summary.profitAfterExpense}"`
      ]);

      // Sales rows
      summary.pInvs.forEach((inv) => {
        rows.push([
          `"SALE INVOICE"`,
          `"${inv.invoiceNumber || inv.id || ""}"`,
          `"${inv.invoiceDate || inv.date || ""}"`,
          `"${(inv.clientName || "").replace(/"/g, '""')}"`,
          `"${inv.category || ""}"`,
          `"${inv.paymentMethod || inv.paymentMode || ""}"`,
          Number(inv.taxableTotal ?? inv.amount ?? 0),
          Number(inv.gstTotal ?? inv.tax ?? 0),
          Number(inv.grandTotal ?? inv.total ?? 0),
          `"${inv.status || "Paid"}"`
        ]);
      });

      // Purchases rows
      summary.pPurs.forEach((p) => {
        rows.push([
          `"PURCHASE VOUCHER"`,
          `"${p.purchaseId || p.billNumber || p.id || ""}"`,
          `"${p.purchaseDate || p.date || ""}"`,
          `"${(p.vendorName || p.supplierName || "").replace(/"/g, '""')}"`,
          `"${p.category || ""}"`,
          `"${p.paymentMethod || p.paymentMode || ""}"`,
          Number(p.taxableTotal ?? p.subtotal ?? p.amount ?? 0),
          Number(p.gstTotal ?? p.tax ?? 0),
          Number(p.grandTotal ?? p.total ?? 0),
          `"${p.status || "Received"}"`
        ]);
      });

      // Expense rows
      summary.pExps.forEach((e) => {
        rows.push([
          `"OPERATING EXPENSE"`,
          `"${e.expenseNumber || e.id || ""}"`,
          `"${e.expenseDate || e.date || ""}"`,
          `"${(e.description || e.notes || "").replace(/"/g, '""')}"`,
          `"${e.category || ""}"`,
          `"${e.paymentMode || ""}"`,
          Number(e.amount ?? 0),
          0,
          Number(e.amount ?? 0),
          `"Expense"`
        ]);
      });

      const cleanName = (periodLabel || timelineType).replace(/[^a-zA-Z0-9_-]/g, "_");
      downloadCSV(`Financial_Statement_${cleanName}.csv`, headers, rows);
      if (showToast) showToast(`✓ Exported CSV for ${periodLabel}`);
    } catch (e) {
      console.error(e);
      alert(`Could not export CSV: ${e.message}`);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: "rgba(10, 25, 45, 0.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "700px",
          width: "95vw",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          background: "var(--card-bg, #ffffff)",
          border: "1px solid var(--border)",
          boxShadow: "0 25px 50px -12px rgba(0, 43, 92, 0.45)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg-main, #f8fafc)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(0, 91, 181, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                Financial Statement & P&L Report
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                Official statement covering Sales, Procurement, Operating Expenses & Commercial Profit
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            style={{ borderRadius: "50%", padding: "6px", cursor: "pointer" }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Step 1: Choose Timeline Granularity */}
          <div>
            <label style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "8px" }}>
              1. Select Report Timeline
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                className={timelineType === "monthly" ? "primary" : "outline"}
                onClick={() => setTimelineType("monthly")}
                style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
              >
                <Calendar size={15} /> Monthly Report
              </button>
              <button
                type="button"
                className={timelineType === "quarterly" ? "primary" : "outline"}
                onClick={() => setTimelineType("quarterly")}
                style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
              >
                <TrendingUp size={15} /> Quarterly Report
              </button>
              <button
                type="button"
                className={timelineType === "yearly" ? "primary" : "outline"}
                onClick={() => setTimelineType("yearly")}
                style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
              >
                <ShieldCheck size={15} /> Annual Statement
              </button>
            </div>
          </div>

          {/* Step 2: Granular Selectors */}
          <div style={{ background: "var(--bg-main, #f8fafc)", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Fiscal Year Selector */}
              <div style={{ flex: 1, minWidth: "160px" }}>
                <label style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Financial Year (FY)
                </label>
                <select
                  className="form-input"
                  style={{ width: "100%", padding: "7px 10px", fontSize: "13px", fontWeight: 600 }}
                  value={selectedFY}
                  onChange={(e) => {
                    setSelectedFY(e.target.value);
                    const newSY = parseInt(e.target.value.split("-")[0], 10) || 2026;
                    setSelectedMonth(`${newSY}-04`);
                  }}
                >
                  {fyOptions.map((fy) => (
                    <option key={fy} value={fy}>
                      FY {fy} {fy === currentFY ? "(Current)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quarterly Specific Selector */}
              {timelineType === "quarterly" && (
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Quarter
                  </label>
                  <select
                    className="form-input"
                    style={{ width: "100%", padding: "7px 10px", fontSize: "13px", fontWeight: 600 }}
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                  >
                    <option value="Q1">Q1 (Apr - Jun)</option>
                    <option value="Q2">Q2 (Jul - Sep)</option>
                    <option value="Q3">Q3 (Oct - Dec)</option>
                    <option value="Q4">Q4 (Jan - Mar)</option>
                  </select>
                </div>
              )}

              {/* Monthly Specific Selector */}
              {timelineType === "monthly" && (
                <div style={{ flex: 1.5, minWidth: "200px" }}>
                  <label style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Month
                  </label>
                  <select
                    className="form-input"
                    style={{ width: "100%", padding: "7px 10px", fontSize: "13px", fontWeight: 600 }}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {monthOptions.map((mo) => (
                      <option key={mo.value} value={mo.value}>
                        {mo.label} {mo.isCurrent ? "• (Current Month)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <ArrowRight size={13} />
              Target Period: <span>{periodLabel}</span>
            </div>
          </div>

          {/* Live Financial Statement Summary Snapshot */}
          <div>
            <label style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "8px" }}>
              Real-Time Ledger Snapshot for this Timeline
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              {/* Sales Card */}
              <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(0, 91, 181, 0.05)", border: "1px solid rgba(0, 91, 181, 0.18)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>Gross Sales Turnover</span>
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>{summary.salesCount} Invoices</span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>
                  {formatIndianCurrency(summary.taxableSales)}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  GST Output: {formatIndianCurrency(summary.gstCollected)} | Total: {formatIndianCurrency(summary.grandSales)}
                </div>
              </div>

              {/* Purchases Card */}
              <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>Procurement (COGS)</span>
                  <span style={{ fontWeight: 600, color: "#10b981" }}>{summary.purchasesCount} Vouchers</span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#10b981", marginTop: "4px" }}>
                  {formatIndianCurrency(summary.taxablePurchases)}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  GST Input ITC: {formatIndianCurrency(summary.gstPurchases)} | Total: {formatIndianCurrency(summary.grandPurchases)}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {/* Expenses Card */}
              <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.18)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>Operating Expenses</span>
                  <span style={{ fontWeight: 600, color: "var(--danger)" }}>{summary.expensesCount} Records</span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--danger)", marginTop: "4px" }}>
                  {formatIndianCurrency(summary.totalExpenses)}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Logistics, Salaries, Rent, Utilities & Overheads
                </div>
              </div>

              {/* Profit After Expense Card */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: summary.profitAfterExpense >= 0 ? "rgba(13, 148, 136, 0.07)" : "rgba(244, 63, 94, 0.07)",
                  border: summary.profitAfterExpense >= 0 ? "1px solid rgba(13, 148, 136, 0.3)" : "1px solid rgba(244, 63, 94, 0.3)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>Profit After Expense (Net)</span>
                  <span style={{ fontWeight: 700, color: summary.profitAfterExpense >= 0 ? "#0f766e" : "#be123c" }}>
                    {summary.netMarginPct.toFixed(1)}% Net Margin
                  </span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: summary.profitAfterExpense >= 0 ? "#0f766e" : "#be123c", marginTop: "4px" }}>
                  {formatIndianCurrency(summary.profitAfterExpense)}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Gross Profit: {formatIndianCurrency(summary.grossProfit)} ({summary.grossMarginPct.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
            background: "var(--bg-main, #f8fafc)",
          }}
        >
          <button
            type="button"
            className="outline"
            onClick={onClose}
            disabled={isGenerating}
            style={{ cursor: "pointer" }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="outline"
            onClick={handleDownloadCSV}
            disabled={isGenerating}
            style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 600 }}
            title="Download structured CSV file"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            type="button"
            className="primary"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", fontWeight: 700, cursor: "pointer" }}
            title="Generate and download official PDF Statement"
          >
            <FileText size={16} />
            {isGenerating ? "Compiling PDF..." : `Download ${timelineType === "monthly" ? "Monthly" : timelineType === "quarterly" ? "Quarterly" : "Annual"} PDF`}
          </button>
        </div>
      </div>
    </div>
  );
}
