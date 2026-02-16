import React from "react";

const MetricCard = ({ title, value, unit, status, icon, onClick, trend }) => {
  const getStatusColor = () => {
    if (status === "normal") return "border-success-500 bg-success-50 text-success-700";
    if (status === "warning") return "border-warning-500 bg-warning-50 text-warning-700";
    if (status === "critical") return "border-danger-500 bg-danger-50 text-danger-700";
    return "border-gray-300 bg-gray-50 text-gray-600";
  };

  const getIconBg = () => {
    if (status === "normal") return "bg-success-100";
    if (status === "warning") return "bg-warning-100";
    if (status === "critical") return "bg-danger-100";
    return "bg-gray-100";
  };

  const getStatusBadge = () => {
    if (status === "normal") return "bg-success-100 text-success-800 border border-success-200";
    if (status === "warning") return "bg-warning-100 text-warning-800 border border-warning-200";
    if (status === "critical") return "bg-danger-100 text-danger-800 border border-danger-200";
    return "bg-gray-100 text-gray-800 border border-gray-200";
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 ${getStatusColor()} ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">
              {value !== null && value !== undefined ? value : "--"}
            </p>
            {unit && <p className="text-base text-gray-500 font-medium">{unit}</p>}
          </div>
          {trend && (
            <p
              className={`text-xs mt-2 font-medium ${trend > 0 ? "text-success-600" : "text-danger-600"}`}
            >
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${getIconBg()}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
      {status && (
        <div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge()}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
