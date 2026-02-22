import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CalendarDays,
  Clock,
  Mail,
  Droplets,
  Pill,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MetricCard from "../health/MetricCard";
import MetricChart from "../health/MetricChart";
import { healthMetricsAPI, alertsAPI, appointmentsAPI } from "../../api";
import { cn } from "@/lib/utils";

const METRIC_LABELS = {
  heartRate: "Heart Rate",
  bloodPressure: "Blood Pressure",
  oxygenSaturation: "Oxygen Level",
  steps: "Steps",
  sleep: "Sleep",
  bloodGlucose: "Blood Glucose",
};

const METRIC_ICONS = {
  heartRate: "❤️",
  bloodPressure: "🩸",
  bloodGlucose: "🍬",
  oxygenSaturation: "💨",
  steps: "👣",
  sleep: "😴",
};

const SEVERITY_STYLES = {
  critical: "border-l-4 border-red-500 bg-red-50/50",
  high: "border-l-4 border-orange-500 bg-orange-50/50",
  medium: "border-l-4 border-yellow-500 bg-yellow-50/50",
  low: "border-l-4 border-blue-500 bg-blue-50/50",
};

const STATUS_COLORS = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-800",
};

const PatientDetailPanel = ({ patient, onBack }) => {
  const [selectedMetric, setSelectedMetric] = useState(null);

  const { data: latestMetrics } = useQuery({
    queryKey: ["patientLatestMetrics", patient._id],
    queryFn: async () => {
      const response = await healthMetricsAPI.getLatest(patient._id);
      return response.data.data;
    },
    enabled: !!patient._id,
  });

  const { data: patientAlerts } = useQuery({
    queryKey: ["singlePatientAlerts", patient._id],
    queryFn: async () => {
      const response = await alertsAPI.getAll({
        userId: patient._id,
        limit: 10,
      });
      return response.data.data;
    },
    enabled: !!patient._id,
  });

  const { data: appointmentHistory } = useQuery({
    queryKey: ["patientAppointments", patient._id],
    queryFn: async () => {
      const response = await appointmentsAPI.getAll({});
      return (response.data.data || []).filter(
        (a) =>
          (a.patientId?._id || a.patientId) === patient._id,
      );
    },
    enabled: !!patient._id,
  });

  const { data: metricHistory } = useQuery({
    queryKey: ["patientMetricHistory", patient._id, selectedMetric],
    queryFn: async () => {
      if (!selectedMetric) return null;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const response = await healthMetricsAPI.getByUser(patient._id, {
        metricType: selectedMetric,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      return response.data.data;
    },
    enabled: !!selectedMetric && !!patient._id,
  });

  const formatValue = (metricType, value) => {
    if (metricType === "bloodPressure" && typeof value === "object") {
      return `${value.systolic}/${value.diastolic}`;
    }
    return value?.toFixed?.(1) || value;
  };

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

  const activeAlerts = (patientAlerts || []).filter((a) => !a.isAcknowledged);

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">
              {patient.profile?.firstName?.[0]}
              {patient.profile?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {patient.profile?.firstName} {patient.profile?.lastName}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </span>
              </div>
            </div>
          </div>
          {/* Patient info tags */}
          <div className="flex flex-wrap gap-2 ml-[4.5rem]">
            {patient.patientInfo?.bloodType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                <Droplets className="h-3 w-3" />
                {patient.patientInfo.bloodType}
              </span>
            )}
            {patient.patientInfo?.allergies?.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                <AlertTriangle className="h-3 w-3" />
                Allergies: {patient.patientInfo.allergies.join(", ")}
              </span>
            )}
            {patient.patientInfo?.medications?.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <Pill className="h-3 w-3" />
                {patient.patientInfo.medications.length} medication(s)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <Card className="border-l-4 border-red-500 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
              <AlertTriangle className="h-4 w-4" />
              {activeAlerts.length} Active Alert(s)
            </div>
            <div className="space-y-2">
              {activeAlerts.slice(0, 3).map((alert) => (
                <div key={alert._id} className="text-sm text-red-600">
                  <span className="font-medium">[{alert.severity}]</span>{" "}
                  {alert.title} - {alert.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Health Metrics
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
                  status={
                    metric ? getMetricStatus(key, metric.value) : undefined
                  }
                  icon={METRIC_ICONS[key]}
                  onClick={() =>
                    setSelectedMetric(selectedMetric === key ? null : key)
                  }
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metric Chart */}
      {selectedMetric && metricHistory && metricHistory.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>
              {METRIC_LABELS[selectedMetric]} - Last 7 Days
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMetric(null)}
            >
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <MetricChart data={metricHistory} metricType={selectedMetric} />
          </CardContent>
        </Card>
      )}

      {/* Appointment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Appointment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!appointmentHistory || appointmentHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No appointment history
            </p>
          ) : (
            <div className="space-y-3">
              {appointmentHistory
                .sort(
                  (a, b) =>
                    new Date(b.scheduledAt) - new Date(a.scheduledAt),
                )
                .slice(0, 10)
                .map((appt) => (
                  <div
                    key={appt._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-[100px]">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(appt.scheduledAt), "MMM dd, yyyy")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {appt.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appt.type} - {appt.duration}min
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        STATUS_COLORS[appt.status] || STATUS_COLORS.scheduled,
                      )}
                    >
                      {appt.status}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDetailPanel;
