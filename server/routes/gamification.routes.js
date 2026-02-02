const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");
const {
  getUserStats,
  getLeaderboard,
} = require("../controllers/gamification.controller");

// @route   GET /api/gamification/stats
// @desc    Get user stats and achievements
// @access  Private
router.get("/stats", authenticate, getUserStats);

// @route   GET /api/gamification/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get("/leaderboard", authenticate, getLeaderboard);

module.exports = router;
