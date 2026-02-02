const { google } = require("googleapis");
const User = require("../models/User.model");
const HealthMetric = require("../models/HealthMetric.model");

// Google Fit OAuth2 Client Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_FIT_CLIENT_ID,
  process.env.GOOGLE_FIT_CLIENT_SECRET,
  process.env.GOOGLE_FIT_REDIRECT_URI || "http://localhost:5000/api/googlefit/callback"
);

// Scopes for Google Fit
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.blood_pressure.read",
  "https://www.googleapis.com/auth/fitness.blood_glucose.read",
  "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
  "https://www.googleapis.com/auth/fitness.body.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
];

/**
 * Get Google Fit OAuth URL
 * Frontend calls this to redirect user to Google consent screen
 */
const getAuthUrl = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      state: userId, // Pass user ID to identify after OAuth
      prompt: "consent", // Force consent screen to get refresh token
    });

    res.json({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    console.error("Error generating Google Fit auth URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate authorization URL",
    });
  }
};

/**
 * Handle OAuth callback from Google
 * Google redirects here after user authorizes
 */
const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code || !userId) {
      return res.redirect(`${process.env.CLIENT_URL}/dashboard?error=auth_failed`);
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens to user document
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/dashboard?error=user_not_found`);
    }

    // Store tokens securely
    user.googleFitTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    };
    user.googleFitConnected = true;
    await user.save();

    // Initial sync
    await syncGoogleFitData(userId);

    res.redirect(`${process.env.CLIENT_URL}/dashboard?googlefit=connected`);
  } catch (error) {
    console.error("Error handling Google Fit callback:", error);
    res.redirect(`${process.env.CLIENT_URL}/dashboard?error=auth_failed`);
  }
};

/**
 * Disconnect Google Fit
 */
const disconnect = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.googleFitConnected = false;
    user.googleFitTokens = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Google Fit disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting Google Fit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to disconnect Google Fit",
    });
  }
};

/**
 * Get connection status
 */
const getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("googleFitConnected");

    res.json({
      success: true,
      data: {
        connected: user.googleFitConnected || false,
      },
    });
  } catch (error) {
    console.error("Error getting Google Fit status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get connection status",
    });
  }
};

/**
 * Manual sync - fetch latest data from Google Fit
 */
const syncData = async (req, res) => {
  try {
    const userId = req.user._id;
    await syncGoogleFitData(userId);

    res.json({
      success: true,
      message: "Google Fit data synced successfully",
    });
  } catch (error) {
    console.error("Error syncing Google Fit data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync Google Fit data",
    });
  }
};

/**
 * Helper function: Sync Google Fit data to database
 */
async function syncGoogleFitData(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.googleFitConnected || !user.googleFitTokens) {
      throw new Error("Google Fit not connected");
    }

    // Set up OAuth client with user's tokens
    const userOAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_FIT_CLIENT_ID,
      process.env.GOOGLE_FIT_CLIENT_SECRET,
      process.env.GOOGLE_FIT_REDIRECT_URI
    );

    userOAuth2Client.setCredentials({
      access_token: user.googleFitTokens.accessToken,
      refresh_token: user.googleFitTokens.refreshToken,
      expiry_date: user.googleFitTokens.expiryDate,
    });

    const fitness = google.fitness({ version: "v1", auth: userOAuth2Client });

    // Time range: last 7 days
    const endTime = Date.now();
    const startTime = endTime - 7 * 24 * 60 * 60 * 1000;

    // Data source IDs for different metrics
    const dataSources = {
      steps: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
      heartRate: "derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm",
      bloodPressure: "derived:com.google.blood_pressure:com.google.android.gms:merged",
      bloodGlucose: "derived:com.google.blood_glucose:com.google.android.gms:merged",
      oxygen: "derived:com.google.oxygen_saturation:com.google.android.gms:merged",
      sleep: "derived:com.google.sleep.segment:com.google.android.gms:merged",
    };

    // Fetch Steps
    try {
      const stepsResponse = await fitness.users.dataset.aggregate({
        userId: "me",
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: "com.google.step_count.delta",
            },
          ],
          bucketByTime: { durationMillis: 86400000 }, // Daily buckets
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        },
      });

      if (stepsResponse.data.bucket) {
        for (const bucket of stepsResponse.data.bucket) {
          if (bucket.dataset && bucket.dataset[0]?.point) {
            for (const point of bucket.dataset[0].point) {
              const steps = point.value?.[0]?.intVal;
              if (steps > 0) {
                await HealthMetric.findOneAndUpdate(
                  {
                    user: userId,
                    type: "steps",
                    recordedAt: new Date(parseInt(point.startTimeNanos) / 1000000),
                  },
                  {
                    value: steps,
                    source: "google_fit",
                  },
                  { upsert: true, new: true }
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Steps data not available or error:", error.message);
    }

    // Fetch Heart Rate
    try {
      const heartRateResponse = await fitness.users.dataset.aggregate({
        userId: "me",
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: "com.google.heart_rate.bpm",
            },
          ],
          bucketByTime: { durationMillis: 3600000 }, // Hourly buckets
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        },
      });

      if (heartRateResponse.data.bucket) {
        for (const bucket of heartRateResponse.data.bucket) {
          if (bucket.dataset && bucket.dataset[0]?.point) {
            for (const point of bucket.dataset[0].point) {
              const heartRate = point.value?.[0]?.fpVal;
              if (heartRate > 0) {
                await HealthMetric.findOneAndUpdate(
                  {
                    user: userId,
                    type: "heart_rate",
                    recordedAt: new Date(parseInt(point.startTimeNanos) / 1000000),
                  },
                  {
                    value: Math.round(heartRate),
                    unit: "bpm",
                    source: "google_fit",
                  },
                  { upsert: true, new: true }
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Heart rate data not available or error:", error.message);
    }

    // Fetch Sleep (total duration per day)
    try {
      const sleepResponse = await fitness.users.dataset.aggregate({
        userId: "me",
        requestBody: {
          aggregateBy: [
            {
              dataTypeName: "com.google.sleep.segment",
            },
          ],
          bucketByTime: { durationMillis: 86400000 }, // Daily buckets
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        },
      });

      if (sleepResponse.data.bucket) {
        for (const bucket of sleepResponse.data.bucket) {
          if (bucket.dataset && bucket.dataset[0]?.point) {
            let totalSleepMinutes = 0;
            for (const point of bucket.dataset[0].point) {
              const startNanos = parseInt(point.startTimeNanos);
              const endNanos = parseInt(point.endTimeNanos);
              const durationMinutes = (endNanos - startNanos) / 1000000 / 1000 / 60;
              totalSleepMinutes += durationMinutes;
            }

            if (totalSleepMinutes > 0) {
              const sleepHours = (totalSleepMinutes / 60).toFixed(1);
              await HealthMetric.findOneAndUpdate(
                {
                  user: userId,
                  type: "sleep",
                  recordedAt: new Date(parseInt(bucket.startTimeMillis)),
                },
                {
                  value: parseFloat(sleepHours),
                  unit: "hours",
                  source: "google_fit",
                },
                { upsert: true, new: true }
              );
            }
          }
        }
      }
    } catch (error) {
      console.log("Sleep data not available or error:", error.message);
    }

    console.log(`✓ Google Fit data synced for user ${userId}`);
  } catch (error) {
    console.error("Error in syncGoogleFitData:", error);
    throw error;
  }
}

module.exports = {
  getAuthUrl,
  handleCallback,
  disconnect,
  getStatus,
  syncData,
};
