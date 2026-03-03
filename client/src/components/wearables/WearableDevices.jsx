import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Footprints,
  Droplets,
  Wind,
  Activity,
  Zap,
  AlertTriangle,
  Play,
  Square,
  Radio,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { healthMetricsAPI } from "@/api";

/* ─── Demo data generator helpers ─── */
const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Occasionally produce critical values to demonstrate alerts
const generateDemoMetrics = () => {
  const isCritical = Math.random() < 0.15; // 15% chance of critical reading

  const heartRate = isCritical
    ? randomBetween(125, 155)
    : randomBetween(62, 95);

  const spo2 = isCritical ? randomBetween(86, 91) : randomBetween(95, 100);

  const systolic = isCritical
    ? randomBetween(162, 190)
    : randomBetween(110, 135);
  const diastolic = isCritical
    ? randomBetween(102, 120)
    : randomBetween(65, 85);

  const bloodGlucose = isCritical
    ? randomBetween(250, 350)
    : randomBetween(80, 140);

  return {
    heartRate,
    spo2,
    bloodPressure: { systolic, diastolic },
    bloodGlucose,
    steps: randomBetween(40, 200),
    calories: randomBetween(5, 30),
    isCritical,
  };
};

/* ─── Single Metric Live Card ─── */
const LiveMetricCard = ({
  icon: Icon,
  label,
  value,
  unit,
  color,
  isCritical,
  pulse,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      "relative rounded-2xl p-5 transition-all duration-300 overflow-hidden",
      isCritical
        ? "bg-destructive/8 ring-2 ring-destructive/40"
        : "bg-card shadow-md shadow-black/5",
    )}
  >
    {isCritical && (
      <motion.div
        className="absolute inset-0 rounded-2xl bg-destructive/5"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    )}
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            isCritical ? "bg-destructive/15" : "bg-primary/10",
          )}
        >
          <Icon
            className="w-[18px] h-[18px]"
            style={{ color: isCritical ? undefined : color }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {isCritical && (
          <AlertTriangle className="w-4 h-4 text-destructive ml-auto" />
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-3xl font-bold tabular-nums",
            isCritical ? "text-destructive" : "text-foreground",
          )}
        >
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {pulse && (
        <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
      )}
    </div>
  </motion.div>
);

/* ─── Main WearableDevices Component ─── */
const WearableDevices = ({
  isSimulating,
  simulatorData,
  onStartSimulator,
  onStopSimulator,
}) => {
  const [demoData, setDemoData] = useState(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [tickCount, setTickCount] = useState(0);
  const [criticalLog, setCriticalLog] = useState([]);
  const intervalRef = useRef(null);

  // Generate fresh demo data every 5s when simulating
  useEffect(() => {
    if (!isSimulating) {
      setDemoData(null);
      setTotalSteps(0);
      setTotalCalories(0);
      setTickCount(0);
      setCriticalLog([]);
      return;
    }

    const tick = () => {
      const metrics = generateDemoMetrics();
      setDemoData(metrics);
      setTotalSteps((prev) => prev + metrics.steps);
      setTotalCalories((prev) => prev + metrics.calories);
      setTickCount((prev) => prev + 1);

      if (metrics.isCritical) {
        setCriticalLog((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            hr: metrics.heartRate,
            spo2: metrics.spo2,
            bp: `${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic}`,
            glucose: metrics.bloodGlucose,
          },
          ...prev.slice(0, 4),
        ]);
      }

      // Push to server (best-effort)
      const serverMetrics = [
        {
          metricType: "heartRate",
          value: metrics.heartRate,
          unit: "bpm",
          source: "simulator",
        },
        {
          metricType: "oxygenSaturation",
          value: metrics.spo2,
          unit: "%",
          source: "simulator",
        },
        {
          metricType: "bloodPressure",
          value: metrics.bloodPressure,
          unit: "mmHg",
          source: "simulator",
        },
        {
          metricType: "bloodGlucose",
          value: metrics.bloodGlucose,
          unit: "mg/dL",
          source: "simulator",
        },
        {
          metricType: "steps",
          value: metrics.steps,
          unit: "steps",
          source: "simulator",
        },
        {
          metricType: "calories",
          value: metrics.calories,
          unit: "kcal",
          source: "simulator",
        },
      ];
      serverMetrics.forEach((m) => healthMetricsAPI.create(m).catch(() => {}));
    };

    tick();
    intervalRef.current = setInterval(tick, 5000);
    return () => clearInterval(intervalRef.current);
  }, [isSimulating]);

  return (
    <div className="space-y-6">
      {/* ─── Simulator Control Card ─── */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-primary/8 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center">
                <Radio className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Demo Wearable Simulator
                </h3>
                <p className="text-sm text-muted-foreground">
                  Streams real-time vitals including occasional critical
                  readings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                  isSimulating
                    ? "bg-emerald-500/15 text-emerald-600"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isSimulating ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                {isSimulating ? "Streaming" : "Offline"}
              </div>
              <Button
                size="sm"
                variant={isSimulating ? "destructive" : "default"}
                onClick={isSimulating ? onStopSimulator : onStartSimulator}
                className="gap-2 min-w-[120px]"
              >
                {isSimulating ? (
                  <>
                    <Square className="w-3.5 h-3.5" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Start Demo
                  </>
                )}
              </Button>
            </div>
          </div>

          {isSimulating && (
            <div className="px-6 py-2 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
              <span>Updates: {tickCount}</span>
              <span>
                Critical events:{" "}
                <span className="text-destructive font-semibold">
                  {criticalLog.length}
                </span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Live Vitals Grid ─── */}
      <AnimatePresence>
        {isSimulating && demoData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Live Vitals
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <LiveMetricCard
                icon={Heart}
                label="Heart Rate"
                value={demoData.heartRate}
                unit="bpm"
                color="hsl(0, 80%, 55%)"
                isCritical={demoData.heartRate > 120}
                pulse
              />
              <LiveMetricCard
                icon={Wind}
                label="SpO2"
                value={demoData.spo2}
                unit="%"
                color="hsl(172, 66%, 50%)"
                isCritical={demoData.spo2 < 92}
              />
              <LiveMetricCard
                icon={Droplets}
                label="Blood Pressure"
                value={`${demoData.bloodPressure.systolic}/${demoData.bloodPressure.diastolic}`}
                unit="mmHg"
                color="hsl(340, 82%, 52%)"
                isCritical={
                  demoData.bloodPressure.systolic > 160 ||
                  demoData.bloodPressure.diastolic > 100
                }
              />
              <LiveMetricCard
                icon={Activity}
                label="Glucose"
                value={demoData.bloodGlucose}
                unit="mg/dL"
                color="hsl(48, 96%, 53%)"
                isCritical={demoData.bloodGlucose > 250}
              />
              <LiveMetricCard
                icon={Footprints}
                label="Steps"
                value={totalSteps.toLocaleString()}
                unit="steps"
                color="hsl(217, 91%, 60%)"
              />
              <LiveMetricCard
                icon={Zap}
                label="Calories"
                value={totalCalories.toLocaleString()}
                unit="kcal"
                color="hsl(25, 95%, 53%)"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Critical Events Log ─── */}
      <AnimatePresence>
        {criticalLog.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-destructive/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider">
                    Recent Critical Readings
                  </h3>
                </div>
                <div className="space-y-2">
                  {criticalLog.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-wrap items-center gap-4 text-sm bg-destructive/5 rounded-xl px-4 py-3"
                    >
                      <span className="text-xs text-muted-foreground font-mono w-20">
                        {log.time}
                      </span>
                      <span className="text-destructive font-medium">
                        HR {log.hr} bpm
                      </span>
                      <span className="text-destructive font-medium">
                        SpO2 {log.spo2}%
                      </span>
                      <span className="text-destructive font-medium">
                        BP {log.bp}
                      </span>
                      <span className="text-destructive font-medium">
                        Glucose {log.glucose}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  These readings trigger health alerts visible on the Alerts
                  page.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Not simulating placeholder ─── */}
      {!isSimulating && (
        <Card>
          <CardContent className="py-16 text-center">
            <Radio className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Device Active
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Start the demo simulator to see real-time health metrics streamed
              to your dashboard. The simulator occasionally produces critical
              values to demonstrate the alert system.
            </p>
            <Button onClick={onStartSimulator} className="gap-2">
              <Play className="w-4 h-4" /> Start Demo Simulator
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WearableDevices;
