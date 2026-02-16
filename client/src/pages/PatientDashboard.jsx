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
import { healthMetricsAPI, alertsAPI } from "../api";

const PatientDashboard = () => {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.profile?.firstName}!
            </h2>
            <p className="text-gray-600 mt-1">Here's your health overview</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            + Track Health Data
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`${
                activeTab === "overview"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab("wearables")}
              className={`${
                activeTab === "wearables"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              ⌚ Wearable Devices
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div>
            {/* Alerts Section */}
            {alertsData && alertsData.length > 0 && (
              <div className="mb-6">
                <div className="bg-warning-100 border-l-4 border-warning-500 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="font-semibold text-warning-800">
                          You have {alertsData.length} active alert{alertsData.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 ml-7">
                        {alertsData[0]?.message}
                      </p>
                    </div>
                    <button className="ml-4 px-4 py-2 bg-white border border-warning-300 text-warning-700 rounded-lg hover:bg-warning-50 transition-colors text-sm font-medium">
                      View All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Health Metrics Grid */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Your Health Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries({
                  heartRate: "Heart Rate",
                  bloodPressure: "Blood Pressure",
                  oxygenSaturation: "Oxygen Level",
                  steps: "Steps",
                  sleep: "Sleep",
                  bloodGlucose: "Blood Glucose",
                  calories: "Calories",
                  distance: "Distance",
                  weight: "Weight",
                }).map(([key, label]) => {
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
            {selectedMetric && metricHistory && metricHistory.length > 0 && (
              <div className="mb-8">
                <div className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedMetric.replace(/([A-Z])/g, " $1").trim()} - Last
                      7 Days
                    </h3>
                    <button
                      onClick={() => setSelectedMetric(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                  <MetricChart
                    data={metricHistory}
                    metricType={selectedMetric}
                  />
                </div>
              </div>
            )}

            {/* Quick Actions & Gamification Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold mb-2">
                    📅 Appointments
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Book or manage your appointments
                  </p>
                  <button className="btn btn-primary w-full">
                    View Appointments
                  </button>
                </div>

                <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold mb-2">💬 Messages</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Chat with your healthcare provider
                  </p>
                  <button className="btn btn-primary w-full">
                    View Messages
                  </button>
                </div>

                <div
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setShowChatbot(true)}
                >
                  <h3 className="text-lg font-semibold mb-2">
                    🤖 AI Assistant
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Get instant health guidance
                  </p>
                  <button className="btn btn-primary w-full">
                    Ask MEDXI AI
                  </button>
                </div>
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
