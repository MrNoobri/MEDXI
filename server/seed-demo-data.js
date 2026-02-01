require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const User = require("./models/User.model");
const HealthMetric = require("./models/HealthMetric.model");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✓ MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const demoAccounts = [
  {
    email: "patient@demo.com",
    password: "demo1234",
    role: "patient",
    profile: {
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "+1-555-0101",
      dateOfBirth: new Date("1990-05-15"),
      gender: "female",
    },
  },
  {
    email: "provider@demo.com",
    password: "demo1234",
    role: "provider",
    profile: {
      firstName: "Dr. Michael",
      lastName: "Chen",
      phone: "+1-555-0102",
      dateOfBirth: new Date("1985-03-20"),
      gender: "male",
    },
    providerInfo: {
      specialization: "General Practitioner",
      licenseNumber: "MD-12345",
      yearsOfExperience: 10,
      bio: "Experienced general practitioner with focus on preventive care.",
    },
  },
  {
    email: "admin@demo.com",
    password: "demo1234",
    role: "admin",
    profile: {
      firstName: "Admin",
      lastName: "User",
      phone: "+1-555-0100",
      dateOfBirth: new Date("1980-01-01"),
      gender: "other",
    },
  },
];

// Generate realistic health metrics for the past 30 days
function generateHealthMetrics(userId) {
  const metrics = [];
  const now = new Date();

  // Generate data for the past 30 days
  for (let day = 29; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    date.setHours(8, 0, 0, 0);

    // Heart Rate - 3 readings per day
    for (let i = 0; i < 3; i++) {
      const time = new Date(date);
      time.setHours(8 + i * 6); // 8am, 2pm, 8pm
      metrics.push({
        userId,
        metricType: "heartRate",
        value: 65 + Math.floor(Math.random() * 20), // 65-85 bpm
        unit: "bpm",
        timestamp: time,
        source: "fitbit",
      });
    }

    // Blood Pressure - 2 readings per day
    for (let i = 0; i < 2; i++) {
      const time = new Date(date);
      time.setHours(9 + i * 10); // 9am, 7pm
      const systolic = 120 + Math.floor(Math.random() * 10);
      const diastolic = 75 + Math.floor(Math.random() * 10);
      metrics.push({
        userId,
        metricType: "bloodPressure",
        value: { systolic, diastolic },
        unit: "mmHg",
        timestamp: time,
        source: "manual",
      });
    }

    // Daily Steps
    metrics.push({
      userId,
      metricType: "steps",
      value: 6000 + Math.floor(Math.random() * 6000), // 6,000-12,000 steps
      unit: "steps",
      timestamp: new Date(date.setHours(23, 59, 0, 0)),
      source: "fitbit",
    });

    // Sleep - one entry per night
    metrics.push({
      userId,
      metricType: "sleep",
      value: 6.5 + Math.random() * 2, // 6.5-8.5 hours
      unit: "hours",
      timestamp: new Date(date.setHours(7, 0, 0, 0)),
      source: "fitbit",
    });

    // Weight - every 3 days
    if (day % 3 === 0) {
      metrics.push({
        userId,
        metricType: "weight",
        value: 70 + Math.random() * 2, // 70-72 kg (slight variation)
        unit: "kg",
        timestamp: new Date(date.setHours(7, 30, 0, 0)),
        source: "manual",
      });
    }

    // Blood Glucose - every 2 days
    if (day % 2 === 0) {
      metrics.push({
        userId,
        metricType: "bloodGlucose",
        value: 90 + Math.floor(Math.random() * 20), // 90-110 mg/dL
        unit: "mg/dL",
        timestamp: new Date(date.setHours(8, 0, 0, 0)),
        source: "manual",
      });
    }

    // Oxygen Saturation - once daily
    metrics.push({
      userId,
      metricType: "oxygenSaturation",
      value: 96 + Math.floor(Math.random() * 4), // 96-100%
      unit: "%",
      timestamp: new Date(date.setHours(9, 0, 0, 0)),
      source: "manual",
    });

    // Temperature - once daily
    metrics.push({
      userId,
      metricType: "temperature",
      value: 36.5 + Math.random() * 0.7, // 36.5-37.2°C
      unit: "°C",
      timestamp: new Date(date.setHours(8, 0, 0, 0)),
      source: "manual",
    });
  }

  return metrics;
}

async function seedDatabase() {
  try {
    console.log("\n🌱 Starting database seeding...\n");

    // Clear existing demo accounts
    console.log("Clearing existing demo accounts...");
    await User.deleteMany({ email: { $in: demoAccounts.map((a) => a.email) } });

    // Create demo accounts
    console.log("Creating demo accounts...");
    const createdUsers = [];

    for (const account of demoAccounts) {
      // Don't hash password here - the User model pre-save hook will handle it
      const user = await User.create(account);
      createdUsers.push(user);
      console.log(`✓ Created ${account.role}: ${account.email}`);
    }

    // Find the patient account
    const patientUser = createdUsers.find((u) => u.role === "patient");

    if (patientUser) {
      // Clear existing health metrics for this patient
      console.log("\nClearing existing health metrics...");
      await HealthMetric.deleteMany({ userId: patientUser._id });

      // Generate and insert health metrics
      console.log("Generating health metrics for past 30 days...");
      const metrics = generateHealthMetrics(patientUser._id);
      await HealthMetric.insertMany(metrics);
      console.log(`✓ Created ${metrics.length} health metric entries`);
    }

    console.log("\n✅ Database seeding completed successfully!\n");
    console.log("Demo Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👤 Patient:");
    console.log("   Email: patient@demo.com");
    console.log("   Password: demo1234");
    console.log("");
    console.log("👨‍⚕️ Provider:");
    console.log("   Email: provider@demo.com");
    console.log("   Password: demo1234");
    console.log("");
    console.log("👔 Admin:");
    console.log("   Email: admin@demo.com");
    console.log("   Password: demo1234");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
