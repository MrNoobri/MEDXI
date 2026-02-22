import React from "react";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

const MetricCard = ({ title, value, unit, status, icon, onClick, trend }) => {
  const getStatusColor = () => {
    if (status === "normal") return "border-success text-success-dark";
    if (status === "warning") return "border-warning text-warning-dark";
    if (status === "critical") return "border-danger text-danger-dark";
    return "border-border text-foreground";
  };

  const getStatusBgColor = () => {
    if (status === "normal") return "bg-success-light";
    if (status === "warning") return "bg-warning-light";
    if (status === "critical") return "bg-danger-light";
    return "bg-muted";
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : ""
      } bg-white border border-slate-100 shadow-sm group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-foreground">
              {value !== null && value !== undefined ? value : "--"}
            </p>
            {unit && <p className="text-sm text-muted-foreground">{unit}</p>}
          </div>
          {trend && (
            <p
              className={`text-xs mt-2 ${trend > 0 ? "text-success-dark" : "text-danger-dark"}`}
            >
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last week
            </p>
          )}
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
