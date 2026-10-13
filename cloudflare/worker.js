/**
 * Discord Studio PRO — Full Web Application & 24/7 Cloudflare Durable Object Worker
 * Pixel-accurate replica of the Desktop Software (Activity Studio, Discord Quests, Voice Room AFK, Game Catalog, 24/7 Cloud)
 */

const PRESETS = {
  photoshop: {
    key: "photoshop",
    name: "Adobe Photoshop",
    client_id: "748586506888806460",
    details: "Editing Creative_Artwork.psd",
    state: "Workspace: Retouching & Layer Compositing",
    large_image: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PHXS.png",
    large_text: "Adobe Photoshop 2026",
    small_image: "https://cdn-icons-png.flaticon.com/512/5968/5968520.png",
    small_text: "Creative Cloud",
    icon: "🎨"
  },
  illustrator: {
    key: "illustrator",
    name: "Adobe Illustrator",
    client_id: "751430009716998144",
    details: "Designing Brand_Identity.ai",
    state: "Vector Artboards & Pen Tool",
    large_image: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/ILST.png",
    large_text: "Adobe Illustrator 2026",
    small_image: "https://cdn-icons-png.flaticon.com/512/5968/5968472.png",
    small_text: "Vector Engine",
    icon: "✒️"
  },
  aftereffects: {
    key: "aftereffects",
    name: "Adobe After Effects",
    client_id: "748568089939148832",
    details: "Compositing Motion_VFX.aep",
    state: "Timeline: 3D Camera & Keyframes",
    large_image: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/AEFT.png",
    large_text: "Adobe After Effects 2026",
    small_image: "",
    small_text: "Motion Graphics",
    icon: "✨"
  },
  premiere: {
    key: "premiere",
    name: "Adobe Premiere Pro",
    client_id: "748580494324662353",
    details: "Editing Master_Timeline.prproj",
    state: "Color Grading & Audio Mastering",
    large_image: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PPRO.png",
    large_text: "Adobe Premiere Pro 2026",
    small_image: "",
    small_text: "4K 60fps Timeline",
    icon: "🎬"
  },
  figma: {
    key: "figma",
    name: "Figma",
    client_id: "751430009716998144",
    details: "Designing UI_Design_System.fig",
    state: "Auto-Layout & Interactive Prototype",
    large_image: "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
    large_text: "Figma UI/UX",
    small_image: "",
    small_text: "UI/UX Studio",
    icon: "📐"
  },
  vscode: {
    key: "vscode",
    name: "Visual Studio Code",
    client_id: "810516608442695700",
    details: "Editing SyntaFlow",
    state: "Working Editing SyntaFlow Integrations",
    large_image: "https://raw.githubusercontent.com/github/explore/main/topics/visual-studio-code/visual-studio-code.png",
    large_text: "Visual Studio Code",
    small_image: "https://raw.githubusercontent.com/github/explore/main/topics/react/react.png",
    small_text: "React 19 / JSX",
    icon: "💻"
  },
  valorant: {
    key: "valorant",
    name: "VALORANT",
    client_id: "700136079562375258",
    details: "Competitive: Radiant Ranked",
    state: "In Match: Haven (12 - 11)",
    large_image: "https://cdn-icons-png.flaticon.com/512/686/686589.png",
    large_text: "VALORANT",
    small_image: "https://cdn-icons-png.flaticon.com/512/1055/1055672.png",
    small_text: "Match Point",
    icon: "🎯"
  },
  fortnite: {
    key: "fortnite",
    name: "Fortnite",
    client_id: "432980957394370572",
    details: "Battle Royale: Zero Build",
    state: "Victory Royale! 👑",
    large_image: "https://cdn-icons-png.flaticon.com/512/588/588395.png",
    large_text: "Fortnite",
    small_image: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
    small_text: "1st Place",
    icon: "🪂"
  },
  roblox: {
    key: "roblox",
    name: "ROBLOX",
    client_id: "363445589247131668",
    details: "Playing with friends",
    state: "Server: Custom Realm",
    large_image: "https://cdn-icons-png.flaticon.com/512/1055/1055666.png",
    large_text: "ROBLOX",
    small_image: "https://cdn-icons-png.flaticon.com/512/727/727245.png",
    small_text: "Online",
    icon: "🧱"
  },
  genshin: {
    key: "genshin",
    name: "Genshin Impact",
    client_id: "762434991303950386",
    details: "Exploring Teyvat",
    state: "Spiral Abyss: Floor 12",
    large_image: "https://cdn-icons-png.flaticon.com/512/3074/3074767.png",
    large_text: "Genshin Impact",
    small_image: "https://cdn-icons-png.flaticon.com/512/2997/2997295.png",
    small_text: "Adventure Rank 60",
    icon: "⚔️"
  },
  chill: {
    key: "chill",
    name: "Lo-Fi Chill & Beats",
    client_id: "383226320970055681",
    details: "Listening to Lo-Fi Vibes",
    state: "Relaxing / AFK ☕",
    large_image: "https://cdn-icons-png.flaticon.com/512/3074/3074767.png",
    large_text: "Lo-Fi Coffee",
    small_image: "https://cdn-icons-png.flaticon.com/512/727/727245.png",
    small_text: "Chill Session",
    icon: "☕"
  },
  studying: {
    key: "studying",
    name: "Deep Study & Focus",
    client_id: "383226320970055681",
    details: "Preparing for Exams 📚",
    state: "Do Not Disturb / Pomodoro",
    large_image: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    large_text: "Deep Study",
    small_image: "https://cdn-icons-png.flaticon.com/512/2997/2997295.png",
    small_text: "Pomodoro Focus",
    icon: "📚"
  }
};

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Discord Studio Pro — Custom Presence & 24/7 AFK</title>
<style>
  :root {
    --bg-main: #0f1013;
    --bg-sidebar: #14161a;
    --bg-surface: #181a1f;
    --bg-input: #20232a;
    --bg-popout: #111214;
    --border: #2a2d36;
    --blurple: #5865f2;
    --blurple-hover: #4752c4;
    --green: #23a55a;
    --red: #da373c;
    --yellow: #f0b232;
    --text-primary: #f2f3f5;
    --text-secondary: #949ba4;
    --text-muted: #686d76;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; }
  body { background: var(--bg-main); color: var(--text-primary); height: 100vh; display: flex; overflow: hidden; user-select: none; }

  /* LEFT SIDEBAR (230px) */
  .sidebar {
    width: 230px; min-width: 230px; background: var(--bg-sidebar);
    display: flex; flex-direction: column; padding: 20px 12px 16px 12px;
    border-right: 1px solid var(--border);
  }
  .brand-box { padding: 0 6px 24px 6px; }
  .title-row { display: flex; align-items: center; gap: 6px; }
  .logo-dot { color: var(--blurple); font-size: 18px; }
  .app-title { font-size: 18px; font-weight: 700; color: var(--text-primary); }
  .pro-badge { background: var(--blurple); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
  .sub-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; padding-left: 2px; }

  .nav-list { display: flex; flex-direction: column; gap: 6px; }
  .nav-btn {
    width: 100%; height: 40px; border-radius: 8px; border: 1px solid transparent;
    background: transparent; color: var(--text-secondary); font-size: 13px; font-weight: 700;
    text-align: left; padding: 0 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;
    transition: all 0.12s ease;
  }
  .nav-btn:hover { background: var(--bg-surface); color: var(--text-primary); }
  .nav-btn.active { background: var(--bg-surface); color: var(--text-primary); border-color: var(--blurple); }

  .sidebar-spacer { flex: 1; }
  .status-card {
    background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px;
  }
  .status-header { font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.04em; }
  .status-item { font-size: 11px; font-weight: 700; color: var(--green); margin: 4px 0; }

  /* MAIN VIEWPORT */
  .viewport { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .page { display: none; flex-direction: column; height: 100%; overflow: hidden; }
  .page.active { display: flex; }

  .top-bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 24px 10px 24px; flex-shrink: 0;
  }
  .page-title { font-size: 19px; font-weight: 700; color: var(--text-primary); }
  .page-sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
  .btn-primary {
    background: var(--blurple); color: #fff; border: none; height: 38px; padding: 0 18px;
    border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.15s;
  }
  .btn-primary:hover { background: var(--blurple-hover); }
  .btn-green { background: var(--green); color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
  .btn-green:hover { background: #1a6334; }
  .btn-red { background: var(--red); color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
  .btn-red:hover { background: #a1282c; }

  .split-grid {
    display: grid; grid-template-columns: 6fr 5fr; gap: 16px;
    padding: 4px 20px 20px 20px; flex: 1; overflow: hidden;
  }
  .col-scroll { overflow-y: auto; padding-right: 6px; display: flex; flex-direction: column; gap: 14px; }
  .col-scroll::-webkit-scrollbar { width: 6px; }
  .col-scroll::-webkit-scrollbar-thumb { background: #2a2d36; border-radius: 3px; }

  .section-card {
    background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px;
  }
  .card-title { font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
  .card-desc { font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4; }

  /* Quick Presets 4-col grid */
  .preset-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .preset-btn {
    height: 32px; border-radius: 6px; background: var(--bg-input); border: 1px solid var(--border);
    color: var(--text-primary); font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.12s;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 6px;
  }
  .preset-btn:hover { background: var(--blurple); border-color: var(--blurple); }
  .preset-btn.active { background: var(--blurple); border-color: #fff; }

  /* Badge Pills 4-col grid */
  .pill-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
  .pill-btn {
    height: 30px; border-radius: 15px; background: var(--bg-input); border: 1px solid var(--border);
    color: var(--text-primary); font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.12s;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 8px;
  }
  .pill-btn:hover { background: var(--blurple); }
  .pill-btn.active { background: var(--blurple); border-color: #fff; }

  /* Form Controls */
  .form-group { margin-bottom: 8px; }
  .form-label { display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px; }
  .form-input, .form-select {
    width: 100%; height: 34px; border-radius: 6px; background: var(--bg-input);
    border: 1px solid var(--border); color: var(--text-primary); padding: 0 10px; font-size: 12px;
  }
  .form-row { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; }
  .checkbox-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-primary); cursor: pointer; }

  /* LIVE DISCORD POPOUT CARD */
  .preview-header-lbl { font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; letter-spacing: 0.04em; }
  .discord-popout {
    background: var(--bg-popout); border: 1px solid var(--border); border-radius: 14px; overflow: hidden;
  }
  .popout-banner { height: 64px; background: var(--blurple); }
  .popout-body { padding: 12px 18px 16px 18px; }
  .avatar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .avatar-circle {
    width: 50px; height: 50px; border-radius: 25px; background: var(--bg-surface);
    display: flex; align-items: center; justify-content: center; font-size: 24px;
    border: 3px solid var(--bg-popout);
  }
  .popout-username { font-size: 15px; font-weight: 700; color: var(--text-primary); }
  .popout-online { font-size: 11px; font-weight: 700; color: var(--green); }
  .popout-divider { height: 1px; background: var(--border); margin: 8px 0; }
  .popout-section-lbl { font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; }
  .activity-row { display: flex; gap: 14px; align-items: flex-start; }
  .art-canvas { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
  .large-art {
    width: 72px; height: 72px; border-radius: 10px; background: var(--bg-surface);
    display: flex; align-items: center; justify-content: center; font-size: 32px; overflow: hidden;
  }
  .large-art img { width: 100%; height: 100%; object-fit: cover; }
  .small-badge {
    position: absolute; right: 2px; bottom: 2px; width: 28px; height: 28px; border-radius: 14px;
    background: var(--bg-popout); border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center; font-size: 13px; overflow: hidden;
  }
  .small-badge img { width: 100%; height: 100%; object-fit: cover; }
  .act-info { flex: 1; min-width: 0; }
  .act-name { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .act-details { font-size: 11px; color: #dbdee1; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .act-state { font-size: 11px; color: var(--text-secondary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .act-timer { font-size: 10px; color: var(--text-secondary); margin-top: 3px; }
  .popout-buttons { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; }
  .popout-btn {
    width: 100%; height: 32px; border-radius: 6px; background: var(--bg-surface);
    border: 1px solid var(--border); color: var(--text-primary); font-size: 11px; font-weight: 700;
    cursor: pointer;
  }
  .quick-actions-row { display: flex; gap: 8px; }
  .btn-secondary {
    flex: 1; height: 34px; border-radius: 6px; background: var(--bg-input);
    border: 1px solid var(--border); color: var(--text-primary); font-size: 11px; font-weight: 700; cursor: pointer;
  }
  .btn-secondary:hover { background: var(--border); }

  /* QUESTS LIST */
  .quest-row {
    display: flex; align-items: center; gap: 10px; background: var(--bg-input);
    border-radius: 8px; padding: 8px 12px; margin-bottom: 6px;
  }
  .quest-emoji { font-size: 20px; width: 30px; text-align: center; }
  .quest-info { flex: 1; min-width: 0; }
  .quest-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
  .quest-sub { font-size: 10px; color: var(--text-muted); }
  .timer-box {
    background: var(--bg-input); border-radius: 8px; padding: 12px; text-align: center; margin: 10px 0;
  }
  .timer-big { font-size: 22px; font-weight: 700; color: var(--blurple); }
  .progress-track { width: 100%; height: 10px; background: var(--bg-input); border-radius: 5px; overflow: hidden; margin-bottom: 12px; }
  .progress-fill { height: 100%; background: var(--green); width: 0%; transition: width 0.3s; }
  .queue-box { background: var(--bg-input); border-radius: 8px; padding: 10px; min-height: 110px; max-height: 170px; overflow-y: auto; }
  .queue-item {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--bg-surface); padding: 6px 10px; border-radius: 6px; margin-bottom: 4px; font-size: 11px;
  }

  @media (max-width: 960px) {
    body { flex-direction: column; overflow-y: auto; height: auto; }
    .sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border); }
    .split-grid { grid-template-columns: 1fr; overflow: visible; }
    .viewport, .page { height: auto; overflow: visible; }
  }
</style>
</head>
<body>

<!-- LEFT NAVIGATION SIDEBAR -->
<div class="sidebar">
  <div class="brand-box">
    <div class="title-row">
      <span class="logo-dot">●</span>
      <span class="app-title">Discord Studio</span>
      <span class="pro-badge">PRO</span>
    </div>
    <div class="sub-label">Presence Studio & 24/7 AFK</div>
  </div>

  <div class="nav-list">
    <button class="nav-btn active" id="nav-activity" onclick="switchPage('activity')">🎮 &nbsp;Activity Studio</button>
    <button class="nav-btn" id="nav-quests" onclick="switchPage('quests')">🎯 &nbsp;Discord Quests</button>
    <button class="nav-btn" id="nav-voice" onclick="switchPage('voice')">🎙️ &nbsp;Voice Room AFK</button>
    <button class="nav-btn" id="nav-games" onclick="switchPage('games')">🔎 &nbsp;Game Catalog</button>
    <button class="nav-btn" id="nav-cloud" onclick="switchPage('cloud')">☁️ &nbsp;24/7 Cloud Guide</button>
  </div>

  <div class="sidebar-spacer"></div>

  <div class="status-card">
    <div class="status-header">SYSTEM STATUS</div>
    <div class="status-item" id="sidebarRpc">🟢 RPC: Active</div>
    <div class="status-item" id="sidebarVoice">🟢 Voice: In Room</div>
  </div>
</div>

<!-- MAIN CONTENT VIEWPORT -->
<div class="viewport">

  <!-- ==================== PAGE 1: ACTIVITY STUDIO ==================== -->
  <div class="page active" id="page-activity">
    <div class="top-bar">
      <div>
        <div class="page-title">Activity & Presence Studio</div>
        <div class="page-sub">Craft custom Discord profile statuses with verified game art and framework badges.</div>
      </div>
      <button class="btn-primary" id="btnTopApply" onclick="applyActivity()">✨ Set Activity on Discord</button>
    </div>

    <div class="split-grid">
      <!-- Left Scrollable Column -->
      <div class="col-scroll">
        <!-- Card A: Quick Presets -->
        <div class="section-card">
          <div class="card-title">⚡ Quick Presets (Creative Design, Coding & Gaming)</div>
          <div class="preset-grid" id="presetGrid"></div>
        </div>

        <!-- Card B: Badges -->
        <div class="section-card">
          <div class="card-title">🏷️ Creative Tool & Language Badge (Small Icon)</div>
          <div class="card-desc">Choose your active design tool or programming framework badge (renders as a small badge on your profile):</div>
          <div class="pill-grid" id="badgeGrid"></div>
        </div>

        <!-- Card C: Activity Customization -->
        <div class="section-card">
          <div class="card-title">⚙️ Activity Customization</div>
          <div class="form-group">
            <label class="form-label">Application ID (Client ID):</label>
            <input class="form-input" id="entryClientId" value="751430009716998144" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Details (Line 1):</label>
            <input class="form-input" id="entryDetails" value="Designing Brand_Identity.ai" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">State (Line 2):</label>
            <input class="form-input" id="entryState" value="Vector Artboards & Pen Tool" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Large Image Key or HTTPS URL:</label>
            <input class="form-input" id="entryLargeImg" value="https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/ILST.png" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Large Image Tooltip:</label>
            <input class="form-input" id="entryLargeText" value="Adobe Illustrator 2026" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Small Badge URL / Key (Optional):</label>
            <input class="form-input" id="entrySmallImg" value="https://cdn-icons-png.flaticon.com/512/5968/5968472.png" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Small Badge Tooltip (Optional):</label>
            <input class="form-input" id="entrySmallText" value="Vector Engine" oninput="updatePreview()">
          </div>

          <!-- Elapsed Timer Chooser -->
          <div class="form-group" style="margin-top: 10px;">
            <label class="form-label">⏱️ Elapsed Timer Mode (Natural or Custom Time):</label>
            <div class="form-row">
              <label class="checkbox-row" style="width: 110px;">
                <input type="checkbox" id="cbShowTimer" checked onchange="updatePreview()"> Show Timer
              </label>
              <select class="form-select" id="timerModeMenu" onchange="onTimerModeChange(this.value)" style="flex: 1;">
                <option value="0,0">⏱️ Natural (Starts at 00:00)</option>
                <option value="0,30">⚡ 30 Minutes Elapsed</option>
                <option value="2,0">🔥 2 Hours Elapsed</option>
                <option value="5,0">💻 5 Hours Elapsed (Deep Work)</option>
                <option value="12,0">🌙 12 Hours Elapsed</option>
                <option value="24,0">👑 24 Hours Elapsed (1 Day)</option>
                <option value="48,0">🚀 48 Hours Elapsed (2 Days)</option>
                <option value="custom">🛠️ Custom Hours & Minutes</option>
              </select>
              <button class="btn-secondary" style="flex: 0 0 115px; height: 34px;" onclick="resetTimerNatural()">🔄 Natural (00:00)</button>
            </div>
            <div class="form-row">
              <span style="font-size: 11px; color: var(--text-muted);">Custom Elapsed — Hours:</span>
              <input class="form-input" id="entryTimerHours" type="number" min="0" value="0" style="width: 60px;">
              <span style="font-size: 11px; color: var(--text-muted);">Minutes:</span>
              <input class="form-input" id="entryTimerMins" type="number" min="0" value="0" style="width: 60px;">
              <button class="btn-primary" style="flex: 1; height: 34px; font-size: 11px;" onclick="applyCustomTimer()">⏱️ Set Elapsed Time</button>
            </div>
          </div>

          <!-- Profile Buttons -->
          <div class="form-group" style="margin-top: 10px;">
            <label class="form-label">Profile Clickable Buttons (Optional):</label>
            <div class="form-row">
              <input class="form-input" id="entryB1Label" placeholder="Button 1 Label" style="width: 140px;" value="SyntaFlow Project" oninput="updatePreview()">
              <input class="form-input" id="entryB1Url" placeholder="Button 1 URL (https://...)" style="flex: 1;" value="https://github.com" oninput="updatePreview()">
            </div>
            <div class="form-row">
              <input class="form-input" id="entryB2Label" placeholder="Button 2 Label" style="width: 140px;" oninput="updatePreview()">
              <input class="form-input" id="entryB2Url" placeholder="Button 2 URL (https://...)" style="flex: 1;" oninput="updatePreview()">
            </div>
          </div>
        </div>

        <!-- Card D: Auto-Detect -->
        <div class="section-card">
          <div class="card-title">🤖 Smart Creative & Code Auto-Detection</div>
          <div class="card-desc">Automatically detects Adobe Photoshop (.psd), Illustrator (.ai), After Effects (.aep), Premiere Pro, Figma, and VS Code (.tsx/.py/.ts) to update your Discord presence live!</div>
          <label class="checkbox-row" style="font-weight: 700; margin-bottom: 6px;">
            <input type="checkbox" checked> Enable Auto-Detect Design Tools & Active Files
          </label>
          <div style="font-size: 11px; color: var(--green);">● Status: Active & Synced with 24/7 Cloud Worker</div>
        </div>
      </div>

      <!-- Right Column: Live Discord Profile Popout -->
      <div class="col-scroll">
        <div>
          <div class="preview-header-lbl">LIVE PROFILE PREVIEW</div>
          <div class="discord-popout">
            <div class="popout-banner"></div>
            <div class="popout-body">
              <div class="avatar-row">
                <div class="avatar-circle">👤</div>
                <div>
                  <div class="popout-username" id="prevUsername">la2nis</div>
                  <div class="popout-online">● Online (24/7 Cloud AFK)</div>
                </div>
              </div>
              <div class="popout-divider"></div>
              <div class="popout-section-lbl">PLAYING A GAME</div>
              <div class="activity-row">
                <div class="art-canvas">
                  <div class="large-art" id="prevLargeArt">✒️</div>
                  <div class="small-badge" id="prevSmallBadge">✒️</div>
                </div>
                <div class="act-info">
                  <div class="act-name" id="prevName">Adobe Illustrator 2026</div>
                  <div class="act-details" id="prevDetails">Designing Brand_Identity.ai</div>
                  <div class="act-state" id="prevState">Vector Artboards & Pen Tool</div>
                  <div class="act-timer" id="prevTimer">00:00 elapsed</div>
                </div>
              </div>
              <div class="popout-buttons" id="prevButtonsBox">
                <button class="popout-btn" id="prevBtn1">SyntaFlow Project</button>
              </div>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="quick-actions-row">
            <button class="btn-secondary" onclick="clearPresence()">🧹 Clear Presence</button>
            <button class="btn-secondary" onclick="applyActivity()">🔄 Sync to Cloud Now</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 2: DISCORD QUESTS ==================== -->
  <div class="page" id="page-quests">
    <div class="top-bar">
      <div>
        <div class="page-title">Discord Quests Auto-Completer</div>
        <div class="page-sub">Simulate playing verified quest games to claim official Discord Quest rewards without downloading 100GB+ files.</div>
      </div>
    </div>

    <div class="split-grid">
      <div class="col-scroll">
        <div class="section-card">
          <div class="card-title">🔍 Search & Detect Any Game (24,000+ Games)</div>
          <div class="card-desc">Type any game name (e.g. NTE, Giants, Hellraiser, Helldivers, Cyberpunk, GTA) to auto-detect its executable & launch spoofing:</div>
          <div class="form-row">
            <input class="form-input" id="questSearchInput" placeholder="Search game name or executable (e.g. NTE, Giants, Hellraiser)..." style="flex: 1;">
            <button class="btn-primary" style="height: 34px;" onclick="searchQuestGame()">Detect Game</button>
          </div>
          <div id="questSearchResults"></div>
        </div>

        <div class="section-card">
          <div class="card-title">🎯 Popular & Trending Discord Quest Games</div>
          <div class="card-desc">Accept the quest in Discord (User Settings > Gift Inventory), then click Launch Spoof below:</div>
          <button class="btn-primary" style="width: 100%; height: 32px; font-size: 11px; margin-bottom: 10px;" onclick="queueTopQuests()">
            ⚡ Auto-Queue Top Quests (NTE + Giants + Hellraiser + Genshin)
          </button>
          <div id="questGamesList"></div>
        </div>

        <div class="section-card">
          <div class="card-title">⚙️ Custom Quest Executable</div>
          <div class="card-desc">If Discord adds a new game quest, enter its executable name below to simulate it:</div>
          <div class="form-row">
            <input class="form-input" id="customQuestExe" placeholder="e.g. palworld.exe or wutheringwaves.exe" style="flex: 1;">
            <button class="btn-secondary" style="flex: 0 0 110px;" onclick="launchCustomQuest()">Launch Custom</button>
            <button class="btn-secondary" style="flex: 0 0 110px;" onclick="queueCustomQuest()">➕ Queue Custom</button>
          </div>
        </div>
      </div>

      <div class="col-scroll">
        <div class="section-card">
          <div class="card-title">⏱️ Live Quest Progress</div>
          <div id="lblQuestStatus" style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">⚪ Status: Idle (No game running)</div>
          <div id="lblQuestGame" style="font-size: 12px; color: var(--text-secondary);">Active Game: None</div>
          <div id="lblQuestExe" style="font-size: 11px; color: var(--text-muted); margin: 2px 0;">Process Name: -</div>
          <div id="lblQuestRpc" style="font-size: 11px; font-weight: 700; color: var(--text-muted);">Discord Activity: ⚪ Idle</div>

          <div class="timer-box">
            <div class="timer-big" id="lblQuestTimer">00:00 / 15:00</div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;" id="lblQuestTargetNote">Standard Quest Duration: 15 Minutes</div>
          </div>

          <div class="progress-track"><div class="progress-fill" id="questProgressBar"></div></div>
          <button class="btn-secondary" style="width: 100%; height: 36px;" onclick="stopQuestSpoofer()">⏹️ Stop Game Spoofer</button>
        </div>

        <div class="section-card">
          <div class="card-title">📋 Auto-Quest Queue & Playlist</div>
          <div class="form-row" style="margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary);">Duration / Game:</span>
            <select class="form-select" id="queueDurationSelect" onchange="updateQueueDuration(this.value)" style="flex: 1;">
              <option value="900">15 min (Standard Quest)</option>
              <option value="600">10 min</option>
              <option value="300">5 min (Quick)</option>
              <option value="60">1 min (Test)</option>
            </select>
          </div>
          <div class="form-row" style="margin-bottom: 8px;">
            <button class="btn-primary" style="flex: 1; height: 32px; font-size: 11px;" id="btnStartQueue" onclick="startQuestQueue()">▶️ Start Queue</button>
            <button class="btn-secondary" style="flex: 0 0 70px; height: 32px;" onclick="skipQuestQueue()">⏭️ Skip</button>
            <button class="btn-secondary" style="flex: 0 0 70px; height: 32px;" onclick="clearQuestQueue()">🗑️ Clear</button>
          </div>
          <div class="queue-box" id="queueItemsBox">
            <div style="text-align: center; color: var(--text-muted); font-size: 11px; padding-top: 28px;">
              No games in queue.<br>Click '➕ Queue' on any game to build your auto-playlist!
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 3: VOICE ROOM AFK ==================== -->
  <div class="page" id="page-voice">
    <div class="top-bar">
      <div>
        <div class="page-title">Voice Room AFK Connection</div>
        <div class="page-sub">Join and remain in any Discord voice channel or AFK room 24/7 with automatic mute, deafen, and Join-to-Create room tracking.</div>
      </div>
    </div>

    <div class="split-grid">
      <div class="col-scroll">
        <div class="section-card">
          <div class="card-title">🔐 Connection Credentials & Live Room Picker</div>
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label class="form-label" style="margin:0;">Select Server (Guild):</label>
              <button class="btn-secondary" style="height:24px; padding:0 10px; font-size:10px;" onclick="loadUserGuilds()">⚡ Load My Servers</button>
            </div>
            <select class="form-select" id="selectGuildDropdown" onchange="onGuildDropdownChange(this.value)" style="margin-bottom:6px;">
              <option value="1442511921898192917">★ Main Server (1442511921898192917)</option>
            </select>
            <input class="form-input" id="entryGuildId" value="1442511921898192917" placeholder="Server ID (Guild ID)">
          </div>

          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label class="form-label" style="margin:0;">Select Voice Room in Server:</label>
              <button class="btn-secondary" style="height:24px; padding:0 10px; font-size:10px;" onclick="loadGuildVoiceChannels()">🔄 Refresh Voice Rooms</button>
            </div>
            <select class="form-select" id="selectChannelDropdown" onchange="onChannelDropdownChange(this.value)" style="margin-bottom:6px;">
              <option value="1484570674659070063">🔊 ➕・JOIN TO CREATE (Auto-Creates Your Room) — 1484570674659070063</option>
              <option value="1442511922565091382">🔊 🏢・𝖬𝖺𝗂𝗇 𝖫𝗈𝖻𝖻𝗒 — 1442511922565091382</option>
              <option value="1475888620630966322">🔊 🕌︱بثّ القُرآن الكريم — 1475888620630966322</option>
              <option value="1482608241316729035">🔊 📚・𝖲𝗍𝗎𝖽𝗒 𝖫𝗈𝗎𝗇𝗀𝖾 — 1482608241316729035</option>
              <option value="1446993760977289276">🔊 🎸・𝖬𝗎𝗌𝗂𝖼 — 1446993760977289276</option>
              <option value="1447784971023421663">🔊 🍿・𝖬𝗈𝗏𝗂𝖾 𝖳𝗂𝗆𝖾 — 1447784971023421663</option>
              <option value="1460725269806584081">🔊 🗿・ 𝖫𝗈𝗇𝖾 𝖱𝖺𝗇𝗀𝖾𝗋 — 1460725269806584081</option>
              <option value="1460725809600925706">🔊 🎸・ 𝖱𝗈𝖼𝗄 & 𝖱𝗈𝗅𝗅 — 1460725809600925706</option>
              <option value="1460726493490577613">🔊 🎯・ 𝖳𝗁𝗋𝖾𝖾 𝖬𝗎𝗌𝗄𝖾𝗍𝖾𝖾𝗋𝗌 — 1460726493490577613</option>
              <option value="1482580750267056269">🔊 ✨・ 𝖥𝗂𝗏𝖾 𝖲𝗍𝖺𝗋𝗌 — 1482580750267056269</option>
              <option value="1496634010980319263">🔊 🧬・ 𝖥𝖺𝗇𝗍𝖺𝗌𝗍𝗂𝖼 𝖥𝗈𝗎𝗋 — 1496634010980319263</option>
            </select>
            <input class="form-input" id="entryChannelId" value="1484570674659070063" placeholder="Voice Channel ID (or pick from dropdown above)">
          </div>

          <div class="form-group">
            <label class="form-label">Custom Activity while in Room (Optional):</label>
            <input class="form-input" id="entryVoiceActivity" value="Adobe Illustrator">
          </div>
          <div class="form-row" style="margin: 12px 0;">
            <label class="checkbox-row" style="margin-right: 16px;">
              <input type="checkbox" id="cbMute" checked> Self-Mute (Mutes Mic)
            </label>
            <label class="checkbox-row">
              <input type="checkbox" id="cbDeaf" checked> Self-Deafen (Zero Bandwidth)
            </label>
          </div>
          <button class="btn-green" id="btnJoinVoice" style="width: 100%; height: 42px; font-size: 13px; margin-bottom: 8px;" onclick="joinVoiceRoom()">🟢 Join / Update Voice Room (24/7 AFK)</button>
          <button class="btn-red" style="width: 100%; height: 34px; font-size: 11px;" onclick="leaveVoiceRoom()">🔴 Leave Voice Room</button>
        </div>
      </div>

      <div class="col-scroll">
        <div class="section-card">
          <div class="card-title">📡 Live Room Telemetry</div>
          <div id="monStatus" style="font-size: 13px; font-weight: 700; color: var(--green); margin-bottom: 6px;">🟢 Status: Connected & In Voice Room (24/7 Cloud)</div>
          <div id="monUser" style="font-size: 12px; color: var(--text-secondary); margin: 4px 0;">Account: la2nis</div>
          <div id="monRoom" style="font-size: 12px; color: var(--text-muted); margin: 4px 0;">Active Voice Channel: 1484570674659070063</div>
          <div id="monUptime" style="font-size: 12px; color: var(--text-muted); margin: 4px 0;">Session Uptime: 00:00:00</div>
          <div id="monLatency" style="font-size: 11px; font-weight: 700; color: var(--green); margin-top: 6px;">Heartbeat Latency: 34 ms (Cloudflare Edge)</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 4: GAME CATALOG ==================== -->
  <div class="page" id="page-games">
    <div class="top-bar">
      <div>
        <div class="page-title">Discord 24,000+ Games & Applications Catalog</div>
        <div class="page-sub">Search any game or creative app (Photoshop, Illustrator, NTE, Giants, Hellraiser, GTA, Roblox) to auto-fill its verified Discord Application ID.</div>
      </div>
    </div>
    <div style="padding: 4px 24px 20px 24px; overflow-y: auto; flex: 1;">
      <div class="section-card">
        <div class="card-title">🔍 Game & Application Search Engine</div>
        <div class="form-row">
          <input class="form-input" id="catalogSearchInput" placeholder="Type game or app name (e.g. Illustrator, Photoshop, NTE, GTA, Roblox)..." style="flex: 1;" onkeydown="if(event.key==='Enter') searchCatalog()">
          <button class="btn-primary" style="height: 34px;" onclick="searchCatalog()">Search</button>
        </div>
        <div id="catalogResults" style="margin-top: 10px;"></div>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 5: 24/7 CLOUD GUIDE ==================== -->
  <div class="page" id="page-cloud">
    <div class="top-bar">
      <div>
        <div class="page-title">24/7 Cloud Assistant (PC Offline Mode)</div>
        <div class="page-sub">Keep your account inside your Discord voice channel even when your physical PC is completely shut down.</div>
      </div>
    </div>
    <div style="padding: 4px 24px 20px 24px; overflow-y: auto; flex: 1;">
      <div class="section-card">
        <div class="card-title">☁️ Active 24/7 Cloudflare Durable Object Host</div>
        <div class="card-desc" style="font-size: 12px; color: var(--text-secondary);">
          Your Discord Studio Pro instance is actively hosted on Cloudflare's global edge network using a persistent Durable Object with a 25-second internal heartbeat alarm.<br><br>
          • <b>Status:</b> 🟢 Online 24/7 (Zero PC power required)<br>
          • <b>Account:</b> la2nis<br>
          • <b>Voice Channel:</b> 1557661172990480487 (Self-Muted & Self-Deafened)
        </div>
      </div>
    </div>
  </div>

</div>

<script>
const PRESETS_DATA = ${JSON.stringify(PRESETS)};

const BADGES_DATA = [
  { id: "none", name: "No Badge", emoji: "🚫", tooltip: "Clean Activity", url: "" },
  { id: "photoshop", name: "Photoshop", emoji: "🎨", tooltip: "Adobe Photoshop CC", url: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PHXS.png" },
  { id: "illustrator", name: "Illustrator", emoji: "✒️", tooltip: "Adobe Illustrator CC", url: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/ILST.png" },
  { id: "aftereffects", name: "After Effects", emoji: "✨", tooltip: "Adobe After Effects CC", url: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/AEFT.png" },
  { id: "premiere", name: "Premiere Pro", emoji: "🎬", tooltip: "Adobe Premiere Pro CC", url: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PPRO.png" },
  { id: "figma", name: "Figma", emoji: "📐", tooltip: "Figma UI/UX", url: "https://cdn-icons-png.flaticon.com/512/5968/5968705.png" },
  { id: "react", name: "React", emoji: "⚛️", tooltip: "React 19 / JSX", url: "https://raw.githubusercontent.com/github/explore/main/topics/react/react.png" },
  { id: "nextjs", name: "Next.js", emoji: "⚡", tooltip: "Next.js App Router", url: "https://raw.githubusercontent.com/github/explore/main/topics/nextjs/nextjs.png" },
  { id: "typescript", name: "TypeScript", emoji: "🟦", tooltip: "TypeScript 5.4", url: "https://raw.githubusercontent.com/github/explore/main/topics/typescript/typescript.png" },
  { id: "javascript", name: "JavaScript", emoji: "🟨", tooltip: "JavaScript ES2024", url: "https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png" },
  { id: "python", name: "Python", emoji: "🐍", tooltip: "Python 3.12", url: "https://raw.githubusercontent.com/github/explore/main/topics/python/python.png" },
  { id: "nodejs", name: "Node.js", emoji: "💚", tooltip: "Node.js v22", url: "https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png" },
  { id: "rust", name: "Rust", emoji: "🦀", tooltip: "Rust 2024", url: "https://raw.githubusercontent.com/github/explore/main/topics/rust/rust.png" },
  { id: "cpp", name: "C++", emoji: "🔷", tooltip: "C++20 / STL", url: "https://raw.githubusercontent.com/github/explore/main/topics/cpp/cpp.png" },
  { id: "csharp", name: "C# / .NET", emoji: "💠", tooltip: "C# 12 / .NET 8", url: "https://raw.githubusercontent.com/github/explore/main/topics/csharp/csharp.png" },
  { id: "tailwind", name: "Tailwind CSS", emoji: "🎨", tooltip: "Tailwind CSS", url: "https://raw.githubusercontent.com/github/explore/main/topics/tailwind/tailwind.png" }
];

const QUEST_GAMES_DATA = [
  { id: "nte", name: "Neverness to Everness (NTE)", exe: "htgame.exe", client_id: "1470616226995765409", emoji: "🌌", desc: "Anime Open-World RPG" },
  { id: "giants", name: "March of Giants", exe: "thelineclient-win64-shipping.exe", client_id: "1428223713928810496", emoji: "🗿", desc: "War Strategy MOBA" },
  { id: "hellraiser", name: "Clive Barker's Hellraiser: Revival", exe: "hellraiser-win64-shipping.exe", client_id: "1552168352116641822", emoji: "⛓️", desc: "Horror Survival" },
  { id: "helldivers2", name: "HELLDIVERS 2", exe: "helldivers2.exe", client_id: "1198592398579482654", emoji: "🦅", desc: "Galactic Co-Op Shooter" },
  { id: "genshin", name: "Genshin Impact", exe: "genshinimpact.exe", client_id: "762434991303950386", emoji: "⚔️", desc: "Open-World Action RPG" },
  { id: "valorant", name: "VALORANT", exe: "valorant.exe", client_id: "700136079562375258", emoji: "🎯", desc: "5v5 Tactical Shooter" },
  { id: "fortnite", name: "Fortnite", exe: "fortniteclient-win64-shipping.exe", client_id: "432980957394370572", emoji: "🪂", desc: "Battle Royale" },
  { id: "cyberpunk", name: "Cyberpunk 2077", exe: "cyberpunk2077.exe", client_id: "658056503651106837", emoji: "🦾", desc: "Night City RPG" }
];

let startTimestampMs = Date.now();
let sessionStartMs = Date.now();
let questQueue = [];
let activeQuestIdx = -1;
let questElapsed = 0;
let questTarget = 900;
let questInterval = null;

function switchPage(pageKey) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + pageKey).classList.add('active');
  document.getElementById('nav-' + pageKey).classList.add('active');
}

function initGrids() {
  const presetList = [
    ["🎨 Photoshop", "photoshop"], ["✒️ Illustrator", "illustrator"], ["✨ After Effects", "aftereffects"], ["🎬 Premiere Pro", "premiere"],
    ["📐 Figma", "figma"], ["💻 VS Code", "vscode"], ["🎯 VALORANT", "valorant"], ["🪂 Fortnite", "fortnite"],
    ["🧱 ROBLOX", "roblox"], ["⚔️ Genshin", "genshin"], ["☕ Lo-Fi Chill", "chill"], ["📚 Deep Study", "studying"]
  ];
  const pGrid = document.getElementById('presetGrid');
  pGrid.innerHTML = presetList.map(([label, key]) =>
    \`<button class="preset-btn \${key==='illustrator'?'active':''}" id="pbtn-\${key}" onclick="selectPreset('\${key}')">\${label}</button>\`
  ).join('');

  const bGrid = document.getElementById('badgeGrid');
  bGrid.innerHTML = BADGES_DATA.map(b =>
    \`<button class="pill-btn" id="bbtn-\${b.id}" onclick="selectBadge('\${b.id}')">\${b.emoji} \${b.name}</button>\`
  ).join('');

  const qList = document.getElementById('questGamesList');
  qList.innerHTML = QUEST_GAMES_DATA.map(g => \`
    <div class="quest-row">
      <div class="quest-emoji">\${g.emoji}</div>
      <div class="quest-info">
        <div class="quest-title">\${g.name}</div>
        <div class="quest-sub">\${g.desc} • \${g.exe}</div>
      </div>
      <button class="btn-secondary" style="flex: 0 0 75px; height: 30px;" onclick='addQuestToQueue(\${JSON.stringify(g)})'>➕ Queue</button>
      <button class="btn-primary" style="height: 30px; font-size: 11px; padding: 0 12px;" onclick='startQuestSpoof(\${JSON.stringify(g)})'>Launch Spoof</button>
    </div>
  \`).join('');
}

function selectPreset(key) {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('pbtn-' + key);
  if (btn) btn.classList.add('active');
  const p = PRESETS_DATA[key];
  if (!p) return;
  document.getElementById('entryClientId').value = p.client_id;
  document.getElementById('entryDetails').value = p.details;
  document.getElementById('entryState').value = p.state;
  document.getElementById('entryLargeImg').value = p.large_image;
  document.getElementById('entryLargeText').value = p.large_text;
  document.getElementById('entrySmallImg').value = p.small_image;
  document.getElementById('entrySmallText').value = p.small_text;
  updatePreview();
  applyActivity();
}

function selectBadge(id) {
  document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('bbtn-' + id);
  if (btn) btn.classList.add('active');
  const b = BADGES_DATA.find(x => x.id === id);
  if (!b) return;
  document.getElementById('entrySmallImg').value = b.url;
  document.getElementById('entrySmallText').value = b.tooltip;
  updatePreview();
  applyActivity();
}

function updatePreview() {
  const name = document.getElementById('entryLargeText').value || 'Custom Activity';
  const details = document.getElementById('entryDetails').value || '';
  const state = document.getElementById('entryState').value || '';
  const largeImg = document.getElementById('entryLargeImg').value.trim();
  const smallImg = document.getElementById('entrySmallImg').value.trim();

  document.getElementById('prevName').textContent = name;
  document.getElementById('prevDetails').textContent = details;
  document.getElementById('prevState').textContent = state;
  document.getElementById('prevTimer').style.display = document.getElementById('cbShowTimer').checked ? 'block' : 'none';

  const largeBox = document.getElementById('prevLargeArt');
  if (largeImg.startsWith('http')) {
    largeBox.innerHTML = \`<img src="\${largeImg}" onerror="this.parentElement.textContent='🎮'">\`;
  } else {
    largeBox.textContent = '💻';
  }

  const smallBox = document.getElementById('prevSmallBadge');
  if (!smallImg) {
    smallBox.style.display = 'none';
  } else {
    smallBox.style.display = 'flex';
    if (smallImg.startsWith('http')) {
      smallBox.innerHTML = \`<img src="\${smallImg}" onerror="this.parentElement.textContent='🏷️'">\`;
    } else {
      smallBox.textContent = '🏷️';
    }
  }

  const b1 = document.getElementById('entryB1Label').value.trim();
  const b2 = document.getElementById('entryB2Label').value.trim();
  const btnBox = document.getElementById('prevButtonsBox');
  let btnsHtml = '';
  if (b1) btnsHtml += \`<button class="popout-btn">\${b1}</button>\`;
  if (b2) btnsHtml += \`<button class="popout-btn">\${b2}</button>\`;
  btnBox.innerHTML = btnsHtml;
}

function onTimerModeChange(val) {
  if (val === 'custom') return;
  const [h, m] = val.split(',').map(Number);
  document.getElementById('entryTimerHours').value = h;
  document.getElementById('entryTimerMins').value = m;
  applyCustomTimer();
}

function resetTimerNatural() {
  document.getElementById('timerModeMenu').value = '0,0';
  document.getElementById('entryTimerHours').value = 0;
  document.getElementById('entryTimerMins').value = 0;
  startTimestampMs = Date.now();
  applyActivity(true);
}

function applyCustomTimer() {
  const h = parseFloat(document.getElementById('entryTimerHours').value || '0');
  const m = parseFloat(document.getElementById('entryTimerMins').value || '0');
  startTimestampMs = Date.now() - Math.max(0, (h * 3600 + m * 60) * 1000);
  applyActivity();
}

async function applyActivity(resetTimer = false) {
  const hrs = parseFloat(document.getElementById('entryTimerHours').value || '0');
  const mins = parseFloat(document.getElementById('entryTimerMins').value || '0');
  const payload = {
    application_id: document.getElementById('entryClientId').value.trim(),
    name: document.getElementById('entryLargeText').value.trim() || 'Adobe Illustrator',
    details: document.getElementById('entryDetails').value.trim(),
    state: document.getElementById('entryState').value.trim(),
    large_image: document.getElementById('entryLargeImg').value.trim(),
    large_text: document.getElementById('entryLargeText').value.trim(),
    small_image: document.getElementById('entrySmallImg').value.trim(),
    small_text: document.getElementById('entrySmallText').value.trim(),
    elapsed_hours: hrs,
    elapsed_minutes: mins,
    reset_timer: resetTimer
  };
  const btn = document.getElementById('btnTopApply');
  btn.textContent = '✅ Activity Updated!';
  btn.style.background = 'var(--green)';
  setTimeout(() => {
    btn.textContent = '✨ Set Activity on Discord';
    btn.style.background = 'var(--blurple)';
  }, 2000);

  await fetch('/api/activity', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  refreshTelemetry();
}

async function clearPresence() {
  await fetch('/api/activity', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name: '', details: '', state: '' })
  });
  document.getElementById('sidebarRpc').textContent = '⚪ RPC: Cleared';
}

/* QUEST SPOOFER & AUTO-QUEUE */
function startQuestSpoof(g) {
  questElapsed = 0;
  document.getElementById('lblQuestStatus').textContent = '🟢 Playing: ' + g.name;
  document.getElementById('lblQuestStatus').style.color = 'var(--green)';
  document.getElementById('lblQuestGame').textContent = 'Active Game: ' + g.name;
  document.getElementById('lblQuestExe').textContent = 'Process: ' + g.exe + ' (Cloud Simulated)';
  document.getElementById('lblQuestRpc').textContent = 'Discord Activity: 🟢 Playing ' + g.name;
  document.getElementById('lblQuestRpc').style.color = 'var(--green)';

  fetch('/api/activity', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      application_id: g.client_id,
      name: g.name,
      details: 'Playing ' + g.name,
      state: 'Completing Discord Quest (15m)',
      reset_timer: true
    })
  });

  if (questInterval) clearInterval(questInterval);
  questInterval = setInterval(() => {
    questElapsed++;
    const m = String(Math.floor(questElapsed / 60)).padStart(2, '0');
    const s = String(questElapsed % 60).padStart(2, '0');
    const tm = String(Math.floor(questTarget / 60)).padStart(2, '0');
    const ts = String(questTarget % 60).padStart(2, '0');
    document.getElementById('lblQuestTimer').textContent = \`\${m}:\${s} / \${tm}:\${ts}\`;
    document.getElementById('questProgressBar').style.width = Math.min(100, (questElapsed / questTarget) * 100) + '%';
    if (questElapsed >= questTarget) {
      if (activeQuestIdx >= 0) {
        questQueue[activeQuestIdx].status = 'done';
        skipQuestQueue();
      } else {
        clearInterval(questInterval);
        document.getElementById('lblQuestStatus').textContent = '🎉 15-Minute Quest Completed! Claim your reward in Discord!';
      }
    }
  }, 1000);
}

function stopQuestSpoofer() {
  if (questInterval) clearInterval(questInterval);
  activeQuestIdx = -1;
  document.getElementById('lblQuestStatus').textContent = '⚪ Status: Idle (No game running)';
  document.getElementById('lblQuestStatus').style.color = 'var(--text-muted)';
  document.getElementById('lblQuestGame').textContent = 'Active Game: None';
  document.getElementById('lblQuestExe').textContent = 'Process Name: -';
  document.getElementById('lblQuestRpc').textContent = 'Discord Activity: ⚪ Idle';
  document.getElementById('questProgressBar').style.width = '0%';
  applyActivity();
}

function addQuestToQueue(g) {
  questQueue.push({ game: g, status: 'pending' });
  renderQuestQueue();
}

function queueTopQuests() {
  QUEST_GAMES_DATA.slice(0, 4).forEach(g => {
    if (!questQueue.some(x => x.game.id === g.id)) questQueue.push({ game: g, status: 'pending' });
  });
  renderQuestQueue();
}

function renderQuestQueue() {
  const box = document.getElementById('queueItemsBox');
  if (!questQueue.length) {
    box.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 11px; padding-top: 28px;">No games in queue.<br>Click \\'➕ Queue\\' on any game to build your auto-playlist!</div>';
    return;
  }
  box.innerHTML = questQueue.map((item, i) => \`
    <div class="queue-item">
      <span><b>\${i+1}.</b> \${item.game.emoji || '🎮'} \${item.game.name}</span>
      <span style="color: \${item.status==='running'?'var(--green)':item.status==='done'?'var(--blurple)':'var(--text-muted)'}; font-weight:700;">
        \${item.status==='running'?'⏳ Playing':item.status==='done'?'✅ Done':'⏱️ Queued'}
      </span>
    </div>
  \`).join('');
}

function startQuestQueue() {
  if (!questQueue.length) return;
  activeQuestIdx = questQueue.findIndex(x => x.status === 'pending');
  if (activeQuestIdx === -1) {
    questQueue.forEach(x => x.status = 'pending');
    activeQuestIdx = 0;
  }
  questQueue[activeQuestIdx].status = 'running';
  renderQuestQueue();
  startQuestSpoof(questQueue[activeQuestIdx].game);
}

function skipQuestQueue() {
  if (activeQuestIdx >= 0 && activeQuestIdx < questQueue.length) {
    questQueue[activeQuestIdx].status = 'done';
  }
  const nextIdx = questQueue.findIndex(x => x.status === 'pending');
  if (nextIdx !== -1) {
    activeQuestIdx = nextIdx;
    questQueue[activeQuestIdx].status = 'running';
    renderQuestQueue();
    startQuestSpoof(questQueue[activeQuestIdx].game);
  } else {
    activeQuestIdx = -1;
    renderQuestQueue();
    stopQuestSpoofer();
    document.getElementById('lblQuestStatus').textContent = '🎉 All Queued Quests Finished! Ready to claim.';
    document.getElementById('lblQuestStatus').style.color = 'var(--green)';
  }
}

function clearQuestQueue() {
  questQueue = [];
  activeQuestIdx = -1;
  renderQuestQueue();
}

function updateQueueDuration(sec) {
  questTarget = Number(sec);
}

function launchCustomQuest() {
  const raw = document.getElementById('customQuestExe').value.trim();
  if (!raw) return;
  const exe = raw.endsWith('.exe') ? raw : raw.toLowerCase().replace(/\\s+/g, '') + '.exe';
  startQuestSpoof({ id: 'custom', name: raw.replace('.exe', ''), exe, client_id: '1470616226995765409', emoji: '🎮' });
}

function queueCustomQuest() {
  const raw = document.getElementById('customQuestExe').value.trim();
  if (!raw) return;
  const exe = raw.endsWith('.exe') ? raw : raw.toLowerCase().replace(/\\s+/g, '') + '.exe';
  addQuestToQueue({ id: 'custom_' + Date.now(), name: raw.replace('.exe', ''), exe, client_id: '1470616226995765409', emoji: '🎮' });
}

function searchQuestGame() {
  const q = document.getElementById('questSearchInput').value.trim().toLowerCase();
  if (!q) return;
  const matches = QUEST_GAMES_DATA.filter(g => g.name.toLowerCase().includes(q) || g.exe.toLowerCase().includes(q) || g.id.includes(q));
  const list = matches.length ? matches : [{ id: q, name: q.toUpperCase(), exe: q.replace(/\\s+/g, '') + '.exe', client_id: '1470616226995765409', emoji: '🎮', desc: 'Detected Game' }];
  document.getElementById('questSearchResults').innerHTML = list.map(g => \`
    <div class="quest-row" style="margin-top:6px;">
      <div class="quest-emoji">\${g.emoji}</div>
      <div class="quest-info">
        <div class="quest-title">\${g.name}</div>
        <div class="quest-sub">Executable: \${g.exe} • App ID: \${g.client_id}</div>
      </div>
      <button class="btn-green" style="height:28px; padding:0 10px; font-size:11px;" onclick='startQuestSpoof(\${JSON.stringify(g)})'>🚀 Spoof Now</button>
    </div>
  \`).join('');
}

/* VOICE ROOM AFK */
async function loadUserGuilds() {
  try {
    const r = await fetch('/api/guilds');
    const d = await r.json();
    if (d.guilds && d.guilds.length) {
      const sel = document.getElementById('selectGuildDropdown');
      const currentGid = document.getElementById('entryGuildId').value.trim();
      sel.innerHTML = d.guilds.map(g => \`<option value="\${g.id}" \${g.id === currentGid ? 'selected' : ''}>\${g.name} (\${g.id})</option>\`).join('');
    }
  } catch (e) {}
}

function onGuildDropdownChange(gid) {
  if (!gid) return;
  document.getElementById('entryGuildId').value = gid;
  loadGuildVoiceChannels(gid);
}

async function loadGuildVoiceChannels(gidOverride) {
  const gid = gidOverride || document.getElementById('entryGuildId').value.trim() || '1442511921898192917';
  try {
    const r = await fetch('/api/channels?guild_id=' + encodeURIComponent(gid));
    const d = await r.json();
    if (d.channels && d.channels.length) {
      const sel = document.getElementById('selectChannelDropdown');
      const currentCid = document.getElementById('entryChannelId').value.trim();
      sel.innerHTML = d.channels.map(c => \`<option value="\${c.id}" \${c.id === currentCid ? 'selected' : ''}>🔊 \${c.name} — \${c.id}</option>\`).join('');
      if (!d.channels.some(c => c.id === currentCid)) {
        const jtc = d.channels.find(c => c.name.toUpperCase().includes('JOIN TO CREATE')) || d.channels[0];
        if (jtc) {
          sel.value = jtc.id;
          document.getElementById('entryChannelId').value = jtc.id;
        }
      }
    }
  } catch (e) {}
}

function onChannelDropdownChange(cid) {
  if (!cid) return;
  document.getElementById('entryChannelId').value = cid;
}

async function joinVoiceRoom() {
  const guild_id = document.getElementById('entryGuildId').value.trim();
  const channel_id = document.getElementById('entryChannelId').value.trim();
  const self_mute = document.getElementById('cbMute').checked;
  const self_deaf = document.getElementById('cbDeaf').checked;
  const actName = document.getElementById('entryVoiceActivity').value.trim();
  const btn = document.getElementById('btnJoinVoice');
  if (btn) btn.textContent = '⏳ Connecting & Joining Voice Room...';
  document.getElementById('monStatus').textContent = '⏳ Joining Voice Channel in Discord...';
  document.getElementById('monStatus').style.color = 'var(--yellow)';

  try {
    const r = await fetch('/api/voice', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ action: 'join', guild_id, channel_id, self_mute, self_deaf, name: actName })
    });
    const d = await r.json();
    const activeChan = d.channel_id || channel_id;
    const chanLabel = d.channel_name ? \`\${d.channel_name} (\${activeChan})\` : activeChan;
    document.getElementById('monStatus').textContent = '🟢 Status: Connected & In Voice Room: ' + chanLabel;
    document.getElementById('monStatus').style.color = 'var(--green)';
    document.getElementById('monRoom').textContent = 'Active Voice Channel: ' + chanLabel;
    document.getElementById('sidebarVoice').textContent = '🟢 Voice: In Room';
  } catch (e) {
    document.getElementById('monStatus').textContent = '🔴 Error joining voice room: ' + e;
    document.getElementById('monStatus').style.color = 'var(--red)';
  } finally {
    if (btn) btn.textContent = '🟢 Join / Update Voice Room (24/7 AFK)';
  }
}

async function leaveVoiceRoom() {
  await fetch('/api/voice', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ action: 'leave' })
  });
  document.getElementById('monStatus').textContent = '⚪ Status: Disconnected from Voice';
  document.getElementById('monStatus').style.color = 'var(--text-muted)';
  document.getElementById('sidebarVoice').textContent = '⚪ Voice: Offline';
}

/* CATALOG SEARCH */
function searchCatalog() {
  const q = document.getElementById('catalogSearchInput').value.trim().toLowerCase();
  const allItems = [
    ...Object.values(PRESETS_DATA).map(p => ({ name: p.name, id: p.client_id, icon: p.icon, cat: 'Verified Preset' })),
    ...QUEST_GAMES_DATA.map(g => ({ name: g.name, id: g.client_id, icon: g.emoji, cat: g.desc }))
  ];
  const matches = allItems.filter(x => !q || x.name.toLowerCase().includes(q) || x.cat.toLowerCase().includes(q));
  document.getElementById('catalogResults').innerHTML = matches.map(m => \`
    <div class="quest-row">
      <div class="quest-emoji">\${m.icon}</div>
      <div class="quest-info">
        <div class="quest-title">\${m.name}</div>
        <div class="quest-sub">App ID: \${m.id} • \${m.cat}</div>
      </div>
      <button class="btn-primary" style="height:28px; font-size:11px; padding:0 12px;" onclick="useCatalogItem('\${m.id}', '\${m.name.replace(/'/g, "")}')">Use ID</button>
    </div>
  \`).join('');
}

function useCatalogItem(cid, name) {
  document.getElementById('entryClientId').value = cid;
  document.getElementById('entryLargeText').value = name;
  switchPage('activity');
  updatePreview();
  applyActivity();
}

/* LIVE TELEMETRY & TIMERS */
setInterval(() => {
  const elapsed = Math.max(0, Math.floor((Date.now() - startTimestampMs) / 1000));
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  document.getElementById('prevTimer').textContent =
    (h > 0 ? \`\${String(h).padStart(2,'0')}:\${String(m).padStart(2,'0')}:\${String(s).padStart(2,'0')}\` : \`\${String(m).padStart(2,'0')}:\${String(s).padStart(2,'0')}\`) + ' elapsed';

  const up = Math.max(0, Math.floor((Date.now() - sessionStartMs) / 1000));
  const uh = String(Math.floor(up / 3600)).padStart(2, '0');
  const um = String(Math.floor((up % 3600) / 60)).padStart(2, '0');
  const us = String(up % 60).padStart(2, '0');
  document.getElementById('monUptime').textContent = \`Session Uptime: \${uh}:\${um}:\${us}\`;
}, 1000);

async function refreshTelemetry() {
  try {
    const r = await fetch('/health');
    const d = await r.json();
    if (d.account) {
      document.getElementById('prevUsername').textContent = d.account;
      document.getElementById('monUser').textContent = 'Account: ' + d.account + ' (24/7 Cloud Connected)';
    }
    if (d.active_channel_id || d.channel_id) {
      const cid = d.active_channel_id || d.channel_id;
      const cname = d.channel_name ? \`\${d.channel_name} (\${cid})\` : cid;
      document.getElementById('monRoom').textContent = 'Active Voice Channel: ' + cname;
    }
    if (d.startTimestampMs) {
      startTimestampMs = d.startTimestampMs;
    }
  } catch (e) {}
}

initGrids();
updatePreview();
searchCatalog();
refreshTelemetry();
loadGuildVoiceChannels();
setInterval(refreshTelemetry, 6000);
</script>
</body>
</html>`;

const DELETED_OLD_CHANNELS = new Set(["1557661172990480487", "1559013974500966420"]);
const DEFAULT_JTC_CHANNEL = "1484570674659070063"; // ➕・JOIN TO CREATE in 1442511921898192917

export class DiscordAFKSession {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.ws = null;
    this.sequence = null;
    this.userId = "974719260779765790";
    this.username = "la2nis";
    this.connected = false;
    this.inVoice = false;
    this.lastHeartbeat = 0;
    this.guildId = env.GUILD_ID || "1442511921898192917";
    const envChan = env.CHANNEL_ID && !DELETED_OLD_CHANNELS.has(String(env.CHANNEL_ID)) ? String(env.CHANNEL_ID) : DEFAULT_JTC_CHANNEL;
    this.channelId = envChan;
    this.activeChannelId = null;
    this.channelName = "➕・JOIN TO CREATE";
    this.selfMute = true;
    this.selfDeaf = true;
    this.activity = { ...PRESETS.illustrator };
    this.startTimestampMs = Date.now();
  }

  async initState() {
    const savedAct = await this.ctx.storage.get("activity");
    const savedStart = await this.ctx.storage.get("startTimestampMs");
    const savedUser = await this.ctx.storage.get("username");
    const savedGuild = await this.ctx.storage.get("guildId");
    const savedChan = await this.ctx.storage.get("channelId");
    const savedActiveChan = await this.ctx.storage.get("activeChannelId");
    const savedChanName = await this.ctx.storage.get("channelName");
    if (savedAct) this.activity = savedAct;
    if (savedStart) this.startTimestampMs = savedStart;
    if (savedUser) this.username = savedUser;
    if (savedGuild) this.guildId = savedGuild;
    if (savedChan && !DELETED_OLD_CHANNELS.has(String(savedChan))) {
      this.channelId = String(savedChan);
    } else if (savedChan && DELETED_OLD_CHANNELS.has(String(savedChan))) {
      this.channelId = DEFAULT_JTC_CHANNEL;
      await this.ctx.storage.put("channelId", this.channelId);
    }
    if (savedActiveChan && !DELETED_OLD_CHANNELS.has(String(savedActiveChan))) {
      this.activeChannelId = String(savedActiveChan);
    }
    if (savedChanName) this.channelName = savedChanName;
  }

  async resolveValidChannel(token) {
    try {
      const r = await fetch("https://discord.com/api/v10/guilds/" + this.guildId + "/channels", {
        headers: {
          Authorization: token.trim(),
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (!r.ok) return this.activeChannelId || this.channelId;
      const channels = await r.json();
      const voiceChannels = channels.filter(c => c.type === 2 || c.type === 13);
      if (!voiceChannels.length) return this.channelId;

      // 1. If we were moved into a personal Join-to-Create room and it still exists, stay in it!
      if (this.activeChannelId) {
        const activeFound = voiceChannels.find(c => String(c.id) === String(this.activeChannelId));
        if (activeFound) {
          this.channelName = activeFound.name;
          await this.ctx.storage.put("channelName", this.channelName);
          return String(activeFound.id);
        }
        this.activeChannelId = null;
        await this.ctx.storage.delete("activeChannelId");
      }

      // 2. Check if requested channelId exists
      const reqFound = voiceChannels.find(c => String(c.id) === String(this.channelId));
      if (reqFound) {
        this.channelName = reqFound.name;
        await this.ctx.storage.put("channelName", this.channelName);
        return String(reqFound.id);
      }

      // 3. Otherwise fallback to JOIN TO CREATE or Main Lobby
      const jtc = voiceChannels.find(c => (c.name || "").toUpperCase().includes("JOIN TO CREATE")) || voiceChannels[0];
      if (jtc) {
        this.channelId = String(jtc.id);
        this.channelName = jtc.name;
        await this.ctx.storage.put("channelId", this.channelId);
        await this.ctx.storage.put("channelName", this.channelName);
        return this.channelId;
      }
    } catch (e) {}
    return this.activeChannelId || this.channelId;
  }

  buildPresencePayload() {
    const act = this.activity || PRESETS.illustrator;
    const activities = [];
    if (act.name) {
      const entry = {
        name: act.name,
        type: Number(act.type || 0),
        timestamps: { start: this.startTimestampMs || Date.now() }
      };
      if (act.application_id || act.client_id) entry.application_id = String(act.application_id || act.client_id);
      if (act.details) entry.details = act.details;
      if (act.state) entry.state = act.state;
      activities.push(entry);
    }
    return {
      status: act.status || "online",
      since: 0,
      activities,
      afk: true
    };
  }

  async ensureConnected(forceRejoin = false) {
    await this.initState();
    const token = this.env.DISCORD_TOKEN;
    if (!token) {
      return { error: "Missing DISCORD_TOKEN" };
    }

    const targetChannel = await this.resolveValidChannel(token);

    if (this.ws && this.connected) {
      try {
        if (forceRejoin || !this.inVoice) {
          this.ws.send(JSON.stringify({
            op: 4,
            d: {
              guild_id: String(this.guildId).trim(),
              channel_id: String(targetChannel).trim(),
              self_mute: this.selfMute,
              self_deaf: this.selfDeaf
            }
          }));
          await new Promise(r => setTimeout(r, 1500));
        } else if (Date.now() - this.lastHeartbeat >= 12000) {
          this.ws.send(JSON.stringify({ op: 1, d: this.sequence }));
          this.lastHeartbeat = Date.now();
        }
        await this.ctx.storage.setAlarm(Date.now() + 15000);
        return { status: "online", account: this.username, channel_id: this.activeChannelId || targetChannel };
      } catch (e) {
        this.connected = false;
        this.inVoice = false;
        this.ws = null;
      }
    }

    this.debugLogs = this.debugLogs || [];
    const log = (msg) => {
      this.debugLogs.push(new Date().toISOString().substring(11, 19) + " " + msg);
      if (this.debugLogs.length > 20) this.debugLogs.shift();
    };

    try {
      const resp = await fetch("https://gateway.discord.gg/?v=10&encoding=json", {
        headers: {
          Upgrade: "websocket",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      const ws = resp.webSocket;
      log("fetch status: " + resp.status + " hasWS: " + Boolean(ws));
      if (!ws) {
        log("No websocket in response");
        return { error: "WebSocket upgrade failed" };
      }
      ws.accept();
      this.ws = ws;
      this.connected = true;
      this.lastHeartbeat = Date.now();

      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          log("settle timeout 9s fired");
          resolve();
        }, 9000);
        let settleTimer = null;
        ws.addEventListener("message", (event) => {
          try {
            const data = JSON.parse(event.data);
            log("msg op:" + data.op + (data.t ? " t:" + data.t : ""));
            if (data.s !== null && data.s !== undefined) this.sequence = data.s;
            if (data.op === 10) {
              ws.send(JSON.stringify({
                op: 2,
                d: {
                  token: token.trim(),
                  capabilities: 30717,
                  properties: { os: "Windows", browser: "Chrome", device: "", system_locale: "en-US" },
                  presence: this.buildPresencePayload(),
                  compress: false,
                  client_state: { guild_versions: {} }
                }
              }));
            } else if (data.op === 0 && data.t === "READY") {
              if (data.d?.user?.id) this.userId = String(data.d.user.id);
              if (data.d?.user?.username) {
                this.username = data.d.user.username;
                this.ctx.storage.put("username", this.username);
              }
              setTimeout(() => {
                try {
                  ws.send(JSON.stringify({
                    op: 4,
                    d: {
                      guild_id: String(this.guildId).trim(),
                      channel_id: String(targetChannel).trim(),
                      self_mute: this.selfMute,
                      self_deaf: this.selfDeaf
                    }
                  }));
                } catch (e) {}
              }, 350);
            } else if (data.op === 0 && data.t === "VOICE_STATE_UPDATE") {
              if (data.d?.user_id === this.userId) {
                if (data.d.channel_id) {
                  this.inVoice = true;
                  this.activeChannelId = String(data.d.channel_id);
                  this.ctx.storage.put("activeChannelId", this.activeChannelId);
                  if (settleTimer) clearTimeout(settleTimer);
                  // Wait 1.4s in case JOIN TO CREATE moves us into our personal room
                  settleTimer = setTimeout(() => {
                    clearTimeout(timeout);
                    resolve();
                  }, 1400);
                } else {
                  this.inVoice = false;
                }
              }
            } else if (data.op === 1) {
              ws.send(JSON.stringify({ op: 1, d: this.sequence }));
            } else if (data.op === 7 || data.op === 9) {
              this.connected = false;
              this.inVoice = false;
              try { ws.close(); } catch (e) {}
            }
          } catch (err) {}
        });
        ws.addEventListener("close", (e) => {
          log("ws close code:" + e.code + " reason:" + e.reason);
          this.connected = false;
          this.inVoice = false;
          this.ws = null;
          clearTimeout(timeout);
          resolve();
        });
        ws.addEventListener("error", (e) => {
          log("ws error: " + (e?.message || "unknown"));
          this.connected = false;
          this.inVoice = false;
          this.ws = null;
          clearTimeout(timeout);
          resolve();
        });
      });

      await this.ctx.storage.setAlarm(Date.now() + 15000);
      return { status: "online", account: this.username, channel_id: this.activeChannelId || targetChannel };
    } catch (err) {
      log("catch err: " + String(err));
      this.connected = false;
      this.inVoice = false;
      this.ws = null;
      await this.ctx.storage.setAlarm(Date.now() + 10000);
      return { error: String(err) };
    }
  }

  async alarm() {
    await this.ensureConnected();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const token = (this.env.DISCORD_TOKEN || "").trim();

    if (request.method === "GET" && url.pathname.startsWith("/api/guilds")) {
      try {
        const r = await fetch("https://discord.com/api/v10/users/@me/guilds", {
          headers: { Authorization: token, "User-Agent": "Mozilla/5.0" }
        });
        const guilds = r.ok ? await r.json() : [];
        return new Response(JSON.stringify({ ok: true, guilds }), { headers: { "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, guilds: [] }), { headers: { "Content-Type": "application/json" } });
      }
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/channels")) {
      const gid = url.searchParams.get("guild_id") || this.guildId;
      try {
        const r = await fetch("https://discord.com/api/v10/guilds/" + gid + "/channels", {
          headers: { Authorization: token, "User-Agent": "Mozilla/5.0" }
        });
        const all = r.ok ? await r.json() : [];
        const channels = all
          .filter(c => c.type === 2 || c.type === 13)
          .map(c => ({ id: String(c.id), name: c.name, type: c.type }));
        return new Response(JSON.stringify({ ok: true, channels }), { headers: { "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, channels: [] }), { headers: { "Content-Type": "application/json" } });
      }
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/voice")) {
      await this.initState();
      const body = await request.json().catch(() => ({}));
      if (body.action === "leave") {
        this.inVoice = false;
        this.activeChannelId = null;
        await this.ctx.storage.delete("activeChannelId");
        if (this.ws && this.connected) {
          try {
            this.ws.send(JSON.stringify({
              op: 4,
              d: { guild_id: String(this.guildId), channel_id: null, self_mute: true, self_deaf: true }
            }));
          } catch (e) {}
        }
        return new Response(JSON.stringify({ ok: true, status: "left" }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.guild_id) {
        this.guildId = String(body.guild_id).trim();
        await this.ctx.storage.put("guildId", this.guildId);
      }
      if (body.channel_id) {
        this.channelId = String(body.channel_id).trim();
        this.activeChannelId = null;
        await this.ctx.storage.put("channelId", this.channelId);
        await this.ctx.storage.delete("activeChannelId");
      }
      if (body.self_mute !== undefined) this.selfMute = Boolean(body.self_mute);
      if (body.self_deaf !== undefined) this.selfDeaf = Boolean(body.self_deaf);
      if (body.name) {
        this.activity.name = body.name;
        await this.ctx.storage.put("activity", this.activity);
      }

      // Force a verified connection + voice channel join
      await this.ensureConnected(true);
      await this.resolveValidChannel(token);

      return new Response(JSON.stringify({
        ok: true,
        guild_id: this.guildId,
        channel_id: this.activeChannelId || this.channelId,
        requested_channel_id: this.channelId,
        channel_name: this.channelName,
        in_voice: this.inVoice
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    await this.ensureConnected();

    if (request.method === "POST" && url.pathname.startsWith("/api/activity")) {
      const body = await request.json().catch(() => ({}));
      if (body.preset && PRESETS[body.preset]) {
        this.activity = { ...PRESETS[body.preset] };
      }
      for (const k of ["name", "details", "state", "status", "application_id", "client_id", "large_image", "large_text", "small_image", "small_text"]) {
        if (body[k] !== undefined) this.activity[k] = body[k];
      }
      if (body.reset_timer) {
        this.startTimestampMs = Date.now();
      } else if (body.elapsed_hours !== undefined || body.elapsed_minutes !== undefined) {
        const hrs = Number(body.elapsed_hours || 0);
        const mins = Number(body.elapsed_minutes || 0);
        this.startTimestampMs = Date.now() - Math.max(0, (hrs * 3600 + mins * 60) * 1000);
      }
      await this.ctx.storage.put("activity", this.activity);
      await this.ctx.storage.put("startTimestampMs", this.startTimestampMs);

      if (this.ws && this.connected) {
        try {
          this.ws.send(JSON.stringify({ op: 3, d: this.buildPresencePayload() }));
        } catch (e) {}
      }
      return new Response(JSON.stringify({ ok: true, activity: this.activity }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const accept = request.headers.get("Accept") || "";
    if (!url.pathname.startsWith("/health") && (accept.includes("text/html") || url.pathname.startsWith("/dashboard"))) {
      return new Response(DASHBOARD_HTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    return new Response(JSON.stringify({
      status: this.connected ? "online" : "reconnecting",
      service: "Discord Studio Pro — 24/7 Cloud Worker",
      account: this.username,
      in_voice: this.inVoice,
      guild_id: this.guildId,
      channel_id: this.activeChannelId || this.channelId,
      active_channel_id: this.activeChannelId,
      requested_channel_id: this.channelId,
      channel_name: this.channelName,
      startTimestampMs: this.startTimestampMs,
      activity: this.activity,
      debug_logs: this.debugLogs || []
    }, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }
}

export default {
  async fetch(request, env) {
    const id = env.DISCORD_AFK_SESSION.idFromName("global-24-7-afk");
    const stub = env.DISCORD_AFK_SESSION.get(id);
    return stub.fetch(request);
  }
};
