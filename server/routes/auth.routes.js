const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/google", authController.getGoogleAuthUrl);
router.get("/google/callback", authController.handleGoogleCallback);
router.post("/refresh", authController.refreshAccessToken);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.post("/set-password", authenticate, authController.setPassword);
router.patch("/preferences", authenticate, authController.updatePreferences);
router.get("/me", authenticate, authController.getCurrentUser);
router.get("/providers", authenticate, authController.getProviders);

module.exports = router;
