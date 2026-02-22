const Alert = require("../models/Alert.model");
const emailService = require("../services/emailService");

/**
 * Get user alerts
 */
const getAlerts = async (req, res) => {
  try {
    const { isRead, severity, limit = 50 } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === "patient") {
      query.userId = req.user._id;
    } else if (req.user.role === "provider") {
      // Providers can see alerts for their patients
      // This would require additional logic to get patient list
      query.userId = req.query.userId || req.user._id;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    if (severity) {
      query.severity = severity;
    }

    const alerts = await Alert.find(query)
      .populate("userId", "profile.firstName profile.lastName")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error("Get alerts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve alerts",
    });
  }
};

/**
 * Get unread alerts count
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Alert.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
    });
  }
};

/**
 * Mark alert as read
 */
const markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Authorization check
    if (
      alert.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "provider"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    alert.isRead = true;
    await alert.save();

    res.json({
      success: true,
      message: "Alert marked as read",
      data: alert,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark alert as read",
    });
  }
};

/**
 * Acknowledge alert (provider action)
 */
const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Authorization check
    const isAuthorized =
      req.user.role === "admin" ||
      req.user.role === "provider" ||
      alert.userId.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    alert.isAcknowledged = true;
    alert.acknowledgedBy = req.user._id;
    alert.acknowledgedAt = new Date();

    await alert.save();

    res.json({
      success: true,
      message: "Alert acknowledged successfully",
      data: alert,
    });
  } catch (error) {
    console.error("Acknowledge alert error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to acknowledge alert",
    });
  }
};

/**
 * Delete alert
 */
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Authorization check
    if (
      alert.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await Alert.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error("Delete alert error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete alert",
    });
  }
};

/**
 * Helper function to send alert notification email
 * Can be called from other parts of the system when creating alerts
 */
const sendAlertEmail = async (alert, user) => {
  if (!emailService.isAvailable() || !user.email) {
    return;
  }

  try {
    const critical = alert.severity === "critical";
    const severityText =
      alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1);

    // Generate recommendations based on alert type
    const recommendations = [];
    if (alert.metricType === "heartRate") {
      if (critical) {
        recommendations.push("Seek immediate medical attention");
        recommendations.push("Do not engage in strenuous activity");
      } else {
        recommendations.push("Monitor your heart rate regularly");
        recommendations.push("Stay hydrated and rest");
      }
    } else if (alert.metricType === "bloodGlucose") {
      recommendations.push("Check your blood sugar again");
      recommendations.push("Follow your meal plan");
      recommendations.push("Contact your healthcare provider");
    }

    await emailService.sendAlertNotification({
      to: user.email,
      patientName: `${user.profile.firstName} ${user.profile.lastName}`,
      metricType: alert.metricType,
      metricValue: alert.metricValue,
      unit: alert.unit || "",
      severity: severityText,
      message: alert.message,
      recommendations,
      critical,
      dashboardUrl: `${process.env.CLIENT_URL}/dashboard`,
    });
  } catch (error) {
    console.error("Failed to send alert email:", error);
  }
};

module.exports = {
  getAlerts,
  getUnreadCount,
  markAsRead,
  acknowledgeAlert,
  deleteAlert,
  sendAlertEmail, // Export for use in other controllers
};
