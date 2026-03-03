import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Activity,
  CalendarCheck,
  MessageSquare,
  Watch,
  Palette,
  LogOut,
  Bell,
  User,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Switch from "../ui/Switch";
import { cn } from "@/lib/utils";

const PATIENT_NAV = [
  { id: "overview", label: "Home", icon: Home },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "appointments", label: "Appointments", icon: CalendarCheck },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "wearables", label: "Wearables", icon: Watch },
  { id: "alerts", label: "Alerts", icon: Bell },
];

const PROVIDER_NAV = [
  { id: "overview", label: "Home", icon: Home },
  { id: "patients", label: "Patients", icon: Activity },
  { id: "appointments", label: "Appointments", icon: CalendarCheck },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "alerts", label: "Alerts", icon: Bell },
];

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  role = "patient",
  onThemeToggle,
  visible = true,
  className,
}) {
  const { user, logout } = useAuth();
  const { theme, mode, setTheme, setMode, themes } = useTheme();
  const navigate = useNavigate();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const navItems = role === "provider" ? PROVIDER_NAV : PATIENT_NAV;
  const firstName = user?.profile?.firstName || "User";
  const initials = `${(user?.profile?.firstName || "U")[0]}${(user?.profile?.lastName || "")[0] || ""}`.toUpperCase();

  const handleNavClick = (id) => {
    if (id === "alerts") {
      navigate("/alerts");
    } else {
      onTabChange(id);
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40 flex flex-col",
        "w-[72px] hover:w-[220px] transition-all duration-300 ease-in-out",
        "bg-background/60 backdrop-blur-2xl border-r border-border/40",
        "shadow-[4px_0_24px_-2px_rgba(0,0,0,0.06)]",
        "group/sidebar",
        visible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-full pointer-events-none",
        className
      )}
    >
      {/* ── Logo ── */}
      <div className="h-16 flex items-center px-5 border-b border-border/30 overflow-hidden shrink-0">
        <span className="text-foreground font-black text-2xl tracking-tighter shrink-0">XI</span>
        <span className="text-muted-foreground font-medium text-sm ml-2 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
          Health
        </span>
      </div>

      {/* ── Profile Pill ── */}
      <button
        onClick={() => navigate("/profile")}
        className="mx-3 mt-4 mb-2 flex items-center gap-3 p-2 rounded-xl hover:bg-primary/8 transition-colors overflow-hidden group/profile"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0 ring-2 ring-primary/20 group-hover/profile:ring-primary/40 transition-all">
          {initials}
        </div>
        <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 min-w-0 text-left">
          <p className="text-sm font-semibold text-foreground truncate">{firstName}</p>
          <p className="text-xs text-muted-foreground truncate capitalize">{user?.role || "patient"}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover/sidebar:opacity-100 transition-opacity shrink-0" />
      </button>

      <div className="h-px bg-border/30 mx-4 my-1" />

      {/* ── Nav Items ── */}
      <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 overflow-hidden group/navitem",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator pill — animated with layoutId */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-primary/12 rounded-xl"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              {/* Hover glow background (non-active items) */}
              {!isActive && (
                <span className="absolute inset-0 rounded-xl bg-muted/0 group-hover/navitem:bg-muted/60 transition-colors duration-200" />
              )}

              {/* Active left bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 relative z-10 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover/navitem:scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 relative z-10">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Bottom Actions ── */}
      <div className="px-3 pb-4 pt-2 space-y-0.5 border-t border-border/30 shrink-0">
        {/* Light / Dark mode toggle */}
        <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground overflow-hidden">
          <div className="shrink-0 flex items-center">
            {mode === "dark" ? (
              <Moon className="w-5 h-5" strokeWidth={2} />
            ) : (
              <Sun className="w-5 h-5" strokeWidth={2} />
            )}
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium whitespace-nowrap">
              {mode === "dark" ? "Dark" : "Light"}
            </span>
            <Switch
              checked={mode === "dark"}
              onChange={(checked) => setMode(checked ? "dark" : "light")}
              size="sm"
              icon={{
                on: <Moon className="w-2.5 h-2.5" />,
                off: <Sun className="w-2.5 h-2.5" />,
              }}
            />
          </div>
        </div>

        {/* Theme Picker */}
        <div className="relative">
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all overflow-hidden"
          >
            <Palette className="w-5 h-5 shrink-0" strokeWidth={2} />
            <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
              Theme
            </span>
          </button>

          <AnimatePresence>
            {showThemePicker && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 w-[200px] bg-card border border-border rounded-xl shadow-xl p-2 z-50"
              >
                <p className="text-xs text-muted-foreground px-2 py-1 font-medium uppercase tracking-wider">Choose theme</p>
                {(themes || ["medical", "midnight", "emerald"]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      setShowThemePicker(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors",
                      theme === t
                        ? "bg-primary/12 text-primary font-semibold"
                        : "text-foreground hover:bg-muted/60"
                    )}
                  >
                    <span
                      className="w-4 h-4 rounded-full border-2 shrink-0"
                      style={{
                        background: t === "crimson" ? "#e11d48" : t === "medical" ? "#3b82f6" : t === "midnight" ? "#8b5cf6" : "#34d399",
                        borderColor: theme === t ? "hsl(var(--primary))" : "transparent",
                      }}
                    />
                    <span className="capitalize">{t}</span>
                    {theme === t && (
                      <svg className="w-4 h-4 ml-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-danger hover:bg-danger/8 transition-all overflow-hidden"
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={2} />
          <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
