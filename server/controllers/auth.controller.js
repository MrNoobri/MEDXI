const User = require("../models/User.model");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt.util");
const { createAuditLog } = require("../middleware/audit.middleware");

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const { email, password, role, profile, providerInfo, patientInfo } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const userData = {
      email,
      password,
      role: role || "patient",
      profile,
    };

    if (role === "provider" && providerInfo) {
      userData.providerInfo = providerInfo;
    }

    if (role === "patient" && patientInfo) {
      userData.patientInfo = patientInfo;
    }

    const user = await User.create(userData);

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Log registration
    await createAuditLog(user._id, user.role, "register", {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Update user
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Log login
    await createAuditLog(user._id, user.role, "login", {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user || !user.isActive || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id, user.role);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save();

      await createAuditLog(user._id, user.role, "logout", {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
    });
  }
};

/**
 * Get all providers (healthcare professionals)
 */
const getProviders = async (req, res) => {
  try {
    const providers = await User.find({
      role: "provider",
      isActive: true,
    }).select("profile providerInfo");

    res.json({
      success: true,
      data: providers,
    });
  } catch (error) {
    console.error("Get providers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get providers",
    });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
  getProviders,
};
