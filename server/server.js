require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✓ MongoDB connected successfully"))
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MEDXI API Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/health-metrics", require("./routes/healthMetrics.routes"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/messages", require("./routes/message.routes"));
app.use("/api/alerts", require("./routes/alert.routes"));
app.use("/api/chatbot", require("./routes/chatbot.routes"));
app.use("/api/googlefit", require("./routes/googlefit.routes"));
app.use("/api/gamification", require("./routes/gamification.routes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
