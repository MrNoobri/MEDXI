const express = require("express");
const router = express.Router();
const googleFitController = require("../controllers/googlefit.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Get OAuth URL (protected - user must be logged in)
router.get("/auth", authenticate, googleFitController.getAuthUrl);

// OAuth callback (public - Google redirects here)
router.get("/callback", googleFitController.handleCallback);

// Get connection status
router.get("/status", authenticate, googleFitController.getStatus);

// Manual sync
router.post("/sync", authenticate, googleFitController.syncData);

// Disconnect
router.post("/disconnect", authenticate, googleFitController.disconnect);

module.exports = router;
