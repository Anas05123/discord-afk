# 🎮 Discord Activity Studio & 24/7 Offline AFK Suite

A complete suite for Discord custom Rich Presence with smart process auto-detection, coupled with a 24/7 cloud AFK worker that keeps your account connected to any voice room even when your physical PC is powered off.

---

## 🌟 Features

### 1. 🖥️ Discord Activity Studio (Desktop App)
- **Custom Activity & Rich Presence**: Display any custom title, details, state, timestamps, and interactive clickable buttons on your Discord profile.
- **Custom Images & Icons**: Supports Discord Application asset keys and external HTTPS image URLs (e.g. Visual Studio Code icons, custom games, anime, music art).
- **Smart Auto-Detection**:
  - Automatically watches running processes using `psutil`.
  - When **Visual Studio Code (`Code.exe`)** is running, it automatically switches your Discord presence to show your active coding session, workspace name, and elapsed timer.
  - Automatically returns to your custom preset when VS Code is closed.
- **One-Click Presets**:
  - 💻 *Visual Studio Code*
  - 🚀 *Programming & Development*
  - 🎯 *Gaming Mode*
  - ☕ *Lo-Fi Chill & Music*
  - 📚 *Study & Deep Focus*
- **Real-Time Live Preview**: Realistic Discord profile card that mirrors your changes instantaneously before applying.
- **System Tray Minimization**: Minimizes cleanly to the Windows notification tray (`pystray`) so it runs quietly in the background without cluttering your taskbar.

### 2. 🎯 Discord Quests Auto-Completer (Play-to-Claim Rewards)
- **Zero Game Download**: Complete official Discord Quests (e.g. Genshin Impact, Fortnite, Honkai: Star Rail, THE FINALS, Dead by Daylight, VALORANT, Apex Legends, Roblox, etc.) without downloading 100GB+ game files.
- **Native Process Spoofing**: Simulates genuine Windows win32 processes that Discord's desktop client detects natively via Windows Toolhelp snapshot.
- **Ultra-Lightweight**: Uses a tiny ~4KB compiled C# template binary consuming 0.0% CPU and ~12MB RAM.
- **Live 15-Minute Quest Countdown**: Built-in progress bar and timer tracking the exact 15 minutes required by Discord Quests to claim reward codes, avatar decorations, and Nitro drops.
- **Custom Executable Support**: Launch spoofers for any new game executable added to Discord Quests with one click.

### 3. ☁️ 24/7 Offline Voice Room AFK Worker
- **PC Offline Trick**: Keep your Discord account connected in any voice channel or AFK room 24/7 without needing your PC to stay on.
- **Lightweight & Resilient**: Built with raw WebSocket connection to Discord Voice Gateway with automatic heartbeat management and exponential backoff reconnection.
- **Safe by Default**: Automatically self-mutes and self-deafens to prevent microphone leaks, eliminate bandwidth consumption, and reduce Discord gateway footprints.
- **Free Cloud Ready**: Includes Dockerfile, keepalive HTTP server, and complete deployment guide for free hosting on Render.com, Koyeb, or a private VPS.

---

## 🚀 Quick Start: Running the Desktop Activity Studio

### 1. Launch with One Click
Double-click:
```bat
run_gui.bat
```
Or run via terminal:
```powershell
.venv\Scripts\python.exe main.py
```

### 2. How to Set Your Activity
1. Make sure your official **Discord Desktop app** is open.
2. Choose one of the quick presets (e.g. **VS Code**, **Programming**, **Gaming**) or type your own custom details, state, and image URLs.
3. Click **✨ Set Activity on Discord**.
4. Check your Discord profile—your new custom activity is live!
5. Toggle **Auto-Detect Visual Studio Code** to automatically update your presence whenever you open `Code.exe`.

---

## 🎨 How to Use Custom Images & Your Own Application Name

By default, the app uses pre-configured application IDs and icon URLs. If you want your own custom application name (e.g., "Playing My Custom Game" or "Developing SuperApp"):

1. Visit the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** in the top right.
3. Name it whatever you want Discord to say you are playing (e.g. `Visual Studio Code`, `Super Project`, `Anime Theater`).
4. Copy the **Application ID** (Client ID) from the General Information tab.
5. Paste this Application ID into the **Application ID** field in Discord Activity Studio.
6. *(Optional)* Go to **Rich Presence** -> **Art Assets** in the Developer Portal to upload custom images and name their keys (e.g. `logo`, `avatar`), or simply paste any direct HTTPS image link into the Large/Small Image input fields!

---

## ☁️ Setting Up the 24/7 Voice Room AFK Worker

To keep your account connected in an AFK voice room while your computer is completely turned off:
1. Open the [cloud_afk/DEPLOY_GUIDE.md](file:///C:/Users/ayari/.gemini/antigravity/scratch/discord-presence-afk/cloud_afk/DEPLOY_GUIDE.md) file.
2. Follow the 3-step walkthrough to get your channel ID, server ID, and Discord user token.
3. Deploy for free in 3 minutes to Render.com using the included `Dockerfile` and `render.yaml`.

---

## 📂 Project Structure

```
discord-presence-afk/
│
├── core/
│   ├── config_manager.py     # Configuration, defaults & preset loader
│   ├── detector.py           # Background process monitor for VS Code auto-detection
│   └── rpc_manager.py        # Discord IPC socket connection via pypresence
│
├── gui/
│   ├── main_window.py        # CustomTkinter Dark Mode GUI & live card preview
│   └── tray.py               # Windows system tray integration
│
├── cloud_afk/
│   ├── afk_worker.py         # 24/7 WebSocket voice gateway client
│   ├── keep_alive.py         # Cloud HTTP health-check server
│   ├── Dockerfile            # Container definition for cloud deployment
│   ├── render.yaml           # 1-click Render blueprint
│   ├── .env.example          # Environment variables template
│   └── DEPLOY_GUIDE.md       # Step-by-step 24/7 cloud guide
│
├── config.json               # Saved user activities & preferences
├── requirements.txt          # Python dependencies
├── main.py                   # Main entry point
└── run_gui.bat               # Windows batch launcher
```
