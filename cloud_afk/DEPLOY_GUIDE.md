# 24/7 Discord Voice Room AFK Cloud Deployment Guide

This guide explains how to deploy your Discord AFK Engine to the cloud for free, so your account stays in voice channels and shows your custom Rich Presence 24/7, **even when your PC is completely turned off**.

---

## 🚀 How It Works (Cloud Architecture)

1. **Cloud Control Plane (Dashboard)**:
   - Hosted at: `https://discord-afk-keepalive.anas05123.workers.dev/dashboard`
   - You can open this URL from your mobile phone, tablet, or browser anytime.
   - When you pick a voice room or activity preset, it saves your choice in real time.

2. **24/7 Cloud Voice Engine**:
   - Runs in a free cloud container (Render.com or Koyeb.com).
   - Polls your dashboard every 2.5 seconds to immediately apply any changes made from your phone.
   - Connects directly to Discord Gateway:
     - Stays in your target voice channel.
     - Automatically adapts if server bots/admins move you to another channel (no fighting or disconnecting).
     - Keeps you online with your selected Rich Presence game/app.

---

## ⚡ Option 1: Deploy Free on Render.com (Recommended & Easiest)

Render gives you 750 free hours per month (enough for 24/7 all month long).

### Step 1: Sign Up / Log In
1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Sign in with your GitHub account (`Anas05123`).

### Step 2: Create Web Service
1. Click the **New +** button in the top right, then select **Web Service**.
2. Select your repository: **`Anas05123/discord-afk`**.
3. Configure the settings:
   - **Name**: `discord-247-afk`
   - **Region**: Choose the closest region (e.g. Frankfurt or Oregon).
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --omit=dev || true`
   - **Start Command**: `node cloud_afk/voice_daemon.mjs`
   - **Instance Type**: **Free**
4. Under **Environment Variables**, click **Add Environment Variable**:
   - Key: `DISCORD_TOKEN`
   - Value: `Your Discord User Token`
   *(Optional)*:
   - Key: `WORKER_URL`
   - Value: `https://discord-afk-keepalive.anas05123.workers.dev`
5. Click **Deploy Web Service**!

### Step 3: Prevent Free Tier Sleep (Keep Awake)
Render's free web services sleep after 15 minutes of inactivity. To keep it awake 24/7:
1. Copy your Render web service URL (e.g., `https://discord-247-afk.onrender.com`).
2. Go to [cron-job.org](https://cron-job.org) or [uptimerobot.com](https://uptimerobot.com) (100% free).
3. Create an HTTP monitor pinging your Render URL every **10 minutes**.
4. That's it! Your worker will now run 24/7 non-stop!

---

## 🛡️ Option 2: Deploy on Koyeb.com (Never Sleeps, 100% Free)

Koyeb offers a free Eco/Nano service that **does not sleep**, so you don't even need UptimeRobot!

1. Go to [https://app.koyeb.com](https://app.koyeb.com) and log in with GitHub.
2. Click **Create App** -> **GitHub**.
3. Select `Anas05123/discord-afk`.
4. Choose **Dockerfile** or **Node.js**:
   - Run Command: `node cloud_afk/voice_daemon.mjs`
5. Under **Environment Variables**, add:
   - `DISCORD_TOKEN` = `Your Discord User Token`
   - `PORT` = `10000`
6. Click **Deploy**!

---

## 📱 Controlling Everything from Your Phone

Once deployed on Render or Koyeb:
1. Shut down your PC completely.
2. Open on your phone:
   **`https://discord-afk-keepalive.anas05123.workers.dev/dashboard`**
3. Select any voice room from the live dropdown and tap **Join Voice Room (AFK)**.
4. Select any preset (e.g., *VALORANT*, *Visual Studio Code*, *Adobe Illustrator*).
5. Open your Discord mobile app: You will see your account sitting in the voice channel with your custom activity live!
