import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { format, subDays, isSameDay, parseISO } from "date-fns";

const METRIC_CONFIG = {
  steps: { type: "bar", color: "#6366f1", label: "Steps" }, // Indigo
  calories: { type: "bar", color: "#f97316", label: "Calories" }, // Orange
  distance: { type: "bar", color: "#14b8a6", label: "Distance" }, // Teal
  sleep: { type: "bar", color: "#8b5cf6", label: "Sleep" }, // Violet
  heartRate: { type: "line", color: "#ef4444", label: "Heart Rate" }, // Red
  bloodPressure: { type: "line", color: "#ec4899", label: "Blood Pressure" }, // Pink
  oxygenSaturation: { type: "line", color: "#06b6d4", label: "SpO2" }, // Cyan
  bloodGlucose: { type: "line", color: "#a855f7", label: "Glucose" }, // Purple
  weight: { type: "line", color: "#64748b", label: "Weight" }, // Slate
  default: { type: "line", color: "#3b82f6", label: "Metric" }, // Blue
};

const MetricChart = ({ data, metricType, onRangeChange }) => {
  const [range, setRange] = useState("7d"); // 1d, 7d, 30d

  const config = METRIC_CONFIG[metricType] || METRIC_CONFIG.default;

  // Filter Data based on Range (if data contains more than we need, though usually API handles this)
  const filteredData = useMemo(() => {
    if (!data) return [];

    // If the API returns a lot of data, we might filter here, 
    // but typically we should rely on the API to give us the right range.
    // However, for immediate valid rendering:
    return data;
  }, [data, range]);

  const formatXAxis = (tickItem) => {
    if (range === "1d") return format(new Date(tickItem), "HH:mm");
    return format(new Date(tickItem), "dd/MM");
  };

  const ChartComponent = config.type === "bar" ? BarChart : LineChart;

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    if (onRangeChange) onRangeChange(newRange);
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <div className="p-4 bg-white rounded-full shadow-sm mb-3">
          <span className="text-2xl opacity-50">📊</span>
        </div>
        <p>No data recorded for this period</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Legend / Title could go here if needed, but usually redundant with modal title */}
          <span className="text-sm text-slate-500 font-medium">Trends</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {["1d", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${range === r
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const dateLabel = range === "1d"
                  ? format(new Date(label), "PPP p")
                  : format(new Date(label), "PPP");

                return (
                  <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs">
                    <p className="font-semibold mb-1">{dateLabel}</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                      <span>{config.label}:</span>
                      <span className="font-bold">
                        {typeof payload[0].value === 'object'
                          ? `${payload[0].value.systolic}/${payload[0].value.diastolic}`
                          : payload[0].value} {data[0]?.unit}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          {config.type === "bar" && (
            <Bar
              dataKey="value"
              fill={config.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          )}

          {config.type === "line" && metricType === "bloodPressure" ? (
            // Special case for BP
            <>
              <Line
                type="monotone"
                dataKey="value.systolic"
                stroke={config.color}
                strokeWidth={2}
                dot={{ fill: config.color, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                name="Systolic"
              />
              <Line
                type="monotone"
                dataKey="value.diastolic"
                stroke={config.color}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: config.color, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                name="Diastolic"
              />
            </>
          ) : config.type === "line" ? (
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={3}
              dot={{ fill: config.color, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
              connectNulls
            />
          ) : null}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricChart;
