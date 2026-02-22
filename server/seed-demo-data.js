require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const User = require("./models/User.model");
const HealthMetric = require("./models/HealthMetric.model");
const Appointment = require("./models/Appointment.model");
const Message = require("./models/Message.model");
const Alert = require("./models/Alert.model");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✓ MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Existing provider account to attach demo data to
const PROVIDER_EMAIL = "bruh@bruh.com";

const demoPatients = [
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
    patientInfo: {
      bloodType: "A+",
      allergies: ["Penicillin", "Peanuts"],
      medications: ["Lisinopril 10mg"],
      emergencyContact: { name: "Tom Johnson", phone: "+1-555-0199" },
    },
  },
  {
    email: "patient2@demo.com",
    password: "demo1234",
    role: "patient",
    profile: {
      firstName: "James",
      lastName: "Williams",
      phone: "+1-555-0103",
      dateOfBirth: new Date("1978-11-02"),
      gender: "male",
    },
    patientInfo: {
      bloodType: "O-",
      allergies: ["Sulfa"],
      medications: ["Metformin 500mg", "Atorvastatin 20mg"],
      emergencyContact: { name: "Lisa Williams", phone: "+1-555-0198" },
    },
  },
  {
    email: "patient3@demo.com",
    password: "demo1234",
    role: "patient",
    profile: {
      firstName: "Maria",
      lastName: "Garcia",
      phone: "+1-555-0104",
      dateOfBirth: new Date("1995-08-22"),
      gender: "female",
    },
    patientInfo: {
      bloodType: "B+",
      allergies: [],
      medications: [],
      emergencyContact: { name: "Carlos Garcia", phone: "+1-555-0197" },
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

// Generate appointments spread across past, today, and future
function generateAppointments(patients, providerId) {
  const appointments = [];
  const now = new Date();
  const types = ["consultation", "follow-up", "routine-checkup", "emergency"];
  const statuses = {
    past: ["completed", "cancelled", "no-show"],
    today: ["scheduled", "confirmed", "in-progress"],
    future: ["scheduled", "confirmed"],
  };
  const reasons = [
    "Annual physical examination",
    "Follow-up on blood pressure medication",
    "Persistent headaches",
    "Blood work review",
    "Flu symptoms",
    "Diabetes management check-in",
    "Joint pain in left knee",
    "Skin rash on forearm",
    "Medication refill consultation",
    "Post-surgery follow-up",
    "Chest discomfort evaluation",
    "Routine cholesterol check",
    "Anxiety and sleep issues",
    "Back pain consultation",
    "Allergy assessment",
  ];

  // Past appointments (last 30 days)
  for (let day = 30; day >= 1; day--) {
    // 1-2 appointments per day, some days none
    if (Math.random() < 0.4) continue;

    const numAppts = Math.random() < 0.7 ? 1 : 2;
    for (let i = 0; i < numAppts; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9AM-4PM
      // Round to 30-min slots
      date.setMinutes(Math.random() < 0.5 ? 0 : 30);

      const patient = patients[Math.floor(Math.random() * patients.length)];
      const status =
        statuses.past[Math.floor(Math.random() * statuses.past.length)];

      appointments.push({
        patientId: patient._id,
        providerId,
        scheduledAt: date,
        duration: [30, 30, 45, 60][Math.floor(Math.random() * 4)],
        status,
        type: types[Math.floor(Math.random() * types.length)],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        providerNotes:
          status === "completed"
            ? "Patient examined. Vitals within normal range."
            : undefined,
        diagnosis:
          status === "completed"
            ? "No acute findings. Continue current plan."
            : undefined,
        completedAt: status === "completed" ? date : undefined,
        cancellationReason:
          status === "cancelled" ? "Patient requested rescheduling" : undefined,
        cancelledAt: status === "cancelled" ? date : undefined,
      });
    }
  }

  // Today's appointments
  const todayHours = [9, 10, 11, 13, 14, 15, 16];
  todayHours.forEach((hour, idx) => {
    if (Math.random() < 0.35) return; // skip some slots
    const date = new Date(now);
    date.setHours(hour, idx % 2 === 0 ? 0 : 30, 0, 0);

    const patient = patients[idx % patients.length];
    const status =
      statuses.today[Math.floor(Math.random() * statuses.today.length)];

    appointments.push({
      patientId: patient._id,
      providerId,
      scheduledAt: date,
      duration: [30, 45][Math.floor(Math.random() * 2)],
      status,
      type: types[Math.floor(Math.random() * types.length)],
      reason: reasons[Math.floor(Math.random() * reasons.length)],
    });
  });

  // Future appointments (next 14 days)
  for (let day = 1; day <= 14; day++) {
    if (Math.random() < 0.3) continue;

    const numAppts = Math.random() < 0.6 ? 1 : 2;
    for (let i = 0; i < numAppts; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      date.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
      date.setMinutes(Math.random() < 0.5 ? 0 : 30);

      const patient = patients[Math.floor(Math.random() * patients.length)];
      const status =
        statuses.future[Math.floor(Math.random() * statuses.future.length)];

      appointments.push({
        patientId: patient._id,
        providerId,
        scheduledAt: date,
        duration: [30, 30, 45, 60][Math.floor(Math.random() * 4)],
        status,
        type: types[Math.floor(Math.random() * types.length)],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
      });
    }
  }

  return appointments;
}

// Generate message conversations between provider and patients
function generateMessages(patients, providerId) {
  const messages = [];
  const now = new Date();

  const conversations = [
    {
      patientIdx: 0, // Sarah
      thread: [
        {
          from: "patient",
          content: "Hi Dr. Chen, I've been feeling dizzy in the mornings lately. Should I be concerned?",
          daysAgo: 3,
          hour: 9,
        },
        {
          from: "provider",
          content: "Good morning Sarah. Dizziness can have several causes. Are you staying hydrated? Have you noticed any changes in your blood pressure readings?",
          daysAgo: 3,
          hour: 10,
        },
        {
          from: "patient",
          content: "My blood pressure has been on the higher side this week. Around 138/88. I've been drinking about 6 glasses of water a day.",
          daysAgo: 3,
          hour: 10,
          minuteOffset: 15,
        },
        {
          from: "provider",
          content: "That blood pressure is slightly elevated. Try increasing your water intake to 8 glasses and reducing sodium. If the dizziness persists for more than a week, let's schedule a visit to review your medication.",
          daysAgo: 3,
          hour: 11,
        },
        {
          from: "patient",
          content: "Thank you! I'll try that. Should I keep logging my BP readings more frequently?",
          daysAgo: 3,
          hour: 11,
          minuteOffset: 20,
        },
        {
          from: "provider",
          content: "Yes, please log it twice daily - morning and evening - for the next week so we can track the trend. If it goes above 145/95, contact me immediately.",
          daysAgo: 3,
          hour: 12,
        },
        {
          from: "patient",
          content: "Will do. Also, quick question - is it okay to take my Lisinopril with breakfast instead of at night?",
          daysAgo: 2,
          hour: 8,
        },
        {
          from: "provider",
          content: "Yes, that's fine. Some patients actually get better results taking it in the morning. Just be consistent with the timing. How has the dizziness been?",
          daysAgo: 2,
          hour: 9,
        },
        {
          from: "patient",
          content: "A little better today actually! I drank more water yesterday. BP this morning was 132/84.",
          daysAgo: 2,
          hour: 9,
          minuteOffset: 30,
        },
        {
          from: "provider",
          content: "That's encouraging. Keep up the hydration and we'll review the full week of readings at your next appointment on Thursday.",
          daysAgo: 2,
          hour: 10,
        },
        {
          from: "patient",
          content: "Sounds good, see you Thursday!",
          daysAgo: 2,
          hour: 10,
          minuteOffset: 5,
        },
        {
          from: "patient",
          content: "Hi Dr. Chen, just wanted to let you know my BP this morning was 128/82. The dizziness is mostly gone!",
          daysAgo: 0,
          hour: 8,
        },
      ],
    },
    {
      patientIdx: 1, // James
      thread: [
        {
          from: "patient",
          content: "Dr. Chen, my blood glucose has been running higher than usual. I got a reading of 156 this morning.",
          daysAgo: 5,
          hour: 7,
        },
        {
          from: "provider",
          content: "Hello James. That is elevated. What did you eat last night? And have you been consistent with your Metformin?",
          daysAgo: 5,
          hour: 8,
        },
        {
          from: "patient",
          content: "I had pasta last night. I've been taking the Metformin regularly but I did miss a dose two days ago.",
          daysAgo: 5,
          hour: 8,
          minuteOffset: 20,
        },
        {
          from: "provider",
          content: "The pasta and missed dose likely contributed. Try to avoid high-carb meals in the evening and set a phone alarm for your medication. Log your fasting glucose for the next 5 days and we'll review.",
          daysAgo: 5,
          hour: 9,
        },
        {
          from: "patient",
          content: "Got it. I set an alarm. Today's reading was 142. Still high but lower than yesterday.",
          daysAgo: 4,
          hour: 7,
          minuteOffset: 30,
        },
        {
          from: "provider",
          content: "Good trend. Keep monitoring. Aim for under 130 fasting. Let me know how the rest of the week goes.",
          daysAgo: 4,
          hour: 9,
        },
        {
          from: "patient",
          content: "Update: readings have been 138, 131, 127 over the last three days. Getting better!",
          daysAgo: 1,
          hour: 10,
        },
        {
          from: "provider",
          content: "Excellent improvement James. Keep up the dietary changes and consistent medication. We'll do a full review at your appointment next week.",
          daysAgo: 1,
          hour: 11,
        },
      ],
    },
    {
      patientIdx: 2, // Maria
      thread: [
        {
          from: "patient",
          content: "Hello Dr. Chen, I wanted to ask about getting a flu shot. Is it available at the clinic?",
          daysAgo: 7,
          hour: 14,
        },
        {
          from: "provider",
          content: "Hi Maria! Yes, we have flu vaccines available. You can schedule a quick 15-minute appointment for it, or we can do it at your next routine visit.",
          daysAgo: 7,
          hour: 15,
        },
        {
          from: "patient",
          content: "Great! I'll schedule something for next week. Also, I've been thinking about starting a fitness routine. Any recommendations?",
          daysAgo: 7,
          hour: 15,
          minuteOffset: 20,
        },
        {
          from: "provider",
          content: "That's great to hear! For someone your age with no underlying conditions, I'd recommend starting with 30 minutes of moderate exercise 3-4 times a week. Walking, swimming, or cycling are excellent choices. The health tracking in the app can help you monitor your progress.",
          daysAgo: 7,
          hour: 16,
        },
        {
          from: "patient",
          content: "Perfect, I'll start walking this week. Thanks Dr. Chen!",
          daysAgo: 6,
          hour: 9,
        },
      ],
    },
  ];

  conversations.forEach(({ patientIdx, thread }) => {
    const patientId = patients[patientIdx]._id;
    const convId = Message.createConversationId(patientId, providerId);

    thread.forEach((msg) => {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - msg.daysAgo);
      timestamp.setHours(msg.hour, msg.minuteOffset || 0, 0, 0);

      const isFromPatient = msg.from === "patient";
      messages.push({
        conversationId: convId,
        senderId: isFromPatient ? patientId : providerId,
        recipientId: isFromPatient ? providerId : patientId,
        content: msg.content,
        type: "text",
        isRead: msg.daysAgo > 0, // today's messages are unread
        readAt: msg.daysAgo > 0 ? timestamp : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });
  });

  return messages;
}

// Generate health alerts based on abnormal metrics
function generateAlerts(patients) {
  const alerts = [];
  const now = new Date();

  // Sarah - high blood pressure alerts
  alerts.push(
    {
      userId: patients[0]._id,
      severity: "high",
      type: "health-metric",
      title: "Abnormal bloodPressure detected",
      message:
        "Blood pressure reading (148/94 mmHg) is higher than normal range.",
      metricSnapshot: {
        metricType: "bloodPressure",
        value: { systolic: 148, diastolic: 94 },
        unit: "mmHg",
        threshold: {
          systolic: { min: 90, max: 140 },
          diastolic: { min: 60, max: 90 },
        },
      },
      isRead: false,
      isAcknowledged: false,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      userId: patients[0]._id,
      severity: "medium",
      type: "health-metric",
      title: "Abnormal heartRate detected",
      message: "Heart rate reading (108 bpm) is higher than normal range.",
      metricSnapshot: {
        metricType: "heartRate",
        value: 108,
        unit: "bpm",
        threshold: { min: 60, max: 100 },
      },
      isRead: true,
      isAcknowledged: true,
      acknowledgedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  );

  // James - critical glucose alert
  alerts.push(
    {
      userId: patients[1]._id,
      severity: "critical",
      type: "health-metric",
      title: "Abnormal bloodGlucose detected",
      message:
        "Blood glucose reading (186 mg/dL) is significantly higher than normal range.",
      metricSnapshot: {
        metricType: "bloodGlucose",
        value: 186,
        unit: "mg/dL",
        threshold: { min: 70, max: 140 },
      },
      isRead: false,
      isAcknowledged: false,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      userId: patients[1]._id,
      severity: "medium",
      type: "health-metric",
      title: "Abnormal bloodGlucose detected",
      message:
        "Blood glucose reading (156 mg/dL) is higher than normal range.",
      metricSnapshot: {
        metricType: "bloodGlucose",
        value: 156,
        unit: "mg/dL",
        threshold: { min: 70, max: 140 },
      },
      isRead: true,
      isAcknowledged: false,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      userId: patients[1]._id,
      severity: "high",
      type: "health-metric",
      title: "Abnormal bloodPressure detected",
      message:
        "Blood pressure reading (152/96 mmHg) is higher than normal range.",
      metricSnapshot: {
        metricType: "bloodPressure",
        value: { systolic: 152, diastolic: 96 },
        unit: "mmHg",
        threshold: {
          systolic: { min: 90, max: 140 },
          diastolic: { min: 60, max: 90 },
        },
      },
      isRead: false,
      isAcknowledged: false,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  );

  // Maria - low oxygen
  alerts.push({
    userId: patients[2]._id,
    severity: "medium",
    type: "health-metric",
    title: "Abnormal oxygenSaturation detected",
    message:
      "Oxygen saturation reading (93%) is lower than normal range.",
    metricSnapshot: {
      metricType: "oxygenSaturation",
      value: 93,
      unit: "%",
      threshold: { min: 95, max: 100 },
    },
    isRead: false,
    isAcknowledged: false,
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
  });

  return alerts;
}

async function seedDatabase() {
  try {
    console.log("\n🌱 Starting database seeding...\n");

    // Look up the existing provider account
    console.log(`Looking up provider: ${PROVIDER_EMAIL}...`);
    const provider = await User.findOne({ email: PROVIDER_EMAIL });
    if (!provider) {
      console.error(`❌ Provider account "${PROVIDER_EMAIL}" not found in the database.`);
      console.error("   Please register this account first, then re-run the seed.");
      process.exit(1);
    }
    console.log(`  ✓ Found provider: ${provider.profile?.firstName} ${provider.profile?.lastName} (${provider.email})`);

    // Clear existing demo patient accounts and related data
    const patientEmails = demoPatients.map((a) => a.email);
    console.log("\nClearing existing demo patient data...");
    const existingPatients = await User.find({ email: { $in: patientEmails } });
    const existingPatientIds = existingPatients.map((u) => u._id);

    if (existingPatientIds.length > 0) {
      await HealthMetric.deleteMany({ userId: { $in: existingPatientIds } });
      await Appointment.deleteMany({ patientId: { $in: existingPatientIds } });
      await Message.deleteMany({
        $or: [
          { senderId: { $in: existingPatientIds } },
          { recipientId: { $in: existingPatientIds } },
        ],
      });
      await Alert.deleteMany({ userId: { $in: existingPatientIds } });
      await User.deleteMany({ _id: { $in: existingPatientIds } });
    }

    // Also clear any old demo appointments/messages linked to this provider
    await Appointment.deleteMany({ providerId: provider._id });
    await Message.deleteMany({
      $or: [
        { senderId: provider._id },
        { recipientId: provider._id },
      ],
    });

    // Create demo patient accounts
    console.log("\nCreating demo patient accounts...");
    const patients = [];

    for (const account of demoPatients) {
      const user = await User.create(account);
      patients.push(user);
      console.log(`  ✓ Created patient: ${account.email}`);
    }

    // Generate health metrics for all patients
    console.log("\nGenerating health metrics...");
    for (const patient of patients) {
      const metrics = generateHealthMetrics(patient._id);
      await HealthMetric.insertMany(metrics);
      console.log(
        `  ✓ Created ${metrics.length} metrics for ${patient.profile.firstName}`,
      );
    }

    // Generate appointments (linked to YOUR provider account)
    console.log("\nGenerating appointments...");
    const appointments = generateAppointments(patients, provider._id);
    await Appointment.insertMany(appointments);
    const todayCount = appointments.filter((a) => {
      const d = new Date(a.scheduledAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;
    console.log(
      `  ✓ Created ${appointments.length} appointments (${todayCount} today)`,
    );

    // Generate messages (linked to YOUR provider account)
    console.log("\nGenerating messages...");
    const messages = generateMessages(patients, provider._id);
    await Message.collection.insertMany(messages);
    const unread = messages.filter((m) => !m.isRead).length;
    console.log(
      `  ✓ Created ${messages.length} messages (${unread} unread)`,
    );

    // Generate alerts
    console.log("\nGenerating alerts...");
    const alerts = generateAlerts(patients);
    await Alert.collection.insertMany(alerts);
    const activeAlerts = alerts.filter((a) => !a.isAcknowledged).length;
    console.log(
      `  ✓ Created ${alerts.length} alerts (${activeAlerts} unacknowledged)`,
    );

    console.log("\n✅ Database seeding completed successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Provider: ${PROVIDER_EMAIL} (your existing account)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Demo patients (password: demo1234 for all):");
    console.log("  👤 patient@demo.com   (Sarah Johnson)");
    console.log("  👤 patient2@demo.com  (James Williams)");
    console.log("  👤 patient3@demo.com  (Maria Garcia)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\nSeeded data (all linked to your provider account):");
    console.log(`  📅 ${appointments.length} appointments (past, today, future)`);
    console.log(`  💬 ${messages.length} messages across 3 conversations`);
    console.log(`  🚨 ${alerts.length} health alerts`);
    console.log(`  📊 Health metrics for all 3 patients (30 days)\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
