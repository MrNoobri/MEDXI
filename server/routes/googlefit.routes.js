const express = require("express");
const router = express.Router();
const googleFitController = require("../controllers/googlefit.controller");
const { protect } = require("../middleware/auth");

// Get OAuth URL (protected - user must be logged in)
router.get("/auth", protect, googleFitController.getAuthUrl);

// OAuth callback (public - Google redirects here)
router.get("/callback", googleFitController.handleCallback);

// Get connection status
router.get("/status", protect, googleFitController.getStatus);

// Manual sync
router.post("/sync", protect, googleFitController.syncData);

// Disconnect
router.post("/disconnect", protect, googleFitController.disconnect);

module.exports = router;
