import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import MetricCard from "../components/health/MetricCard";
import AddMetricModal from "../components/health/AddMetricModal";
import MetricChart from "../components/health/MetricChart";
import ChatbotWidget from "../components/chatbot/ChatbotWidget";
import ChatbotButton from "../components/chatbot/ChatbotButton";
import InsightsWidget from "../components/dashboard/InsightsWidget";
import RecipesWidget from "../components/dashboard/RecipesWidget";
import WearableDevices from "../components/wearables/WearableDevices";
import GoogleFitConnect from "../components/GoogleFitConnect";
import GamificationWidget from "../components/gamification/GamificationWidget";
import ActionCard from "../components/dashboard/ActionCard";
import { healthMetricsAPI, alertsAPI } from "../api";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [chartRange, setChartRange] = useState("7d");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Simulator state
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
    refetchInterval: 120000, // Auto-refresh every 2 minutes
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
    queryKey: ["metricHistory", selectedMetric, chartRange],
    queryFn: async () => {
      if (!selectedMetric) return null;
      const endDate = new Date();
      const startDate = new Date();

      if (chartRange === "1d") startDate.setDate(startDate.getDate() - 1);
      else if (chartRange === "30d") startDate.setDate(startDate.getDate() - 30);
      else startDate.setDate(startDate.getDate() - 7); // Default 7d

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
      heartRate: { min: 40, max: 140, criticalMin: 35, criticalMax: 180 },
      bloodGlucose: { min: 70, max: 140, criticalMin: 55, criticalMax: 200 },
      oxygenSaturation: {
        min: 92,
        max: 100,
        criticalMin: 85,
        criticalMax: 100,
      },
      bloodPressure: {
        systolicMax: 140,
        diastolicMax: 90,
        systolicCritical: 180,
        diastolicCritical: 120,
      },
      steps: { min: 0, max: 50000, criticalMin: 0, criticalMax: 100000 }, // Daily steps
      sleep: { min: 4, max: 12, criticalMin: 2, criticalMax: 16 }, // Hours per night
    };

    if (!thresholds[metricType]) return "normal";

    // Handle blood pressure separately
    if (metricType === "bloodPressure" && typeof value === "object") {
      const { systolic, diastolic } = value;
      const bp = thresholds.bloodPressure;
      if (systolic >= bp.systolicCritical || diastolic >= bp.diastolicCritical)
        return "critical";
      if (systolic >= bp.systolicMax || diastolic >= bp.diastolicMax)
        return "warning";
      return "normal";
    }

    const numValue = typeof value === "object" ? value.systolic : value;
    const { min, max, criticalMin, criticalMax } = thresholds[metricType];

    if (numValue < criticalMin || numValue > criticalMax) return "critical";
    if (numValue < min || numValue > max) return "warning";
    return "normal";
  };

  const formatValue = (metricType, value) => {
    if (metricType === "bloodPressure" && typeof value === "object") {
      return `${value.systolic}/${value.diastolic}`;
    }
    if (metricType === "distance") {
      return value?.toFixed?.(2) || value;
    }
    if (metricType === "weight") {
      return value?.toFixed?.(1) || value;
    }
    if (metricType === "steps" || metricType === "calories") {
      return Math.round(value) || value;
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
    distance: "🏃",
    weight: "⚖️",
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
            value: bp, // This is an object { systolic, diastolic }
            unit: "mmHg",
            source: "simulator",
          },
          {
            metricType: "steps",
            value: newSteps, // Increment only
            unit: "steps",
            source: "simulator",
          },
        ];

        // Process metrics sequentially to avoid flooding
        for (const metric of metrics) {
          try {
            // Ensure value is valid
            if (!metric.value) continue;
            await healthMetricsAPI.create(metric);
          } catch (err) {
            console.error(`Failed to simulate ${metric.metricType}:`, err);
          }
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

  const metricLabels = {
    heartRate: "Heart Rate",
    bloodPressure: "Blood Pressure",
    oxygenSaturation: "Oxygen Level",
    steps: "Steps",
    sleep: "Sleep",
    bloodGlucose: "Blood Glucose",
    calories: "Calories",
    distance: "Distance",
    weight: "Weight",
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 animate-fade-in-up">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Hello, {user?.profile?.firstName}!
            </h2>
            <p className="text-slate-500 mt-1">Here's your daily health overview.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            + Track Health Data
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`${activeTab === "overview"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab("wearables")}
              className={`${activeTab === "wearables"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              ⌚ Wearable Devices
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Alerts Section */}
            {alertsData && alertsData.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600">
                        ⚠️
                      </span>
                      <p className="font-semibold text-amber-800">
                        You have {alertsData.length} active alert{alertsData.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className="text-sm text-amber-700 mt-1 ml-8">
                      {alertsData[0]?.message}
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/alerts'}
                    className="ml-4 px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
            )}

            {/* Health Metrics Grid */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Your Health Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(metricLabels).map(([key, label]) => {
                  const metric = latestMetrics?.[key];
                  return (
                    <MetricCard
                      key={key}
                      title={label}
                      value={metric ? formatValue(key, metric.value) : null}
                      unit={metric?.unit}
                      status={
                        metric ? getMetricStatus(key, metric.value) : undefined
                      }
                      icon={metricIcons[key]}
                      onClick={() => setSelectedMetric(key)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Chart Section */}
            {selectedMetric && (
              <div className="animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {metricLabels[selectedMetric]} Analysis
                  </h3>
                  <button
                    onClick={() => setSelectedMetric(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ✕ Close Chart
                  </button>
                </div>
                <MetricChart
                  data={metricHistory}
                  metricType={selectedMetric}
                  onRangeChange={setChartRange}
                />
              </div>
            )}

            {/* Quick Actions & Gamification Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard
                  title="Appointments"
                  description="Book or manage your appointments"
                  icon="📅"
                  buttonText="View Appointments"
                  onClick={() => console.log("Navigate to Appointments")}
                />

                <ActionCard
                  title="Messages"
                  description="Chat with your healthcare provider"
                  icon="💬"
                  buttonText="View Messages"
                  onClick={() => console.log("Navigate to Messages")}
                  variant="secondary"
                />

                <ActionCard
                  title="AI Assistant"
                  description="Get instant health guidance"
                  icon="🤖"
                  buttonText="Ask MEDXI AI"
                  onClick={() => setShowChatbot(true)}
                  variant="accent"
                />
              </div>

              {/* Gamification Widget */}
              <div className="lg:col-span-1">
                <GamificationWidget />
              </div>
            </div>

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
            <GoogleFitConnect onSyncComplete={refetchMetrics} />
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
