# 24/7 Discord Voice Room AFK Worker — Complete Deployment Guide

This guide explains how to deploy the AFK worker to a free cloud server so your Discord account stays in your desired voice room 24/7, **even when your computer is completely turned off**.

---

## 1. Retrieve Required Discord IDs

### A. Turn on Developer Mode
1. Open Discord desktop or web.
2. Go to **User Settings** (the gear icon ⚙️ next to your avatar).
3. Scroll down on the left sidebar and select **Advanced**.
4. Toggle **Developer Mode** to **ON**.

### B. Copy Server (Guild) ID
1. Right-click on the server icon in your server list.
2. Click **Copy Server ID**.
3. Save this value (this is your `GUILD_ID`).

### C. Copy Voice Channel ID
1. Right-click on the specific Voice Channel or AFK Room you want to stay in.
2. Click **Copy Channel ID**.
3. Save this value (this is your `CHANNEL_ID`).

---

## 2. Retrieve Your Discord User Token

> [!WARNING]
> Your Discord token acts as your digital password. **Never share it with anyone or commit it to a public GitHub repository.**

1. Open your browser (Google Chrome, Edge, or Brave) and navigate to [https://discord.com/app](https://discord.com/app).
2. Log into your account.
3. Press `F12` (or `Ctrl + Shift + I`) to open the **Developer Tools**.
4. Click on the **Network** tab in DevTools.
5. In the filter box at the top, type `science` or `/api`.
6. Click anywhere in Discord (e.g. click into a text channel or open settings).
7. In the Network tab list, click any request (e.g. `science` or `messages`).
8. On the right panel, scroll down to **Request Headers**.
9. Locate the header named `authorization`.
10. Copy the string value next to it (without the word "authorization:"). This is your `DISCORD_TOKEN`.

---

## 3. Deploying 24/7 for Free on Render.com

Render offers free web service hosting that runs Docker or Python continuously.

### Step 1: Upload to GitHub (Private Repository)
1. Create a **Private** repository on [GitHub](https://github.com/new) (e.g. `discord-afk-worker`).
2. Push the files inside the `cloud_afk/` folder:
   - `afk_worker.py`
   - `keep_alive.py`
   - `requirements.txt`
   - `Dockerfile`
   - `render.yaml`

### Step 2: Create Web Service on Render
1. Go to [https://render.com](https://render.com) and sign up / log in with GitHub.
2. Click **New +** -> **Web Service**.
3. Select your private repository.
4. Settings:
   - **Name**: `discord-247-afk`
   - **Environment**: `Python` (or `Docker`)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -u afk_worker.py`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add:
   - `DISCORD_TOKEN` = `<your_token>`
   - `GUILD_ID` = `<your_guild_id>`
   - `CHANNEL_ID` = `<your_channel_id>`
   - `SELF_MUTE` = `true`
   - `SELF_DEAF` = `true`
   - `PORT` = `10000`
6. Click **Create Web Service**.

### Step 3: Prevent Free Tier Sleep (24/7 Keep-Alive)
Render free services spin down after 15 minutes of HTTP inactivity. The worker includes a built-in HTTP server on port 10000 to keep it awake!
1. Copy your Render service URL (e.g. `https://discord-247-afk.onrender.com`).
2. Go to [cron-job.org](https://cron-job.org) or [uptimerobot.com](https://uptimerobot.com) (100% free).
3. Create a free HTTP monitor that pings your URL every **10 minutes**.
4. Your worker will now run uninterrupted 24 hours a day, 7 days a week!

---

## 4. Alternative: Run on a Local 24/7 Device (Raspberry Pi or Phone)

If you have a Raspberry Pi or spare Android phone running Termux:
```bash
cd cloud_afk
pip install -r requirements.txt
python afk_worker.py
```

---

## 5. Security & Safety Recommendations
- **Self-Mute & Self-Deafen**: Always keep these set to `true`. This prevents microphone audio leaks and ensures you consume zero voice bandwidth.
- **Do Not Rapidly Switch Rooms**: Rapidly jumping between voice channels triggers Discord gateway rate limits. Let the worker stay peacefully in your chosen room.
- **Account Age**: Use an established Discord account rather than an account created minutes ago.
