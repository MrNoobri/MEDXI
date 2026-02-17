import React from "react";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

const MetricCard = ({ title, value, unit, status, icon, onClick, trend }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "normal":
        return {
          indicator: "bg-emerald-500",
          text: "text-emerald-700",
          bg: "bg-emerald-50/50",
          border: "border-emerald-100",
          trend: "text-emerald-600",
        };
      case "warning":
        return {
          indicator: "bg-amber-500",
          text: "text-amber-700",
          bg: "bg-amber-50/50",
          border: "border-amber-100",
          trend: "text-amber-600",
        };
      case "critical":
        return {
          indicator: "bg-rose-500",
          text: "text-rose-700",
          bg: "bg-rose-50/50",
          border: "border-rose-100",
          trend: "text-rose-600",
        };
      default:
        return {
          indicator: "bg-slate-400",
          text: "text-slate-600",
          bg: "bg-slate-50/50",
          border: "border-slate-100",
          trend: "text-slate-500",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : ""
      } bg-white border border-slate-100 shadow-sm group`}
    >
      {/* Decorative background visual */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 ${styles.indicator.replace("bg-", "bg-")}`}
      />

      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${styles.bg}`}>
          <span className="text-2xl">
            {icon || <Activity className="w-6 h-6 text-slate-400" />}
          </span>
        </div>
        {status && (
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles.bg} ${styles.border} ${styles.text} flex items-center gap-1.5`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${styles.indicator}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">
            {value !== null && value !== undefined ? value : "--"}
          </span>
          {unit && (
            <span className="text-sm font-medium text-slate-400">{unit}</span>
          )}
        </div>

        {trend !== undefined && trend !== null && (
          <div
            className={`flex items-center mt-3 text-xs font-medium ${trend > 0 ? "text-emerald-600" : "text-rose-600"}`}
          >
            {trend > 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
            )}
            {Math.abs(trend)}% vs last week
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
