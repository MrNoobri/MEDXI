const UserStats = require("../models/UserStats.model");
const HealthMetric = require("../models/HealthMetric.model");

/**
 * Get or create user stats
 */
const getUserStats = async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userId: req.user._id });

    if (!stats) {
      stats = await UserStats.create({
        userId: req.user._id,
        totalPoints: 0,
        level: 1,
        currentStreak: 0,
        achievements: [],
      });
    }

    // Calculate weekly progress
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekMetrics = await HealthMetric.aggregate([
      {
        $match: {
          userId: req.user._id,
          timestamp: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: "$metricType",
          total: { $sum: "$value" },
        },
      },
    ]);

    // Update weekly goals
    weekMetrics.forEach((metric) => {
      if (metric._id === "steps") {
        stats.weeklyGoals.steps.current = metric.total;
      } else if (metric._id === "sleep") {
        stats.weeklyGoals.sleep.current = metric.total;
      }
    });

    await stats.save();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user statistics",
    });
  }
};

/**
 * Award points for logging metrics
 */
const awardPoints = async (userId, metricType) => {
  try {
    let stats = await UserStats.findOne({ userId });

    if (!stats) {
      stats = await UserStats.create({
        userId,
        totalPoints: 0,
        level: 1,
      });
    }

    // Points based on metric type
    const pointsMap = {
      heartRate: 5,
      bloodPressure: 10,
      bloodGlucose: 10,
      steps: 3,
      sleep: 8,
      weight: 5,
      oxygenSaturation: 5,
      calories: 3,
      distance: 5,
    };

    const points = pointsMap[metricType] || 2;
    stats.totalPoints += points;
    stats.totalMetricsLogged += 1;

    // Level up calculation (every 500 points)
    const newLevel = Math.floor(stats.totalPoints / 500) + 1;
    if (newLevel > stats.level) {
      stats.level = newLevel;
      // Award level up achievement
      await checkAndAwardAchievement(userId, "fitness_master", newLevel);
    }

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (stats.lastActivityDate) {
      const lastActivity = new Date(stats.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }

        // Check streak achievements
        if (stats.currentStreak === 7) {
          await checkAndAwardAchievement(userId, "daily_streak", 1);
        } else if (stats.currentStreak === 30) {
          await checkAndAwardAchievement(userId, "daily_streak", 2);
        } else if (stats.currentStreak === 100) {
          await checkAndAwardAchievement(userId, "daily_streak", 3);
        }
      } else if (daysDiff > 1) {
        // Streak broken
        stats.currentStreak = 1;
      }
    } else {
      stats.currentStreak = 1;
    }

    stats.lastActivityDate = new Date();
    await stats.save();

    return { points, newLevel: stats.level, streak: stats.currentStreak };
  } catch (error) {
    console.error("Error awarding points:", error);
  }
};

/**
 * Check and award achievements
 */
const checkAndAwardAchievement = async (userId, type, level = 1) => {
  try {
    const stats = await UserStats.findOne({ userId });
    if (!stats) return;

    // Check if achievement already exists
    const existingAchievement = stats.achievements.find(
      (a) => a.type === type && a.level === level,
    );
    if (existingAchievement) return;

    const achievements = {
      steps_milestone: {
        1: { title: "First Steps", description: "Logged your first 10,000 steps", icon: "🚶" },
        2: { title: "Step Master", description: "Achieved 100,000 total steps", icon: "🏃" },
        3: { title: "Marathon Walker", description: "Reached 1,000,000 total steps", icon: "🏆" },
      },
      daily_streak: {
        1: { title: "Week Warrior", description: "7-day logging streak", icon: "🔥" },
        2: { title: "Monthly Champion", description: "30-day logging streak", icon: "🌟" },
        3: { title: "Century Streaker", description: "100-day logging streak", icon: "💎" },
      },
      fitness_master: {
        1: { title: "Getting Started", description: "Reached level 5", icon: "🎯" },
        2: { title: "Health Enthusiast", description: "Reached level 10", icon: "💪" },
        3: { title: "Fitness Legend", description: "Reached level 20", icon: "👑" },
      },
      heart_health: {
        1: { title: "Heart Monitor", description: "Logged 30 heart rate readings", icon: "❤️" },
      },
      sleep_champion: {
        1: { title: "Sleep Tracker", description: "Logged 7 days of sleep data", icon: "😴" },
      },
    };

    const achievement = achievements[type]?.[level];
    if (achievement) {
      stats.achievements.push({
        type,
        level,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        earnedAt: new Date(),
      });

      await stats.save();
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
};

/**
 * Get leaderboard (top users by points)
 */
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await UserStats.find()
      .sort({ totalPoints: -1 })
      .limit(10)
      .populate("userId", "name email")
      .select("userId totalPoints level currentStreak");

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve leaderboard",
    });
  }
};

module.exports = {
  getUserStats,
  awardPoints,
  checkAndAwardAchievement,
  getLeaderboard,
};
