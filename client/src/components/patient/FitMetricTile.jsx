import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import MetricRing from "@/components/dashboard/MetricRing";
import { cn } from "@/lib/utils";
import {
  Heart,
  Footprints,
  Flame,
  Moon,
  Droplets,
  Wind,
  Ruler,
  Weight,
} from "lucide-react";

const METRIC_CONFIG = {
  heartRate: {
    label: "Heart Rate",
    unit: "bpm",
    icon: Heart,
    color: "hsl(0, 80%, 55%)",
    goal: null,
    format: (v) => Math.round(v),
  },
  steps: {
    label: "Steps",
    unit: "steps",
    icon: Footprints,
    color: "hsl(217, 91%, 60%)",
    goal: 10000,
    format: (v) => v?.toLocaleString?.() ?? v,
  },
  calories: {
    label: "Calories",
    unit: "kcal",
    icon: Flame,
    color: "hsl(25, 95%, 53%)",
    goal: 2000,
    format: (v) => Math.round(v)?.toLocaleString?.(),
  },
  sleep: {
    label: "Sleep",
    unit: "hrs",
    icon: Moon,
    color: "hsl(263, 70%, 58%)",
    goal: 8,
    format: (v) => Number(v).toFixed(1),
  },
  bloodPressure: {
    label: "Blood Pressure",
    unit: "mmHg",
    icon: Droplets,
    color: "hsl(340, 82%, 52%)",
    goal: null,
    format: (v) => (typeof v === "object" ? `${v.systolic}/${v.diastolic}` : v),
  },
  oxygenSaturation: {
    label: "SpO2",
    unit: "%",
    icon: Wind,
    color: "hsl(172, 66%, 50%)",
    goal: null,
    format: (v) => Math.round(v),
  },
  distance: {
    label: "Distance",
    unit: "km",
    icon: Ruler,
    color: "hsl(142, 71%, 45%)",
    goal: 5,
    format: (v) => Number(v).toFixed(1),
  },
  bloodGlucose: {
    label: "Blood Glucose",
    unit: "mg/dL",
    icon: Droplets,
    color: "hsl(48, 96%, 53%)",
    goal: null,
    format: (v) => Math.round(v),
  },
  weight: {
    label: "Weight",
    unit: "kg",
    icon: Weight,
    color: "hsl(200, 65%, 50%)",
    goal: null,
    format: (v) => Number(v).toFixed(1),
  },
};

/**
 * A single Google-Fit-style metric tile with a ring + big number.
 */
export default function FitMetricTile({
  metricType,
  value,
  className,
  onClick,
}) {
  const config = METRIC_CONFIG[metricType] || {
    label: metricType,
    unit: "",
    icon: Heart,
    color: "hsl(var(--primary))",
    goal: null,
    format: (v) => v,
  };

  const Icon = config.icon;
  const displayValue = value != null ? config.format(value) : "--";

  // Calculate progress towards goal for the ring
  const numericValue =
    typeof value === "object" ? (value?.systolic ?? 0) : Number(value) || 0;
  const progress = config.goal ? Math.min(numericValue / config.goal, 1) : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={onClick}
      className={cn("cursor-pointer", className)}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardContent className="p-5 flex items-center gap-4">
          {/* Ring (only show if goal exists) */}
          {config.goal ? (
            <MetricRing
              progress={progress}
              size={64}
              strokeWidth={7}
              ringColor={config.color}
              className="shrink-0"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="h-6 w-6" style={{ color: config.color }} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {config.label}
            </p>
            <p className="text-2xl font-bold text-foreground leading-tight">
              {displayValue}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {config.unit}
              </span>
            </p>
            {config.goal && value != null && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {Math.round((numericValue / config.goal) * 100)}% of{" "}
                {config.goal.toLocaleString()} goal
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export { METRIC_CONFIG };
