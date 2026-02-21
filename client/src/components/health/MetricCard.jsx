import React from "react";

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
      className={`metric-card border-l-4 ${getStatusColor()} ${onClick ? "cursor-pointer" : ""}`}
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
        {icon && (
          <div className={`p-3 rounded-lg ${getStatusBgColor()}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
      {status && (
        <div className="mt-3">
          <span
            className={`status-indicator ${status === "normal" ? "status-normal" : status === "warning" ? "status-warning" : "status-critical"}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
