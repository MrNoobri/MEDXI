# MEDXI - Virtual Health Companion

A comprehensive digital health platform that empowers patients to track their health metrics, communicate with healthcare providers, and receive AI-powered health guidance.

## 🌟 Features

### For Patients

- **Health Metrics Tracking**: Monitor vital signs including heart rate, blood pressure, blood glucose, oxygen saturation, sleep, and steps
- **AI Health Assistant**: Get instant health information and wellness tips powered by Google Gemini 2.0
- **Wearable Device Integration**: Connect and simulate data from wearable devices (Apple Watch, Fitbit, Samsung Health)
- **Interactive Dashboard**: Visualize health trends with charts and analytics
- **Health Insights**: Receive personalized recommendations based on your health data
- **Recipe Recommendations**: Get healthy meal suggestions tailored to your dietary needs

### For Healthcare Providers

- **Patient Management**: Access patient health records and metrics
- **Real-time Monitoring**: Track patient vital signs and receive alerts
- **Provider Dashboard**: Comprehensive view of patient data and trends

### For Administrators

- **User Management**: Manage patients, providers, and system users
- **System Analytics**: Monitor platform usage and health metrics
- **Access Control**: Role-based permissions and security management

## 🚀 Tech Stack

### Frontend

- **React** (Vite) - Fast, modern UI framework
- **TanStack Query** - Efficient data fetching and caching
- **React Router** - Client-side routing
- **Recharts** - Interactive health data visualization
- **Tailwind CSS** - Utility-first styling

### Backend

- **Node.js** & **Express** - RESTful API server
- **MongoDB** with **Mongoose** - NoSQL database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Google Gemini 2.0 API** - AI-powered chatbot

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MrNoobri/MEDXI.git
cd MEDXI
```

### 2. Install Dependencies

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd ../client
npm install
```

### 3. Seed Demo Data (Optional)

```bash
cd server
npm run seed-demo
```

This creates three demo accounts with 30 days of health data:

- **Patient**: `patient@demo.com` / `demo1234`
- **Provider**: `provider@demo.com` / `demo1234`
- **Admin**: `admin@demo.com` / `demo1234`

### 4. Email Configuration (Choose Your Mode)

MEDXI supports two email modes:

#### **Option A: Maildev (Local Testing - Default)**

Perfect for development - emails are captured locally, no real emails sent.

```bash
# Start Maildev
docker compose -f docker-compose.dev.yml up maildev

# View all sent emails at: http://localhost:1080
```

Your `.env` should have:

```env
EMAIL_MODE=maildev
```

#### **Option B: Gmail SMTP (Real Emails)**

Send actual emails to real addresses for demos or production.

**Setup Steps:**

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Create a new app password (name it "MEDXI")
4. Copy the 16-character password (remove spaces)
5. Update your `.env`:

```env
EMAIL_MODE=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop  # Your 16-char app password
```

6. Restart the server

**⚠️ Important:** Never use your regular Gmail password! You MUST use an App Password.

**Toggle Anytime:**

```bash
# Switch to local testing
EMAIL_MODE=maildev npm start

# Switch to real emails
EMAIL_MODE=gmail npm start
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd server
npm start
```

Server runs on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd client
npm run dev
```

Client runs on `http://localhost:5173`

## 📱 Key Features Walkthrough

### 1. Health Metrics Dashboard

- View real-time health metrics with status indicators
- Click on any metric card to see 7-day trend charts
- Add new health metrics manually or via wearable devices

### 2. Wearable Device Simulator

- Navigate to **Wearable Devices** tab in patient dashboard
- Start the simulator to generate realistic health data every 30 seconds
- Data automatically syncs to your health metrics
- Simulator persists across tab switches

### 3. AI Health Assistant

- Click the chatbot icon to open the AI assistant
- Ask health questions like:
  - "What is a healthy diet?"
  - "How can I improve my sleep?"
  - "Tips for managing stress?"
- Receive personalized, actionable health advice powered by Gemini 2.0

### 4. Health Insights

- Get AI-generated insights based on your recent health metrics
- Receive recommendations for improving your health
- View trends and patterns in your data

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Role-based Access Control**: Patient, Provider, and Admin roles
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for secure cross-origin requests
- **Audit Logging**: Track user actions and system events

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Health Metrics

- `GET /api/health-metrics` - Get all metrics
- `GET /api/health-metrics/latest` - Get latest metrics
- `POST /api/health-metrics` - Create new metric
- `PUT /api/health-metrics/:id` - Update metric
- `DELETE /api/health-metrics/:id` - Delete metric

### AI Chatbot

- `POST /api/chatbot/message` - Send message to AI assistant
- `GET /api/chatbot/suggestions` - Get suggested questions

### Users (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 📝 Project Structure

```
MEDXI/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── package.json
│
└── README.md
```

**Built with ❤️ for better health outcomes**
