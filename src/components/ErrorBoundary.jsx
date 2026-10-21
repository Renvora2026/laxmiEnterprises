import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "var(--bg-main, #f8fafc)",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            maxWidth: 520,
            width: "100%",
            background: "var(--card-bg, #ffffff)",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            border: "1px solid var(--border, #e2e8f0)",
            textAlign: "center"
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: "1.3rem", margin: "0 0 8px", color: "var(--text-main, #0f172a)" }}>
              Something Went Wrong
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted, #64748b)", margin: "0 0 20px" }}>
              An unexpected error occurred while rendering this view. You can reload the page or return to the dashboard.
            </p>

            {this.state.error && (
              <pre style={{
                textAlign: "left",
                background: "rgba(0,0,0,0.04)",
                padding: 12,
                borderRadius: 8,
                fontSize: "0.78rem",
                overflowX: "auto",
                color: "#dc2626",
                marginBottom: 20,
                maxHeight: 140
              }}>
                {this.state.error.toString()}
              </pre>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                className="outline"
                onClick={this.handleReload}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid var(--border, #cbd5e1)",
                  cursor: "pointer",
                  background: "transparent",
                  fontWeight: 600
                }}
              >
                <RefreshCw size={15} /> Reload Page
              </button>

              <button
                type="button"
                className="primary"
                onClick={this.handleReset}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                <Home size={15} /> Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
