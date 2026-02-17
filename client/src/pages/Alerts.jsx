import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, X, Clock, Activity } from "lucide-react";
import Navbar from "../components/common/Navbar";
import { alertsAPI } from "../api";
import { Button } from "../ui/shared/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/shared/Card";

const Alerts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all"); // all, active, resolved

  // Fetch alerts
  const { data: alertsResponse, isLoading } = useQuery({
    queryKey: ["alerts", filter],
    queryFn: async () => {
      const params = {};
      if (filter === "active") params.isResolved = false;
      if (filter === "resolved") params.isResolved = true;
      const response = await alertsAPI.getAll(params);
      return response.data;
    },
  });

  const alerts = alertsResponse?.data || [];

  // Mark alert as resolved
  const resolveAlertMutation = useMutation({
    mutationFn: (alertId) => alertsAPI.markResolved(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries(["alerts"]);
    },
  });

  const getAlertIcon = (severity) => {
    const iconProps = { className: "w-6 h-6" };
    if (severity === "critical") return <AlertTriangle {...iconProps} className="w-6 h-6 text-danger-600" />;
    if (severity === "warning") return <AlertTriangle {...iconProps} className="w-6 h-6 text-warning-600" />;
    return <Activity {...iconProps} className="w-6 h-6 text-primary-600" />;
  };

  const getAlertStyle = (severity) => {
    if (severity === "critical") 
      return "border-l-4 border-danger-500 bg-danger-50";
    if (severity === "warning") 
      return "border-l-4 border-warning-500 bg-warning-50";
    return "border-l-4 border-primary-500 bg-primary-50";
  };

  const getSeverityBadge = (severity) => {
    if (severity === "critical") 
      return "bg-danger-100 text-danger-800 border border-danger-200";
    if (severity === "warning") 
      return "bg-warning-100 text-warning-800 border border-warning-200";
    return "bg-primary-100 text-primary-800 border border-primary-200";
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Health Alerts</h1>
              <p className="text-gray-600 mt-2">Monitor and manage your health notifications</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-2 border-b border-gray-200">
          {[
            { key: "all", label: "All Alerts" },
            { key: "active", label: "Active" },
            { key: "resolved", label: "Resolved" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                filter === tab.key
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Alerts</h3>
              <p className="text-gray-600">
                {filter === "all" 
                  ? "You don't have any health alerts at the moment."
                  : filter === "active"
                  ? "No active alerts. You're all good!"
                  : "No resolved alerts in your history."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert._id} className={getAlertStyle(alert.severity)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">
                        {getAlertIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          {alert.isResolved && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {alert.title || "Health Alert"}
                        </h3>
                        <p className="text-gray-700 mb-3">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(alert.createdAt)}
                          </div>
                          {alert.metricType && (
                            <div className="flex items-center">
                              <Activity className="w-4 h-4 mr-1" />
                              {alert.metricType}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {!alert.isResolved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveAlertMutation.mutate(alert._id)}
                        disabled={resolveAlertMutation.isPending}
                        className="ml-4"
                      >
                        {resolveAlertMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Resolved
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
