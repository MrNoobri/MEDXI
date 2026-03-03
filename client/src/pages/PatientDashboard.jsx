import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  MessageSquareText,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import DraggableGrid from "../components/patient/DraggableGrid";
import AddMetricModal from "../components/health/AddMetricModal";
import MetricChart from "../components/health/MetricChart";
import ChatbotWidget from "../components/chatbot/ChatbotWidget";
import RecipesWidget from "../components/dashboard/RecipesWidget";
import WearableDevices from "../components/wearables/WearableDevices";
import GoogleFitConnect from "../components/GoogleFitConnect";
import FitMetricTile from "../components/patient/FitMetricTile";
import ActivityOverview from "../components/patient/ActivityOverview";
import PatientInsights from "../components/patient/PatientInsights";
import PatientHero from "../components/patient/PatientHero";
import DashboardSidebar from "../components/patient/DashboardSidebar";
import MetricDetailModal from "../components/patient/MetricDetailModal";
import FloatingAIButton from "../components/patient/FloatingAIButton";
import { BackgroundPaths } from "@/components/ui/background-paths";

import { AIInputWithLoading } from "@/components/ui/ai-input-with-loading";
import { healthMetricsAPI, alertsAPI, chatbotAPI } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ──── Alerts Banner ──── */
const AlertsSection = ({ alertsData, onViewAllAlerts, theme }) => {
  if (!alertsData || alertsData.length === 0) return null;

  const severityRank = { low: 1, medium: 2, high: 3, critical: 4 };
  const highestSeverityAlert = alertsData.reduce((acc, current) => {
    if (!acc) return current;
    return (severityRank[current?.severity] || 0) >
      (severityRank[acc?.severity] || 0)
      ? current
      : acc;
  }, null);

  const severity = highestSeverityAlert?.severity || "medium";

  const alertStyles = {
    medical: {
      card: "border-l-4 border-danger/80 bg-danger-light/20",
      title: "text-danger-dark",
      badge: "bg-danger text-white",
      button: "bg-danger text-white hover:bg-danger-dark",
    },
    midnight: {
      card: "border-l-4 border-primary/70 bg-primary/15",
      title: "text-foreground",
      badge: "bg-primary text-primary-foreground",
      button: "bg-primary text-primary-foreground hover:opacity-90",
    },
    emerald: {
      card: "border-l-4 border-warning bg-warning-light/35",
      title: "text-warning-dark",
      badge: "bg-warning text-white",
      button: "bg-warning text-white hover:bg-warning-dark",
    },
  };

  const severityStyles = {
    critical: {
      card: "ring-1 ring-danger/40",
      badge: "bg-danger text-white",
      title: "text-danger-dark",
      emphasis: "Critical",
    },
    high: {
      card: "ring-1 ring-warning/40",
      badge: "bg-warning text-white",
      title: "text-warning-dark",
      emphasis: "High",
    },
    medium: {
      card: "ring-1 ring-primary/30",
      badge: "bg-primary text-primary-foreground",
      title: "text-primary",
      emphasis: "Medium",
    },
    low: {
      card: "ring-1 ring-secondary/45",
      badge: "bg-secondary text-secondary-foreground",
      title: "text-foreground",
      emphasis: "Low",
    },
  };

  const styles = alertStyles[theme] || alertStyles.medical;
  const level = severityStyles[severity] || severityStyles.medium;

  return (
    <div className="mb-6">
      <Card className={cn(styles.card, level.card)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "rounded-full p-1.5 mt-0.5",
                  styles.badge,
                  level.badge,
                )}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                  {level.emphasis} priority
                </p>
                <p className={cn("font-semibold", styles.title, level.title)}>
                  You have {alertsData.length} active alert(s)
                </p>
                <p className="text-sm text-foreground/80 mt-1">
                  {highestSeverityAlert?.message}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onViewAllAlerts}
              className={styles.button}
            >
              View All Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ──── Chart Detail Modal ──── */
const ChartSection = ({ selectedMetric, metricHistory, onClose }) => {
  if (!selectedMetric || !metricHistory || metricHistory.length === 0)
    return null;
  return (
    <div className="mb-8">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl">
            {selectedMetric.replace(/([A-Z])/g, " $1").trim()} - Last 7 Days
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        <CardContent>
          <MetricChart data={metricHistory} metricType={selectedMetric} />
        </CardContent>
      </Card>
    </div>
  );
};

/* ──── AI Assistant Section ──── */
const AIAssistantSection = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (text) => {
    const userMsg = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await chatbotAPI.sendMessage(text);
      const reply =
        response.data?.data?.reply ||
        response.data?.reply ||
        "I'm not sure how to respond to that.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, timestamp: new Date() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            MEDXI AI Assistant
          </h2>
          <p className="text-muted-foreground">
            Ask me anything about your health
          </p>
        </div>

        {/* Chat Messages */}
        {messages.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4 max-h-[50vh] overflow-y-auto space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md",
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 text-sm text-muted-foreground">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
          </Card>
        )}

        {/* AI Input */}
        <AIInputWithLoading
          onSubmit={handleSubmit}
          placeholder="Ask about your health, medications, symptoms..."
          loadingDuration={3000}
          minHeight={56}
          maxHeight={200}
        />
      </motion.div>
    </div>
  );
};

/* ════════════════════════════════════════════════════
   ██  PATIENT DASHBOARD  ██
   ════════════════════════════════════════════════════ */
const PatientDashboard = () => {
  const { user } = useAuth();
  const { theme, mode, setTheme, setMode } = useTheme();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // Show splash on every page mount (login / navigation to dashboard)
  const [showSplash, setShowSplash] = useState(true);
  const [splashPhase, setSplashPhase] = useState("logo"); // "logo" -> "line" -> "done"
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const isDragging = useRef(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatorData, setSimulatorData] = useState({
    heartRate: null,
    steps: 0,
    spo2: null,
    bloodPressure: null,
    lastUpdate: null,
  });

  const firstName = user?.profile?.firstName || "there";

  // ── Splash animation phases ──
  useEffect(() => {
    if (!showSplash) return;
    // Phase 1: Logo visible for 1.2s, then snap apart
    const t1 = setTimeout(() => setSplashPhase("line"), 1200);
    // Phase 2: Welcome text appears, hold for 1.8s then exit
    const t2 = setTimeout(() => setSplashPhase("done"), 3200);
    const t3 = setTimeout(() => setShowSplash(false), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [showSplash]);

  // ── Track when user scrolls past the hero ──
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const threshold = window.innerHeight * 0.55;
      setPastHero(scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Scroll-snap: CSS-based for smooth native snapping ──
  useEffect(() => {
    // Apply scroll-snap to the <html> element for native smooth snapping
    const html = document.documentElement;
    html.style.scrollSnapType = "y proximity";
    html.style.overflowY = "auto";
    html.style.scrollBehavior = "smooth";

    return () => {
      html.style.scrollSnapType = "";
      html.style.overflowY = "";
      html.style.scrollBehavior = "";
    };
  }, []);

  // ── Scroll-driven hero → dashboard transitions ──
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const panelsOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.8, 0]);
  const dashboardOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
  const dashboardY = useTransform(scrollYProgress, [0.5, 1], [40, 0]);

  // ── Data queries ──
  const { data: latestMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ["dailyTotals"],
    queryFn: async () => {
      const response = await healthMetricsAPI.getDailyTotals();
      return response.data.data;
    },
    refetchInterval: 60000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const response = await alertsAPI.getAll({ limit: 5 });
      return response.data.data;
    },
  });

  const { data: metricHistory } = useQuery({
    queryKey: ["metricHistory", selectedMetric],
    queryFn: async () => {
      if (!selectedMetric) return null;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const response = await healthMetricsAPI.getAll({
        metricType: selectedMetric,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return response.data.data;
    },
    enabled: !!selectedMetric,
  });

  // ── Simulator ──
  const generateHeartRate = () => 65 + Math.floor(Math.random() * 25);
  const generateSpO2 = () => 96 + Math.floor(Math.random() * 4);
  const generateBP = () => ({
    systolic: 115 + Math.floor(Math.random() * 15),
    diastolic: 70 + Math.floor(Math.random() * 15),
  });

  useEffect(() => {
    let interval = null;
    const updateMetrics = async () => {
      const heartRate = generateHeartRate();
      const spo2 = generateSpO2();
      const bp = generateBP();
      const newSteps = Math.floor(Math.random() * 100) + 20;

      setSimulatorData((prev) => ({
        heartRate,
        steps: prev.steps + newSteps,
        spo2,
        bloodPressure: bp,
        lastUpdate: new Date(),
      }));

      try {
        const metrics = [
          {
            metricType: "heartRate",
            value: heartRate,
            unit: "bpm",
            source: "simulator",
          },
          {
            metricType: "oxygenSaturation",
            value: spo2,
            unit: "%",
            source: "simulator",
          },
          {
            metricType: "bloodPressure",
            value: bp,
            unit: "mmHg",
            source: "simulator",
          },
          {
            metricType: "steps",
            value: simulatorData.steps + newSteps,
            unit: "steps",
            source: "simulator",
          },
        ];
        for (const m of metrics) await healthMetricsAPI.create(m);
        refetchMetrics();
      } catch (error) {
        console.error("Error sending simulator data:", error);
      }
    };

    if (isSimulating) {
      updateMetrics();
      interval = setInterval(updateMetrics, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating]);

  const startSimulator = () => setIsSimulating(true);
  const stopSimulator = () => {
    setIsSimulating(false);
    setSimulatorData({
      heartRate: null,
      steps: 0,
      spo2: null,
      bloodPressure: null,
      lastUpdate: null,
    });
  };

  // ── Dock tab handler ──
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTimeout(() => {
      document
        .getElementById("patient-content")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ── Cycle theme ──
  const cycleTheme = () => {
    const themes = ["crimson", "medical", "midnight", "emerald"];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  // ── Metric tiles config ──
  const defaultMetricKeys = [
    "heartRate",
    "steps",
    "calories",
    "sleep",
    "oxygenSaturation",
    "distance",
    "bloodGlucose",
    "weight",
    "bloodPressure",
  ];
  const METRIC_ORDER_KEY = "medxi_metric_order";
  const [metricOrder, setMetricOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(METRIC_ORDER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate: must contain exactly the same keys
        if (
          Array.isArray(parsed) &&
          parsed.length === defaultMetricKeys.length &&
          defaultMetricKeys.every((k) => parsed.includes(k))
        ) {
          return parsed;
        }
      }
    } catch {}
    return defaultMetricKeys;
  });

  // After every drag, re-sort items by their grid position (y then x)
  // and re-assign sequential 3-col positions so there are never gaps.
  const handleMetricLayoutChange = useCallback((layout) => {
    if (!layout || layout.length === 0) return;
    const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    const newOrder = sorted.map((item) => item.i);
    setMetricOrder((prev) => {
      if (prev.join() === newOrder.join()) return prev;
      try {
        localStorage.setItem(METRIC_ORDER_KEY, JSON.stringify(newOrder));
      } catch {}
      return newOrder;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Left Sidebar Navigation (appears after scroll) ── */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        role="patient"
        onThemeToggle={cycleTheme}
        visible={pastHero}
      />

      {/* ── Splash Screen ── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-60 bg-[var(--bg-effect-1)]" />
              <div className="absolute bottom-1/3 right-1/4 w-[22rem] h-[22rem] rounded-full blur-3xl opacity-50 bg-[var(--bg-effect-2)]" />
              <div className="absolute top-2/3 left-1/2 w-[18rem] h-[18rem] rounded-full blur-3xl opacity-40 bg-[var(--bg-effect-3)]" />
            </div>

            {/* MEDXI Logo — snaps in half: MED goes up, XI goes down */}
            <div className="relative flex flex-col items-center">
              {/* Logo halves stacked */}
              <div className="relative flex flex-col items-center">
                {/* Top half: "MED" — slides up */}
                <motion.span
                  className="text-[clamp(5rem,18vw,14rem)] font-black tracking-tighter leading-none select-none text-primary"
                  initial={{ opacity: 0, scale: 0.85, y: 0 }}
                  animate={
                    splashPhase === "logo"
                      ? { opacity: 1, scale: 1, y: 0 }
                      : { opacity: 1, scale: 1, y: "-15vh" }
                  }
                  transition={
                    splashPhase === "logo"
                      ? { duration: 0.7, ease: "easeOut" }
                      : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  MED
                </motion.span>
                {/* Bottom half: "XI" — slides down */}
                <motion.span
                  className="text-[clamp(5rem,18vw,14rem)] font-black tracking-tighter leading-none select-none text-foreground -mt-[0.15em]"
                  initial={{ opacity: 0, scale: 0.85, y: 0 }}
                  animate={
                    splashPhase === "logo"
                      ? { opacity: 1, scale: 1, y: 0 }
                      : { opacity: 1, scale: 1, y: "15vh" }
                  }
                  transition={
                    splashPhase === "logo"
                      ? { duration: 0.7, ease: "easeOut" }
                      : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  XI
                </motion.span>
              </div>

              {/* Welcome text — rises into the gap between halves */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={
                  splashPhase === "line" || splashPhase === "done"
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 30, scale: 0.8 }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className="h-[2px] bg-gradient-to-r from-transparent to-foreground/40"
                    initial={{ width: 0 }}
                    animate={
                      splashPhase === "line" || splashPhase === "done"
                        ? { width: "6rem" }
                        : { width: 0 }
                    }
                    transition={{ duration: 0.5, delay: 0.5 }}
                  />
                  <p className="text-xl md:text-2xl text-foreground/70 font-medium tracking-wide whitespace-nowrap">
                    Welcome back, {firstName}
                  </p>
                  <motion.div
                    className="h-[2px] bg-gradient-to-l from-transparent to-foreground/40"
                    initial={{ width: 0 }}
                    animate={
                      splashPhase === "line" || splashPhase === "done"
                        ? { width: "6rem" }
                        : { width: 0 }
                    }
                    transition={{ duration: 0.5, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full Hero ── */}
      <div
        ref={heroRef}
        className="h-screen"
        style={{ scrollSnapAlign: "start" }}
      >
        <PatientHero userName={firstName} heroRef={heroRef} />
      </div>

      {/* ── Main Dashboard Content ── */}
      <motion.div
        id="patient-content"
        className={cn(
          "relative z-10 min-h-screen pb-16 transition-[margin] duration-300",
          pastHero ? "ml-[72px]" : "ml-0",
        )}
        style={{
          opacity: dashboardOpacity,
          y: dashboardY,
          scrollSnapAlign: "start",
        }}
      >
        {/* Animated path lines behind dashboard */}
        <BackgroundPaths className="opacity-30 fixed inset-0 z-0 pointer-events-none" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-[1]">
          {/* Header actions */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {activeTab === "overview" && "Health Overview"}
                {activeTab === "activity" && "Activity"}
                {activeTab === "appointments" && "Appointments"}
                {activeTab === "messages" && "Messages"}
                {activeTab === "wearables" && "Wearable Devices"}
              </h2>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Track Data
            </Button>
          </div>

          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
            <div>
              <AlertsSection
                alertsData={alertsData}
                onViewAllAlerts={() => navigate("/alerts")}
                theme={theme}
              />

              {/* Draggable Metric Tiles — react-grid-layout */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Metrics</CardTitle>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <DraggableGrid
                    cols={{ lg: 3, md: 3, sm: 2, xs: 1 }}
                    rowHeight={120}
                    compactType="vertical"
                    isResizable={false}
                    persistLayout={false}
                    onDragStart={() => {
                      isDragging.current = true;
                    }}
                    onDragStop={() => {
                      setTimeout(() => {
                        isDragging.current = false;
                      }, 200);
                    }}
                    onLayoutChange={handleMetricLayoutChange}
                  >
                    {metricOrder.map((key, i) => (
                      <div
                        key={key}
                        data-grid={{
                          x: i % 3,
                          y: Math.floor(i / 3),
                          w: 1,
                          h: 1,
                          minW: 1,
                          maxW: 1,
                          minH: 1,
                          maxH: 1,
                        }}
                      >
                        <div className="h-full cursor-grab active:cursor-grabbing">
                          <FitMetricTile
                            metricType={key}
                            value={latestMetrics?.[key]?.value}
                            onClick={() => {
                              if (!isDragging.current) setSelectedMetric(key);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </DraggableGrid>
                </CardContent>
              </Card>

              {/* Weekly Activity Overview */}
              <div className="mt-6">
                <ActivityOverview />
              </div>

              {/* Insights + Recipes side by side */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PatientInsights className="overflow-hidden max-h-[600px]" />
                <RecipesWidget className="overflow-hidden max-h-[600px]" />
              </div>
            </div>
          )}

          {/* ── Activity Tab ── */}
          {activeTab === "activity" && (
            <div className="space-y-8">
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Metric Tiles
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {defaultMetricKeys.map((key) => (
                    <FitMetricTile
                      key={key}
                      metricType={key}
                      value={latestMetrics?.[key]?.value}
                      onClick={() => setSelectedMetric(key)}
                    />
                  ))}
                </div>
              </section>

              <ActivityOverview />
              <PatientInsights />
            </div>
          )}

          {/* ── Appointments Tab ── */}
          {activeTab === "appointments" && (
            <div className="text-center py-16">
              <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Appointments</h3>
              <p className="text-muted-foreground mb-6">
                Manage your upcoming and past appointments
              </p>
              <Button onClick={() => navigate("/appointments")}>
                Go to Appointments
              </Button>
            </div>
          )}

          {/* ── Messages Tab ── */}
          {activeTab === "messages" && (
            <div className="text-center py-16">
              <MessageSquareText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Messages</h3>
              <p className="text-muted-foreground mb-6">
                Chat with your healthcare provider
              </p>
              <Button onClick={() => navigate("/messages")}>
                Go to Messages
              </Button>
            </div>
          )}

          {/* ── Wearables Tab ── */}
          {activeTab === "wearables" && (
            <div className="space-y-6">
              <GoogleFitConnect />
              <WearableDevices
                isSimulating={isSimulating}
                simulatorData={simulatorData}
                onStartSimulator={startSimulator}
                onStopSimulator={stopSimulator}
              />
            </div>
          )}
        </main>
      </motion.div>

      {/* ── Metric Detail Modal ── */}
      <MetricDetailModal
        metricType={selectedMetric}
        value={latestMetrics?.[selectedMetric]?.value}
        metricHistory={metricHistory}
        isOpen={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
        onMetricAdded={refetchMetrics}
      />

      {/* ── Floating XI AI Button (appears after scroll) ── */}
      <FloatingAIButton
        visible={pastHero}
        onClick={() => setShowChatbot(true)}
      />

      {/* ── Modals ── */}
      <AddMetricModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refetchMetrics}
      />

      <ChatbotWidget
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
      />
    </div>
  );
};

export default PatientDashboard;
