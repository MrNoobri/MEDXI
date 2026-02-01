const express = require("express");
const router = express.Router();
const healthMetricsController = require("../controllers/healthMetrics.controller");
const { authenticate } = require("../middleware/auth.middleware");

// All routes require authentication
router.use(authenticate);

// Create health metric
router.post("/", healthMetricsController.createMetric);

// Get health metrics
router.get("/", healthMetricsController.getMetrics);
router.get("/user/:userId", healthMetricsController.getMetrics);

// Get latest metrics summary
router.get("/latest", healthMetricsController.getLatestMetrics);
router.get("/latest/:userId", healthMetricsController.getLatestMetrics);

// Get metric statistics
router.get("/stats", healthMetricsController.getMetricStats);
router.get("/stats/:userId", healthMetricsController.getMetricStats);

// Delete metric
router.delete("/:id", healthMetricsController.deleteMetric);

module.exports = router;
