# Google Fit API Setup Instructions

## Prerequisites
- Google Account
- Google Cloud Console access

## Step-by-Step Setup

### 1. Create Google Cloud Project
1. Go to: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Project name: **MEDXI** (or your preferred name)
4. Click "Create"

### 2. Enable Google Fit API
1. In the Google Cloud Console, go to: **APIs & Services** → **Library**
2. Search for: **Fitness API**
3. Click on **Fitness API**
4. Click **Enable**

### 3. Configure OAuth Consent Screen
1. Go to: **APIs & Services** → **OAuth consent screen**
2. User Type: Select **External**
3. Click **Create**

**Fill in the form:**
- App name: `MEDXI Health Platform`
- User support email: `your-email@gmail.com`
- Developer contact email: `your-email@gmail.com`
- Click **Save and Continue**

**Scopes:**
- Click **Add or Remove Scopes**
- Search and add these scopes:
  - `https://www.googleapis.com/auth/fitness.activity.read`
  - `https://www.googleapis.com/auth/fitness.heart_rate.read`
  - `https://www.googleapis.com/auth/fitness.blood_pressure.read`
  - `https://www.googleapis.com/auth/fitness.blood_glucose.read`
  - `https://www.googleapis.com/auth/fitness.oxygen_saturation.read`
  - `https://www.googleapis.com/auth/fitness.body.read`
  - `https://www.googleapis.com/auth/fitness.sleep.read`
- Click **Update** → **Save and Continue**

**Test users:**
- Click **Add Users**
- Add your email: `your-email@gmail.com`
- Click **Add** → **Save and Continue**

### 4. Create OAuth Credentials
1. Go to: **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `MEDXI Backend`

**Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:5000
```

**Authorized redirect URIs:**
```
http://localhost:5000/api/googlefit/callback
```

5. Click **Create**
6. **COPY** the Client ID and Client Secret - you'll need these!

### 5. Add Environment Variables

Open `server/.env` and add:

```env
# Google Fit API
GOOGLE_FIT_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=your-client-secret-here
GOOGLE_FIT_REDIRECT_URI=http://localhost:5000/api/googlefit/callback
```

Replace `your-client-id-here` and `your-client-secret-here` with the values from step 4.

### 6. Install Google Fit App (For iPhone Users)

1. Download **Google Fit** from the App Store (free)
2. Open Google Fit app
3. Sign in with your Google account
4. Grant permission to access Apple Health data
5. Go to Settings → Connected apps → Apple Health
6. Enable all health data types

### 7. Testing

1. Start backend: `cd server && npm start`
2. Start frontend: `cd client && npm run dev`
3. Login to MEDXI web app
4. Go to Dashboard → Wearables tab
5. Click **Connect Google Fit**
6. Authorize Google Fit access
7. Click **Sync Now** to fetch your health data

## For Production Deployment

When deploying to production, update:

**Google Cloud Console:**
- Authorized JavaScript origins: `https://your-domain.com`
- Authorized redirect URIs: `https://api.your-domain.com/api/googlefit/callback`

**Environment Variables:**
```env
GOOGLE_FIT_REDIRECT_URI=https://api.your-domain.com/api/googlefit/callback
```

## Troubleshooting

### Error: "Access blocked: MEDXI has not completed the Google verification process"
**Solution:** App is in testing mode. Add your email as a test user in OAuth consent screen.

### Error: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URI in Google Cloud Console exactly matches your .env file.

### No data showing after sync
**Solution:** 
1. Make sure Google Fit app has permission to read Apple Health
2. Check that there's actually data in Google Fit
3. Try manually opening Google Fit app to trigger a sync
4. Wait a few minutes and try "Sync Now" again

### Token expired error
**Solution:** Disconnect and reconnect Google Fit. Refresh tokens will be stored automatically.

## Data Synced

The integration automatically syncs:
- ✅ Steps (daily totals)
- ✅ Heart rate (hourly averages)
- ✅ Sleep duration (daily totals in hours)
- ✅ Blood pressure (if available)
- ✅ Blood glucose (if available)
- ✅ Oxygen saturation (if available)

Data is synced for the **last 7 days** when you click "Sync Now".

---

**Questions?** Check the Google Fit API docs: https://developers.google.com/fit/rest
