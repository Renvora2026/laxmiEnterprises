import React from "react";
import { Sun, Moon } from "lucide-react";

export const THEMES = [
  {
    id: "light",
    name: "Light Mode",
    tagline: "Corporate Daylight Palette",
    colors: ["#005bb5", "#00b4d8", "#f8fafc"]
  },
  {
    id: "dark",
    name: "Dark Mode",
    tagline: "Executive Midnight Slate",
    colors: ["#090e17", "#38bdf8", "#0f192b"]
  }
];

export default function ThemeSelector({ currentTheme, onSelectTheme }) {
  const isDark = currentTheme === "dark" || currentTheme === "midnight";

  const handleToggle = () => {
    onSelectTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="theme-selector-wrap">
      <button 
        type="button"
        className="theme-pill-btn" 
        onClick={handleToggle}
        title={`Current: ${isDark ? "Dark Mode" : "Light Mode"}. Click to toggle.`}
        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}
      >
        {isDark ? (
          <>
            <Moon size={15} style={{ color: "#38bdf8" }} />
            <span className="theme-name-text">Dark Mode</span>
          </>
        ) : (
          <>
            <Sun size={15} style={{ color: "#f59e0b" }} />
            <span className="theme-name-text">Light Mode</span>
          </>
        )}
      </button>
    </div>
  );
}
