import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/common/Navbar";
import MetricCard from "../components/health/MetricCard";
import AddMetricModal from "../components/health/AddMetricModal";
import MetricChart from "../components/health/MetricChart";
import ChatbotWidget from "../components/chatbot/ChatbotWidget";
import ChatbotButton from "../components/chatbot/ChatbotButton";
import InsightsWidget from "../components/dashboard/InsightsWidget";
import RecipesWidget from "../components/dashboard/RecipesWidget";
import StatTile from "../components/dashboard/StatTile";
import WearableDevices from "../components/wearables/WearableDevices";
import GoogleFitConnect from "../components/GoogleFitConnect";
import { healthMetricsAPI, alertsAPI } from "../api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const METRIC_LABELS = {
  heartRate: "Heart Rate",
  bloodPressure: "Blood Pressure",
  oxygenSaturation: "Oxygen Level",
  steps: "Steps",
  sleep: "Sleep",
  bloodGlucose: "Blood Glucose",
};

const AlertsSection = ({ alertsData, onViewAllAlerts, theme }) => {
  if (!alertsData || alertsData.length === 0) return null;

  const severityRank = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  const highestSeverityAlert = alertsData.reduce((acc, current) => {
    if (!acc) return current;
    const currentRank = severityRank[current?.severity] || 0;
    const accRank = severityRank[acc?.severity] || 0;
    return currentRank > accRank ? current : acc;
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

const HealthMetricsSection = ({
  latestMetrics,
  formatValue,
  getMetricStatus,
  metricIcons,
  onSelectMetric,
}) => (
  <div className="mb-8">
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-foreground">
          Your Health Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(METRIC_LABELS).map(([key, label]) => {
            const metric = latestMetrics?.[key];
            return (
              <MetricCard
                key={key}
                title={label}
                value={metric ? formatValue(key, metric.value) : null}
                unit={metric?.unit}
                status={metric ? getMetricStatus(key, metric.value) : undefined}
                icon={metricIcons[key]}
                onClick={() => onSelectMetric(key)}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  </div>
);

const SnapshotSection = ({ latestMetrics }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold text-foreground mb-4">
      Today's Snapshot
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatTile
        title="Heart Rate"
        value={
          latestMetrics?.heartRate?.value
            ? `${Math.round(latestMetrics.heartRate.value)} bpm`
            : "--"
        }
        subtext="Latest reading"
        icon={Activity}
      />
      <StatTile
        title="Oxygen"
        value={
          latestMetrics?.oxygenSaturation?.value
            ? `${Math.round(latestMetrics.oxygenSaturation.value)}%`
            : "--"
        }
        subtext="Latest reading"
        icon={Sparkles}
      />
      <StatTile
        title="Steps"
        value={
          latestMetrics?.steps?.value ? `${latestMetrics.steps.value}` : "0"
        }
        subtext="Today"
        icon={CalendarDays}
      />
    </div>
  </div>
);

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

const QuickActionsSection = ({
  onAppointments,
  onMessages,
  onOpenAssistant,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          Book or manage your appointments
        </p>
        <Button className="w-full" onClick={onAppointments}>
          View Appointments
        </Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-primary" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          Chat with your healthcare provider
        </p>
        <Button className="w-full" onClick={onMessages}>
          View Messages
        </Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          Get instant health guidance
        </p>
        <Button className="w-full" onClick={onOpenAssistant}>
          Ask MEDXI AI
        </Button>
      </CardContent>
    </Card>
  </div>
);

const PatientDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatorData, setSimulatorData] = useState({
    heartRate: null,
    steps: 0,
    spo2: null,
    bloodPressure: null,
    lastUpdate: null,
  });

  // Fetch latest metrics
  const { data: latestMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ["latestMetrics"],
    queryFn: async () => {
      const response = await healthMetricsAPI.getLatest();
      return response.data.data;
    },
  });

  // Fetch alerts
  const { data: alertsData } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const response = await alertsAPI.getAll({ limit: 5 });
      return response.data.data;
    },
  });

  // Fetch metric history when a metric is selected
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

  const getMetricStatus = (metricType, value) => {
    const thresholds = {
      heartRate: { min: 60, max: 100 },
      bloodGlucose: { min: 70, max: 140 },
      oxygenSaturation: { min: 95, max: 100 },
    };

    if (!thresholds[metricType]) return "normal";

    const numValue = typeof value === "object" ? value.systolic : value;
    const { min, max } = thresholds[metricType];

    if (numValue < min * 0.8 || numValue > max * 1.2) return "critical";
    if (numValue < min || numValue > max) return "warning";
    return "normal";
  };

  const formatValue = (metricType, value) => {
    if (metricType === "bloodPressure" && typeof value === "object") {
      return `${value.systolic}/${value.diastolic}`;
    }
    return value?.toFixed?.(1) || value;
  };

  const metricIcons = {
    heartRate: "❤️",
    bloodPressure: "🩸",
    bloodGlucose: "🍬",
    oxygenSaturation: "💨",
    steps: "👣",
    sleep: "😴",
    calories: "🔥",
    waterIntake: "💧",
  };

  // Simulator functions
  const generateHeartRate = () => 65 + Math.floor(Math.random() * 25);
  const generateSpO2 = () => 96 + Math.floor(Math.random() * 4);
  const generateBP = () => ({
    systolic: 115 + Math.floor(Math.random() * 15),
    diastolic: 70 + Math.floor(Math.random() * 15),
  });

  React.useEffect(() => {
    let simulatorInterval = null;

    const updateMetrics = async () => {
      const heartRate = generateHeartRate();
      const spo2 = generateSpO2();
      const bp = generateBP();
      const newSteps = Math.floor(Math.random() * 100) + 20;

      // Update UI
      setSimulatorData((prev) => ({
        heartRate,
        steps: prev.steps + newSteps,
        spo2,
        bloodPressure: bp,
        lastUpdate: new Date(),
      }));

      // Send data to backend and refetch metrics
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

        for (const metric of metrics) {
          await healthMetricsAPI.create(metric);
        }

        // Refetch the latest metrics to update the dashboard
        refetchMetrics();
      } catch (error) {
        console.error("Error sending simulator data:", error);
      }
    };

    if (isSimulating) {
      // Initial update
      updateMetrics();
      // Update every 30 seconds
      simulatorInterval = setInterval(updateMetrics, 30000);
    }

    return () => {
      if (simulatorInterval) {
        clearInterval(simulatorInterval);
      }
    };
  }, [isSimulating]);

  const startSimulator = () => {
    setIsSimulating(true);
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.profile?.firstName}!
            </h2>
            <p className="text-muted-foreground mt-1">
              Here's your health overview
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            + Track Health Data
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex gap-2 sm:gap-4 p-1 rounded-xl theme-tab-surface">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-all",
                activeTab === "overview"
                  ? "bg-primary/15 text-primary border-primary/25 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
              )}
            >
              📊 Overview
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("wearables")}
              className={cn(
                "rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-all",
                activeTab === "wearables"
                  ? "bg-primary/15 text-primary border-primary/25 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
              )}
            >
              ⌚ Wearable Devices
            </Button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div>
            <AlertsSection
              alertsData={alertsData}
              onViewAllAlerts={() => navigate("/alerts")}
              theme={theme}
            />

            <HealthMetricsSection
              latestMetrics={latestMetrics}
              formatValue={formatValue}
              getMetricStatus={getMetricStatus}
              metricIcons={metricIcons}
              onSelectMetric={setSelectedMetric}
            />

            <SnapshotSection latestMetrics={latestMetrics} />

            <ChartSection
              selectedMetric={selectedMetric}
              metricHistory={metricHistory}
              onClose={() => setSelectedMetric(null)}
            />

            <QuickActionsSection
              onAppointments={() => navigate("/appointments")}
              onMessages={() => navigate("/messages")}
              onOpenAssistant={() => setShowChatbot(true)}
            />

            {/* Insights and Recipes Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InsightsWidget />
              <RecipesWidget />
            </div>
          </div>
        )}

        {/* Wearables Tab */}
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
      </div>

      <AddMetricModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refetchMetrics}
      />

      <ChatbotButton onClick={() => setShowChatbot(true)} />
      <ChatbotWidget
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
      />
    </div>
  );
};

export default PatientDashboard;
