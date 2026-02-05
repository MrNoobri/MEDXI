const HealthMetric = require("../models/HealthMetric.model");
const Alert = require("../models/Alert.model");
const { createAuditLog } = require("../middleware/audit.middleware");
const { awardPoints } = require("./gamification.controller");

/**
 * Health metric thresholds for alert generation
 */
const ALERT_THRESHOLDS = {
  heartRate: { min: 60, max: 100, unit: "bpm" },
  bloodPressure: {
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 },
    unit: "mmHg",
  },
  bloodGlucose: { min: 70, max: 140, unit: "mg/dL" },
  oxygenSaturation: { min: 95, max: 100, unit: "%" },
  temperature: { min: 36.1, max: 37.2, unit: "°C" },
};

/**
 * Check if metric value triggers an alert
 */
const checkAlertThreshold = async (metric) => {
  const threshold = ALERT_THRESHOLDS[metric.metricType];
  if (!threshold) return;

  let shouldAlert = false;
  let severity = "low";
  let message = "";

  if (metric.metricType === "bloodPressure") {
    const { systolic, diastolic } = metric.value;
    if (
      systolic > threshold.systolic.max ||
      diastolic > threshold.diastolic.max
    ) {
      shouldAlert = true;
      severity = systolic > 160 || diastolic > 100 ? "critical" : "medium";
      message = `Blood pressure reading (${systolic}/${diastolic} ${threshold.unit}) is higher than normal range.`;
    } else if (
      systolic < threshold.systolic.min ||
      diastolic < threshold.diastolic.min
    ) {
      shouldAlert = true;
      severity = "medium";
      message = `Blood pressure reading (${systolic}/${diastolic} ${threshold.unit}) is lower than normal range.`;
    }
  } else {
    const value =
      typeof metric.value === "object" ? metric.value.value : metric.value;
    if (value > threshold.max) {
      shouldAlert = true;
      severity = value > threshold.max * 1.2 ? "high" : "medium";
      message = `${metric.metricType} reading (${value} ${metric.unit}) is higher than normal range.`;
    } else if (value < threshold.min) {
      shouldAlert = true;
      severity = value < threshold.min * 0.8 ? "high" : "medium";
      message = `${metric.metricType} reading (${value} ${metric.unit}) is lower than normal range.`;
    }
  }

  if (shouldAlert) {
    await Alert.create({
      userId: metric.userId,
      severity,
      type: "health-metric",
      title: `Abnormal ${metric.metricType} detected`,
      message,
      metricSnapshot: {
        metricType: metric.metricType,
        value: metric.value,
        unit: metric.unit,
        threshold,
      },
    });
  }
};

/**
 * Create health metric
 */
const createMetric = async (req, res) => {
  try {
    const { metricType, value, unit, source, timestamp, notes, metadata } =
      req.body;

    // For patients, use their own userId; for providers, allow specifying userId
    const userId =
      req.user.role === "patient"
        ? req.user._id
        : req.body.userId || req.user._id;

    const metric = await HealthMetric.create({
      userId,
      metricType,
      value,
      unit,
      source: source || "manual",
      timestamp: timestamp || new Date(),
      notes,
      metadata,
    });

    // Check if alert should be triggered
    await checkAlertThreshold(metric);

    // Award gamification points
    await awardPoints(userId, metricType);

    // Audit log
    await createAuditLog(req.user._id, req.user.role, "edit-patient-data", {
      targetId: metric._id,
      targetModel: "HealthMetric",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      success: true,
      message: "Health metric recorded successfully",
      data: metric,
    });
  } catch (error) {
    console.error("Create metric error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create health metric",
    });
  }
};

/**
 * Get user's health metrics
 */
const getMetrics = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { metricType, startDate, endDate, limit = 100 } = req.query;

    // Authorization check
    if (
      req.user.role === "patient" &&
      userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const query = { userId };

    if (metricType) {
      query.metricType = metricType;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const metrics = await HealthMetric.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Audit log for provider viewing patient data
    if (
      req.user.role === "provider" &&
      userId.toString() !== req.user._id.toString()
    ) {
      await createAuditLog(req.user._id, req.user.role, "view-patient-data", {
        targetId: userId,
        targetModel: "User",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    res.json({
      success: true,
      data: metrics,
      count: metrics.length,
    });
  } catch (error) {
    console.error("Get metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve health metrics",
    });
  }
};

/**
 * Get latest metrics summary
 */
const getLatestMetrics = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    // Authorization check
    if (
      req.user.role === "patient" &&
      userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const metricTypes = [
      "steps",
      "sleep",
      "heartRate",
      "bloodPressure",
      "bloodGlucose",
      "weight",
      "calories",
      "oxygenSaturation",
      "distance",
    ];

    const latestMetrics = {};

    for (const type of metricTypes) {
      const metric = await HealthMetric.getLatest(userId, type);
      if (metric) {
        latestMetrics[type] = metric;
      }
    }

    res.json({
      success: true,
      data: latestMetrics,
    });
  } catch (error) {
    console.error("Get latest metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve latest metrics",
    });
  }
};

/**
 * Get metric statistics
 */
const getMetricStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { metricType, period = "7d" } = req.query;

    if (!metricType) {
      return res.status(400).json({
        success: false,
        message: "metricType is required",
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    if (period === "7d") startDate.setDate(startDate.getDate() - 7);
    else if (period === "30d") startDate.setDate(startDate.getDate() - 30);
    else if (period === "90d") startDate.setDate(startDate.getDate() - 90);

    const metrics = await HealthMetric.getInRange(
      userId,
      metricType,
      startDate,
      endDate,
    );

    // Calculate statistics
    const values = metrics
      .map((m) => (typeof m.value === "object" ? m.value.value : m.value))
      .filter((v) => typeof v === "number");

    const stats = {
      count: values.length,
      min: values.length > 0 ? Math.min(...values) : null,
      max: values.length > 0 ? Math.max(...values) : null,
      avg:
        values.length > 0
          ? values.reduce((a, b) => a + b, 0) / values.length
          : null,
      latest: metrics.length > 0 ? metrics[metrics.length - 1] : null,
    };

    res.json({
      success: true,
      data: stats,
      metrics,
    });
  } catch (error) {
    console.error("Get metric stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve metric statistics",
    });
  }
};

/**
 * Delete health metric
 */
const deleteMetric = async (req, res) => {
  try {
    const { id } = req.params;

    const metric = await HealthMetric.findById(id);

    if (!metric) {
      return res.status(404).json({
        success: false,
        message: "Metric not found",
      });
    }

    // Authorization check
    if (
      req.user.role === "patient" &&
      metric.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await HealthMetric.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Health metric deleted successfully",
    });
  } catch (error) {
    console.error("Delete metric error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete health metric",
    });
  }
};

module.exports = {
  createMetric,
  getMetrics,
  getLatestMetrics,
  getMetricStats,
  deleteMetric,
};
