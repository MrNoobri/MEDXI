const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      "steps_milestone",
      "daily_streak",
      "heart_health",
      "sleep_champion",
      "fitness_master",
      "data_tracker",
      "early_bird",
      "night_owl",
      "consistent_logger",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  icon: String,
  earnedAt: {
    type: Date,
    default: Date.now,
  },
  progress: {
    current: Number,
    target: Number,
  },
  level: {
    type: Number,
    default: 1,
  },
});

const userStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActivityDate: Date,
    totalMetricsLogged: {
      type: Number,
      default: 0,
    },
    achievements: [achievementSchema],
    weeklyGoals: {
      steps: {
        target: { type: Number, default: 70000 }, // 10k per day
        current: { type: Number, default: 0 },
      },
      exercise: {
        target: { type: Number, default: 150 }, // minutes per week
        current: { type: Number, default: 0 },
      },
      sleep: {
        target: { type: Number, default: 49 }, // 7 hours per night
        current: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UserStats", userStatsSchema);
