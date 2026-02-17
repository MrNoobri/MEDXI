import React from "react";
import { useQuery } from "@tanstack/react-query";
import { healthMetricsAPI } from "../../api";

const InsightsWidget = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["healthStats"],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await healthMetricsAPI.getStats({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return response.data.data;
    },
    retry: 1,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Health Insights
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  // Show error or default insights
  if (error || !stats) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Health Insights
        </h3>
        <div className="space-y-3">
          <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📊</span>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Start tracking</h4>
                <p className="text-xs opacity-90">
                  Add more health data to receive personalized insights!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const generateInsights = () => {
    if (!stats) return [];

    const insights = [];

    // Heart Rate Insights
    if (stats.heartRate?.avg) {
      const avgHR = stats.heartRate.avg;
      if (avgHR >= 60 && avgHR <= 100) {
        insights.push({
          icon: "❤️",
          title: "Great heart rate!",
          message: `Your average heart rate is ${avgHR.toFixed(0)} bpm - within normal range.`,
          type: "success",
        });
      } else if (avgHR > 100) {
        insights.push({
          icon: "⚠️",
          title: "Elevated heart rate",
          message: `Your average heart rate is ${avgHR.toFixed(0)} bpm. Consider stress management techniques.`,
          type: "warning",
        });
      }
    }

    // Steps Insights
    if (stats.steps?.avg) {
      const avgSteps = stats.steps.avg;
      if (avgSteps >= 8000) {
        insights.push({
          icon: "👣",
          title: "You're crushing it!",
          message: `${Math.round(avgSteps)} steps daily - that's ${((avgSteps / 10000) * 100).toFixed(0)}% of your 10K goal!`,
          type: "success",
        });
      } else if (avgSteps < 5000) {
        insights.push({
          icon: "💡",
          title: "Time to move more",
          message:
            "Try adding a 15-minute walk to your daily routine to boost your steps.",
          type: "info",
        });
      }
    }

    // Sleep Insights
    if (stats.sleep?.avg) {
      const avgSleep = stats.sleep.avg;
      if (avgSleep < 6) {
        insights.push({
          icon: "😴",
          title: "Need more sleep",
          message: `You're averaging ${avgSleep.toFixed(1)} hours. Aim for 7-9 hours for optimal health.`,
          type: "warning",
        });
      } else if (avgSleep >= 7 && avgSleep <= 9) {
        insights.push({
          icon: "🌙",
          title: "Sleep schedule on point",
          message: `${avgSleep.toFixed(1)} hours - perfect for recovery and health!`,
          type: "success",
        });
      }
    }

    // Blood Pressure Insights
    if (stats.bloodPressure?.avg) {
      const systolic = stats.bloodPressure.avg.systolic;
      if (systolic >= 120 && systolic < 140) {
        insights.push({
          icon: "🩸",
          title: "Monitor blood pressure",
          message:
            "Your BP is elevated. Consider reducing sodium and increasing exercise.",
          type: "warning",
        });
      }
    }

    // Default insight if none generated
    if (insights.length === 0) {
      insights.push({
        icon: "📊",
        title: "Start tracking",
        message: "Add more health data to receive personalized insights!",
        type: "info",
      });
    }

    return insights.slice(0, 3);
  };

  const insights = generateInsights();

  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <span className="mr-2">💡</span>
        Health Insights
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${typeStyles[insight.type]}`}
          >
            <div className="flex items-start">
              <span className="text-2xl mr-3">{insight.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                <p className="text-xs opacity-90">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsWidget;
