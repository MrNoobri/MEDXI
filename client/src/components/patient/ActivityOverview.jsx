import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { healthMetricsAPI } from "@/api";
import WeeklyBarChart from "./WeeklyBarChart";
import { cn } from "@/lib/utils";
import { Footprints, Heart, Flame, Moon, Droplets, Ruler } from "lucide-react";

const ACTIVITY_TABS = [
  {
    key: "steps",
    label: "Steps",
    icon: Footprints,
    unit: "steps",
    goal: 10000,
  },
  {
    key: "heartRate",
    label: "Heart Rate",
    icon: Heart,
    unit: "bpm",
    goal: null,
  },
  { key: "calories", label: "Calories", icon: Flame, unit: "kcal", goal: 2000 },
  { key: "sleep", label: "Sleep", icon: Moon, unit: "hrs", goal: 8 },
  { key: "distance", label: "Distance", icon: Ruler, unit: "km", goal: 5 },
  {
    key: "oxygenSaturation",
    label: "SpO2",
    icon: Droplets,
    unit: "%",
    goal: null,
  },
];

const TIMEFRAMES = [
  { key: "day", label: "Day", days: 1 },
  { key: "week", label: "Week", days: 7 },
  { key: "month", label: "Month", days: 30 },
];

export default function ActivityOverview({ className }) {
  const [activeMetric, setActiveMetric] = useState("steps");
  const [timeframe, setTimeframe] = useState("week");

  const tab = ACTIVITY_TABS.find((t) => t.key === activeMetric);
  const tf = TIMEFRAMES.find((t) => t.key === timeframe);

  // Fetch data for the active metric & timeframe
  const { data: activityData, isLoading } = useQuery({
    queryKey: ["activityData", activeMetric, timeframe],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - tf.days);

      const res = await healthMetricsAPI.getAll({
        metricType: activeMetric,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 2000,
      });
      return res.data.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const timeframeLabel = useMemo(() => {
    if (timeframe === "day") return "Today";
    if (timeframe === "week") return "This Week";
    return "This Month";
  }, [timeframe]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">My Activity</CardTitle>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            {TIMEFRAMES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeframe(t.key)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  timeframe === t.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tab pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
          {ACTIVITY_TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === activeMetric;
            return (
              <Button
                key={t.key}
                variant="ghost"
                size="sm"
                onClick={() => setActiveMetric(t.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap gap-1.5 shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </Button>
            );
          })}
        </div>

        {/* Chart */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeMetric}-${timeframe}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <div className="h-[220px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <WeeklyBarChart
                data={activityData || []}
                metricType={activeMetric}
                goal={tab?.goal}
                unit={tab?.unit || ""}
                color="hsl(var(--primary))"
                timeframe={timeframe}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
