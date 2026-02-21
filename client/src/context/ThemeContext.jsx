import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authAPI } from "../api";
import { useAuth } from "./AuthContext";

const THEMES = ["medical", "midnight", "emerald"];
const MODES = ["light", "dark"];

const THEME_TOKENS = {
  medical: {
    light: {
      bg: "#f8fafc",
      surface: "#ffffff",
      surface2: "#f1f5f9",
      border: "#e2e8f0",
      text: "#0f172a",
      textMuted: "#64748b",
      primary: "#2563eb",
      secondary: "#0ea5e9",
      accent: "#22c55e",
      ringTrack: "rgba(148, 163, 184, 0.35)",
      focus: "rgba(37, 99, 235, 0.35)",
      glass: "rgba(255, 255, 255, 0.60)",
      bgEffect1: "rgba(37, 99, 235, 0.10)",
      bgEffect2: "rgba(14, 165, 233, 0.08)",
      bgEffect3: "rgba(34, 197, 94, 0.07)",
    },
    dark: {
      bg: "#0f172a",
      surface: "#1e293b",
      surface2: "#0b1220",
      border: "rgba(148, 163, 184, 0.22)",
      text: "#f1f5f9",
      textMuted: "#94a3b8",
      primary: "#3b82f6",
      secondary: "#38bdf8",
      accent: "#34d399",
      ringTrack: "rgba(148, 163, 184, 0.22)",
      focus: "rgba(59, 130, 246, 0.45)",
      glass: "rgba(30, 41, 59, 0.55)",
      bgEffect1: "rgba(59, 130, 246, 0.20)",
      bgEffect2: "rgba(56, 189, 248, 0.14)",
      bgEffect3: "rgba(52, 211, 153, 0.11)",
    },
  },
  midnight: {
    light: {
      bg: "#f5f3ff",
      surface: "#ffffff",
      surface2: "#ede9fe",
      border: "#ddd6fe",
      text: "#0f172a",
      textMuted: "#6b7280",
      primary: "#7c3aed",
      secondary: "#a78bfa",
      accent: "#06b6d4",
      ringTrack: "rgba(124, 58, 237, 0.16)",
      focus: "rgba(124, 58, 237, 0.35)",
      glass: "rgba(255, 255, 255, 0.62)",
      bgEffect1: "rgba(124, 58, 237, 0.12)",
      bgEffect2: "rgba(167, 139, 250, 0.10)",
      bgEffect3: "rgba(6, 182, 212, 0.08)",
    },
    dark: {
      bg: "#0f0a1f",
      surface: "#1a132e",
      surface2: "#120c24",
      border: "rgba(167, 139, 250, 0.22)",
      text: "#f5f3ff",
      textMuted: "#c4b5fd",
      primary: "#8b5cf6",
      secondary: "#a78bfa",
      accent: "#22d3ee",
      ringTrack: "rgba(167, 139, 250, 0.18)",
      focus: "rgba(139, 92, 246, 0.45)",
      glass: "rgba(26, 19, 46, 0.60)",
      bgEffect1: "rgba(139, 92, 246, 0.20)",
      bgEffect2: "rgba(167, 139, 250, 0.15)",
      bgEffect3: "rgba(34, 211, 238, 0.10)",
    },
  },
  emerald: {
    light: {
      bg: "#ecfdf5",
      surface: "#ffffff",
      surface2: "#d1fae5",
      border: "#a7f3d0",
      text: "#052e16",
      textMuted: "#065f46",
      primary: "#059669",
      secondary: "#10b981",
      accent: "#f59e0b",
      ringTrack: "rgba(5, 150, 105, 0.16)",
      focus: "rgba(5, 150, 105, 0.35)",
      glass: "rgba(255, 255, 255, 0.62)",
      bgEffect1: "rgba(5, 150, 105, 0.12)",
      bgEffect2: "rgba(16, 185, 129, 0.10)",
      bgEffect3: "rgba(245, 158, 11, 0.08)",
    },
    dark: {
      bg: "#052e16",
      surface: "#064e3b",
      surface2: "#03261b",
      border: "rgba(167, 243, 208, 0.18)",
      text: "#ecfdf5",
      textMuted: "#a7f3d0",
      primary: "#34d399",
      secondary: "#10b981",
      accent: "#fbbf24",
      ringTrack: "rgba(167, 243, 208, 0.16)",
      focus: "rgba(52, 211, 153, 0.40)",
      glass: "rgba(6, 78, 59, 0.58)",
      bgEffect1: "rgba(52, 211, 153, 0.16)",
      bgEffect2: "rgba(16, 185, 129, 0.12)",
      bgEffect3: "rgba(251, 191, 36, 0.10)",
    },
  },
};

const hexToHslChannels = (hexValue) => {
  const hex = hexValue.replace("#", "").trim();
  if (hex.length !== 6) return "0 0% 0%";

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const textOnColor = (hex) => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#0f172a" : "#f8fafc";
};

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user, updateUser } = useAuth();

  const [theme, setThemeState] = useState(
    localStorage.getItem("theme") || "midnight",
  );
  const [mode, setModeState] = useState(
    localStorage.getItem("themeMode") || "light",
  );

  const applyThemeToDocument = useCallback((nextTheme, nextMode) => {
    const safeTheme = THEMES.includes(nextTheme) ? nextTheme : "midnight";
    const safeMode = MODES.includes(nextMode) ? nextMode : "light";
    const palette = THEME_TOKENS[safeTheme][safeMode];

    const root = document.documentElement;
    root.setAttribute("data-theme", safeTheme);
    root.setAttribute("data-mode", safeMode);
    root.classList.toggle("dark", safeMode === "dark");

    root.style.setProperty("--bg", palette.bg);
    root.style.setProperty("--surface", palette.surface);
    root.style.setProperty("--surface-2", palette.surface2);
    root.style.setProperty("--border-color", palette.border);
    root.style.setProperty("--text", palette.text);
    root.style.setProperty("--text-muted", palette.textMuted);
    root.style.setProperty("--focus", palette.focus);
    root.style.setProperty("--glass", palette.glass);
    root.style.setProperty("--ring-track", palette.ringTrack);
    root.style.setProperty("--bg-effect-1", palette.bgEffect1);
    root.style.setProperty("--bg-effect-2", palette.bgEffect2);
    root.style.setProperty("--bg-effect-3", palette.bgEffect3);

    root.style.setProperty("--background", hexToHslChannels(palette.bg));
    root.style.setProperty("--foreground", hexToHslChannels(palette.text));
    root.style.setProperty("--card", hexToHslChannels(palette.surface));
    root.style.setProperty("--card-foreground", hexToHslChannels(palette.text));
    root.style.setProperty("--muted", hexToHslChannels(palette.surface2));
    root.style.setProperty(
      "--muted-foreground",
      hexToHslChannels(palette.textMuted),
    );
    root.style.setProperty("--accent", hexToHslChannels(palette.accent));
    root.style.setProperty(
      "--accent-foreground",
      hexToHslChannels(textOnColor(palette.accent)),
    );
    root.style.setProperty("--primary", hexToHslChannels(palette.primary));
    root.style.setProperty(
      "--primary-foreground",
      hexToHslChannels(textOnColor(palette.primary)),
    );
    root.style.setProperty("--secondary", hexToHslChannels(palette.secondary));
    root.style.setProperty(
      "--secondary-foreground",
      hexToHslChannels(textOnColor(palette.secondary)),
    );
    root.style.setProperty("--destructive", hexToHslChannels("#ef4444"));
    root.style.setProperty(
      "--destructive-foreground",
      hexToHslChannels("#ffffff"),
    );
    root.style.setProperty(
      "--border",
      hexToHslChannels(
        palette.border.startsWith("#") ? palette.border : "#94a3b8",
      ),
    );
    root.style.setProperty(
      "--input",
      hexToHslChannels(
        palette.border.startsWith("#") ? palette.border : "#94a3b8",
      ),
    );
    root.style.setProperty("--ring", hexToHslChannels(palette.primary));

    localStorage.setItem("theme", safeTheme);
    localStorage.setItem("themeMode", safeMode);
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme, mode);
  }, [theme, mode, applyThemeToDocument]);

  useEffect(() => {
    const userTheme = user?.uiPreferences?.theme;
    const userMode = user?.uiPreferences?.mode;

    if (!userTheme && !userMode) return;

    const nextTheme =
      userTheme && THEMES.includes(userTheme) ? userTheme : theme;
    const nextMode = userMode && MODES.includes(userMode) ? userMode : mode;

    if (nextTheme !== theme) setThemeState(nextTheme);
    if (nextMode !== mode) setModeState(nextMode);
  }, [user?.uiPreferences?.theme, user?.uiPreferences?.mode]);

  const setTheme = async (nextTheme, persist = true) => {
    const safeTheme = THEMES.includes(nextTheme) ? nextTheme : "midnight";
    setThemeState(safeTheme);

    if (persist && user) {
      try {
        const response = await authAPI.updatePreferences({
          theme: safeTheme,
          mode,
        });
        updateUser(response.data.data.user);
      } catch (error) {
        console.error("Failed to persist theme:", error);
      }
    }
  };

  const setMode = async (nextMode, persist = true) => {
    const safeMode = MODES.includes(nextMode) ? nextMode : "light";
    setModeState(safeMode);

    if (persist && user) {
      try {
        const response = await authAPI.updatePreferences({
          theme,
          mode: safeMode,
        });
        updateUser(response.data.data.user);
      } catch (error) {
        console.error("Failed to persist mode:", error);
      }
    }
  };

  const setThemeMode = async ({ nextTheme, nextMode, persist = true }) => {
    const safeTheme = THEMES.includes(nextTheme) ? nextTheme : theme;
    const safeMode = MODES.includes(nextMode) ? nextMode : mode;

    setThemeState(safeTheme);
    setModeState(safeMode);

    if (persist && user) {
      try {
        const response = await authAPI.updatePreferences({
          theme: safeTheme,
          mode: safeMode,
        });
        updateUser(response.data.data.user);
      } catch (error) {
        console.error("Failed to persist preferences:", error);
      }
    }
  };

  const value = useMemo(
    () => ({
      theme,
      mode,
      themes: THEMES,
      modes: MODES,
      setTheme,
      setMode,
      setThemeMode,
    }),
    [theme, mode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
