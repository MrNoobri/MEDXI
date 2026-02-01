import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const MetricChart = ({ data, metricType, color = "#00a2a2" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    date: format(new Date(item.timestamp), "MM/dd"),
    value: typeof item.value === "object" ? item.value.systolic : item.value,
    fullDate: format(new Date(item.timestamp), "MMM dd, yyyy HH:mm"),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-3 rounded-lg shadow-lg border">
                  <p className="text-sm text-gray-600">
                    {payload[0].payload.fullDate}
                  </p>
                  <p className="text-lg font-bold text-primary-600">
                    {payload[0].value} {data[0]?.unit}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MetricChart;
