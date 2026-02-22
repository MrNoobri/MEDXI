import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageSquareText,
  BellRing,
  MoonStar,
  Palette,
  SunMedium,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import OverviewTab from "../components/provider/OverviewTab";
import CalendarTab from "../components/provider/CalendarTab";
import PatientsTab from "../components/provider/PatientsTab";
import MessagesTab from "../components/provider/MessagesTab";
import AlertsTab from "../components/provider/AlertsTab";
import { appointmentsAPI, alertsAPI, messagesAPI } from "../api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "patients", label: "Patients", icon: Users },
  { key: "messages", label: "Messages", icon: MessageSquareText },
  { key: "alerts", label: "Alerts", icon: BellRing },
];

/* ──────────── Quick Panel Card ──────────── */
const QuickPanel = ({ icon: Icon, title, count, subtitle, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.4 }}
    onClick={onClick}
    className="relative overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 hover:scale-[1.02] group"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{count}</p>
        <p className="text-sm text-muted-foreground">
          {title} <span className="text-xs">({subtitle})</span>
        </p>
      </div>
    </div>
  </motion.div>
);

/* ──────────── Provider Dashboard ──────────── */
const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, mode, setTheme, setMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showSplash, setShowSplash] = useState(true);
  const heroRef = useRef(null);

  // ── 2-second splash timer ──
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // ── Scroll-driven transitions for hero → dashboard ──
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Hero 70% section: parallax up + fade out
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.6, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  // Quick panels: slide down slightly + fade
  const panelsY = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const panelsOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.8, 0]);

  // Dashboard section: fade in + slide up
  const dashboardOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
  const dashboardY = useTransform(scrollYProgress, [0.5, 1], [40, 0]);

  // ── React Query: patients, appointments, messages, alerts ──
  const { data: patients } = useQuery({
    queryKey: ["providerPatients"],
    queryFn: async () => {
      const response = await appointmentsAPI.getProviderPatients();
      return response.data.data;
    },
  });

  const { data: todayAppointments } = useQuery({
    queryKey: ["appointments", "today"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const response = await appointmentsAPI.getAll({
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
      });
      return response.data.data;
    },
  });

  const { data: unreadMessagesData } = useQuery({
    queryKey: ["unreadMessages"],
    queryFn: async () => {
      const response = await messagesAPI.getUnreadCount();
      return response.data.data?.count || 0;
    },
  });

  const { data: patientAlerts } = useQuery({
    queryKey: ["patientAlerts", patients?.map((p) => p._id)],
    queryFn: async () => {
      if (!patients || patients.length === 0) return [];
      const ids = patients.map((p) => p._id).join(",");
      const response = await alertsAPI.getAll({
        patientIds: ids,
        limit: 100,
      });
      return response.data.data;
    },
    enabled: !!patients && patients.length > 0,
  });

  const activeAlertsCount = (patientAlerts || []).filter(
    (a) => !a.isAcknowledged,
  ).length;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Splash: Full-screen MEDXI (2s then fades into 70/30 split) ── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* Gradient blobs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-60 bg-[var(--bg-effect-1)]" />
              <div className="absolute bottom-1/3 right-1/4 w-[22rem] h-[22rem] rounded-full blur-3xl opacity-50 bg-[var(--bg-effect-2)]" />
              <div className="absolute top-2/3 left-1/2 w-[18rem] h-[18rem] rounded-full blur-3xl opacity-40 bg-[var(--bg-effect-3)]" />
            </div>

            {/* MEDXI Title */}
            <motion.h1
              className="relative text-[clamp(5rem,15vw,12rem)] font-black tracking-tighter leading-none select-none"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="text-primary">MED</span>
              <span className="text-foreground">XI</span>
            </motion.h1>

            {/* Welcome text */}
            <motion.p
              className="relative text-xl md:text-2xl text-foreground/60 mt-4 font-medium tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Welcome back, Dr. {user?.profile?.lastName}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 70/30 Split: MEDXI hero (70vh) + Quick Panels (30vh) ── */}
      <div ref={heroRef} className="h-screen flex flex-col">
        {/* Top 70% — MEDXI + Welcome */}
        <motion.div
          className="flex-[7] relative flex flex-col items-center justify-center overflow-hidden"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          {/* Gradient blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-60 bg-[var(--bg-effect-1)]" />
            <div className="absolute bottom-1/3 right-1/4 w-[22rem] h-[22rem] rounded-full blur-3xl opacity-50 bg-[var(--bg-effect-2)]" />
            <div className="absolute top-2/3 left-1/2 w-[18rem] h-[18rem] rounded-full blur-3xl opacity-40 bg-[var(--bg-effect-3)]" />
          </div>

          <h1 className="relative text-[clamp(3rem,10vw,7rem)] font-black tracking-tighter leading-none select-none">
            <span className="text-primary">MED</span>
            <span className="text-foreground">XI</span>
          </h1>
          <p className="relative text-lg md:text-xl text-foreground/60 mt-3 font-medium tracking-wide">
            Welcome back, Dr. {user?.profile?.lastName}
          </p>
        </motion.div>

        {/* Bottom 30% — Quick Panels */}
        <motion.div
          className="flex-[3] border-t border-border bg-card/40 px-4 sm:px-6 lg:px-8 flex items-center"
          style={{ y: panelsY, opacity: panelsOpacity }}
        >
          <div className="max-w-5xl mx-auto w-full py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickPanel
                icon={CalendarDays}
                title="Appointments"
                count={todayAppointments?.length || 0}
                subtitle="today"
                onClick={() => {
                  setActiveTab("calendar");
                  setTimeout(() => {
                    document
                      .getElementById("dashboard-tabs")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              />
              <QuickPanel
                icon={BellRing}
                title="Active Alerts"
                count={activeAlertsCount}
                subtitle="unacknowledged"
                onClick={() => {
                  setActiveTab("alerts");
                  setTimeout(() => {
                    document
                      .getElementById("dashboard-tabs")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              />
              <QuickPanel
                icon={MessageSquareText}
                title="Messages"
                count={unreadMessagesData || 0}
                subtitle="unread"
                onClick={() => {
                  setActiveTab("messages");
                  setTimeout(() => {
                    document
                      .getElementById("dashboard-tabs")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Sidebar + Dashboard Layout ── */}
      <motion.div
        className="relative z-10 flex min-h-screen"
        style={{ opacity: dashboardOpacity, y: dashboardY }}
      >
        {/* ── Left Sidebar ── */}
        <aside className="sticky top-0 h-screen w-64 shrink-0 bg-card/95 backdrop-blur-md border-r border-border shadow-sm flex flex-col z-40">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-border">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-2xl font-bold tracking-tight hover:opacity-90"
            >
              <span className="text-primary">MED</span>
              <span className="text-foreground">XI</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const badge =
                tab.key === "alerts" && activeAlertsCount > 0
                  ? activeAlertsCount
                  : tab.key === "messages" && unreadMessagesData > 0
                    ? unreadMessagesData
                    : null;

              return (
                <Button
                  key={tab.key}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "w-full justify-start rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-all flex items-center gap-2.5",
                    activeTab === tab.key
                      ? "bg-primary/15 text-primary border-primary/25 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                  {badge != null && (
                    <span className="ml-auto bg-danger text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                      {badge}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Theme Selectors */}
          <div className="px-3 py-3 border-t border-border space-y-2">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="h-9 w-full rounded-xl border-border/80 bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                  <SelectValue aria-label="Select color theme" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="midnight">Midnight</SelectItem>
                <SelectItem value="emerald">Emerald</SelectItem>
              </SelectContent>
            </Select>

            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="h-9 w-full rounded-xl border-border/80 bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  {mode === "dark" ? (
                    <MoonStar className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <SunMedium className="h-3.5 w-3.5 text-primary" />
                  )}
                  <SelectValue aria-label="Select color mode" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Info + Actions */}
          <div className="px-3 py-4 border-t border-border space-y-2">
            <div className="px-2 mb-2">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/profile")}
            >
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-h-screen pt-6 pb-16 px-6 lg:px-10">
          <div id="dashboard-tabs" className="max-w-6xl mx-auto">
            {/* Tab Content */}
            {activeTab === "overview" && (
              <OverviewTab
                todayAppointments={todayAppointments}
                patients={patients}
                patientAlerts={patientAlerts}
                unreadMessages={unreadMessagesData}
                onSwitchTab={setActiveTab}
              />
            )}

            {activeTab === "calendar" && <CalendarTab />}

            {activeTab === "patients" && <PatientsTab patients={patients} />}

            {activeTab === "messages" && <MessagesTab />}

            {activeTab === "alerts" && (
              <AlertsTab patientAlerts={patientAlerts} patients={patients} />
            )}
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default ProviderDashboard;
