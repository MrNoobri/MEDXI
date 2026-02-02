const mongoose = require("mongoose");

const healthMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    metricType: {
      type: String,
      enum: [
        "steps",
        "sleep",
        "heartRate",
        "bloodPressure",
        "bloodGlucose",
        "weight",
        "calories",
        "waterIntake",
        "exercise",
        "temperature",
        "oxygenSaturation",
        "distance",
      ],
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["manual", "apple-health", "samsung-health", "fitbit", "simulator", "google_fit"],
      default: "manual",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: String,
    metadata: {
      deviceId: String,
      accuracy: Number,
      location: {
        latitude: Number,
        longitude: Number,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
healthMetricSchema.index({ userId: 1, metricType: 1, timestamp: -1 });

// Static method to get latest metric
healthMetricSchema.statics.getLatest = function (userId, metricType) {
  return this.findOne({ userId, metricType }).sort({ timestamp: -1 }).exec();
};

// Static method to get metrics in date range
healthMetricSchema.statics.getInRange = function (
  userId,
  metricType,
  startDate,
  endDate,
) {
  return this.find({
    userId,
    metricType,
    timestamp: { $gte: startDate, $lte: endDate },
  })
    .sort({ timestamp: 1 })
    .exec();
};

const HealthMetric = mongoose.model("HealthMetric", healthMetricSchema);

module.exports = HealthMetric;
