const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Rate limiter for sensitive operations (5 requests per hour per IP)
const sensitiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for auth operations (10 requests per 15 minutes)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post("/register", authRateLimiter, authController.register);
router.post("/login", authRateLimiter, authController.login);
router.post("/refresh", authController.refreshAccessToken);
router.post("/verify-email", authController.verifyEmail);
router.post(
  "/forgot-password",
  sensitiveRateLimiter,
  authController.requestPasswordReset,
);
router.post(
  "/reset-password",
  sensitiveRateLimiter,
  authController.resetPassword,
);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getCurrentUser);
router.get("/providers", authenticate, authController.getProviders);
router.post(
  "/send-verification",
  authenticate,
  sensitiveRateLimiter,
  authController.sendVerificationEmail,
);
router.post(
  "/resend-verification",
  authenticate,
  sensitiveRateLimiter,
  authController.resendVerification,
);
router.put("/profile", authenticate, authController.updateProfile);

module.exports = router;
