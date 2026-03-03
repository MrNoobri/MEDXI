import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Footprints,
  Moon,
  Flame,
  Droplets,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthMetricsAPI } from "@/api";
import { cn } from "@/lib/utils";

const METRIC_INSIGHTS = [
  {
    key: "heartRate",
    label: "Heart Rate",
    icon: Heart,
    unit: "bpm",
    ranges: { low: 60, high: 100 },
    lowMsg: "Your resting heart rate is below average. If you feel faint, consult your doctor.",
    normalMsg: "Your heart rate is in a healthy range. Keep it up!",
    highMsg: "Your heart rate is elevated. Consider stress-relief techniques or consult your provider.",
    tip: "Regular cardio exercise can help maintain a resting heart rate between 60–80 bpm.",
  },
  {
    key: "steps",
    label: "Daily Steps",
    icon: Footprints,
    unit: "steps",
    ranges: { low: 5000, high: 15000 },
    lowMsg: "You're below 5k steps. Try a 15-minute walk after meals to boost activity.",
    normalMsg: "Great activity levels! You're on track for your step goals.",
    highMsg: "Outstanding! You're exceeding step targets—stay hydrated.",
    tip: "The CDC recommends at least 7,000–10,000 steps per day for adults.",
  },
  {
    key: "sleep",
    label: "Sleep",
    icon: Moon,
    unit: "hours",
    ranges: { low: 6, high: 9 },
    lowMsg: "You're not getting enough sleep. Aim for 7–9 hours per night.",
    normalMsg: "Your sleep is within the recommended range—good job!",
    highMsg: "Oversleeping can affect energy levels. Try consistent wake times.",
    tip: "Limit screen time 1 hour before bed for better sleep quality.",
  },
  {
    key: "calories",
    label: "Calories Burned",
    icon: Flame,
    unit: "kcal",
    ranges: { low: 1500, high: 3000 },
    lowMsg: "Low calorie burn today. A short walk or stretching can help.",
    normalMsg: "Solid calorie expenditure—keep moving!",
    highMsg: "High calorie burn—make sure to refuel and recover properly.",
    tip: "Mix cardio and strength training for optimal metabolic health.",
  },
  {
    key: "oxygenSaturation",
    label: "SpO2",
    icon: Droplets,
    unit: "%",
    ranges: { low: 95, high: 100 },
    lowMsg: "Your oxygen level is below 95%. Please consult your healthcare provider.",
    normalMsg: "Blood oxygen looks great!",
    highMsg: "Excellent oxygen saturation levels.",
    tip: "Deep breathing exercises can support healthy oxygen levels.",
  },
];

function getInsightForMetric(config, avg) {
  if (avg == null) return null;

  let status, message, trend;
  if (avg < config.ranges.low) {
    status = "warning";
    message = config.lowMsg;
    trend = "low";
  } else if (avg > config.ranges.high) {
    status = avg > config.ranges.high * 1.2 ? "warning" : "success";
    message = config.highMsg;
    trend = "high";
  } else {
    status = "success";
    message = config.normalMsg;
    trend = "normal";
  }

  return {
    key: config.key,
    label: config.label,
    icon: config.icon,
    avg: Math.round(avg * 10) / 10,
    unit: config.unit,
    status,
    message,
    trend,
    tip: config.tip,
  };
}

const statusStyles = {
  success:
    "border-emerald-200 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/50",
  warning:
    "border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/50",
  info: "border-blue-200 bg-blue-50/80 dark:border-blue-800 dark:bg-blue-950/50",
};

const trendIcons = {
  low: TrendingDown,
  normal: Minus,
  high: TrendingUp,
};

export default function PatientInsights({ latestMetrics, className }) {
  // Fetch 30 day stats for each metric that has data
  const metricsToCheck = ["heartRate", "steps", "sleep", "calories", "oxygenSaturation"];

  const { data: statsMap } = useQuery({
    queryKey: ["patientInsightsStats"],
    queryFn: async () => {
      const results = {};
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      for (const metricType of metricsToCheck) {
        try {
          const res = await healthMetricsAPI.getAll({
            metricType,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            limit: 500,
          });
          const metrics = res.data.data || [];
          if (metrics.length > 0) {
            const values = metrics
              .map((m) =>
                typeof m.value === "object" ? m.value.systolic : Number(m.value)
              )
              .filter((v) => !isNaN(v));

            if (values.length > 0) {
              results[metricType] = {
                avg: values.reduce((a, b) => a + b, 0) / values.length,
                count: values.length,
                min: Math.min(...values),
                max: Math.max(...values),
              };
            }
          }
        } catch {
          // skip
        }
      }
      return results;
    },
    staleTime: 5 * 60 * 1000,
  });

  const insights = useMemo(() => {
    if (!statsMap) return [];
    return METRIC_INSIGHTS.map((config) => {
      const stat = statsMap[config.key];
      if (!stat) return null;
      return getInsightForMetric(config, stat.avg);
    }).filter(Boolean).slice(0, 3);
  }, [statsMap]);

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-primary" />
            Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Start tracking health data to receive personalized insights.</p>
            <p className="text-sm mt-1">
              Connect Google Fit or add manual readings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
          Health Insights
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            Based on last 30 days
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-y-auto flex-1 min-h-0">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          const TrendIcon = trendIcons[insight.trend];
          return (
            <motion.div
              key={insight.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "rounded-xl border p-4",
                statusStyles[insight.status]
              )}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-card p-2 shadow-sm shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {insight.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      avg {insight.avg} {insight.unit}
                    </span>
                    <TrendIcon className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
                  </div>
                  <p className="text-sm text-foreground/80 mt-1">
                    {insight.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 italic flex items-start gap-1">
                    <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                    {insight.tip}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
