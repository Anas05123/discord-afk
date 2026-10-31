/**
 * Discord Studio PRO  -  Full Web Application & 24/7 Cloudflare Durable Object Worker
 * Pixel-accurate replica of the Desktop Software (Activity Studio, Discord Quests, Voice Room AFK, Game Catalog, 24/7 Cloud)
 */

const PRESETS = {
  gta6: {
    key: "gta6",
    name: "Grand Theft Auto VI",
    client_id: "1445160676522856458",
    details: "Exploring Vice City",
    state: "Free Roam (Jason & Lucia)",
    large_image: "",
    large_text: "Grand Theft Auto VI",
    small_image: "",
    small_text: "Rockstar Games",
    icon: "VI"
  },
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
    icon: "Ps"
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
    icon: "Ai"
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
    icon: "Ae"
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
    icon: "Pr"
  },
  figma: {
    key: "figma",
    name: "Figma",
    client_id: "866719067092418580",
    details: "Designing UI_Design_System.fig",
    state: "Auto-Layout & Interactive Prototype",
    large_image: "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
    large_text: "Figma UI/UX",
    small_image: "",
    small_text: "UI/UX Studio",
    icon: "Fg"
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
    icon: "VS"
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
    icon: ""
  },
  fortnite: {
    key: "fortnite",
    name: "Fortnite",
    client_id: "432980957394370572",
    details: "Battle Royale: Zero Build",
    state: "Victory Royale! (Top 1)",
    large_image: "https://cdn-icons-png.flaticon.com/512/588/588395.png",
    large_text: "Fortnite",
    small_image: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
    small_text: "1st Place",
    icon: ""
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
    icon: ""
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
    icon: ""
  },
  chill: {
    key: "chill",
    name: "Lo-Fi Chill & Beats",
    client_id: "383226320970055681",
    details: "Listening to Lo-Fi Vibes",
    state: "Relaxing / AFK Session",
    large_image: "https://cdn-icons-png.flaticon.com/512/3074/3074767.png",
    large_text: "Lo-Fi Coffee",
    small_image: "https://cdn-icons-png.flaticon.com/512/727/727245.png",
    small_text: "Chill Session",
    icon: ""
  },
  studying: {
    key: "studying",
    name: "Deep Study & Focus",
    client_id: "383226320970055681",
    details: "Deep Work Session",
    state: "Do Not Disturb / Pomodoro",
    large_image: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    large_text: "Deep Study",
    small_image: "https://cdn-icons-png.flaticon.com/512/2997/2997295.png",
    small_text: "Pomodoro Focus",
    icon: ""
  }
};

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Discord Studio Pro  -  Custom Presence & 24/7 AFK</title>
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

  .nav-icon { margin-right: 8px; vertical-align: middle; flex-shrink: 0; opacity: 0.8; }
  .nav-btn:hover .nav-icon, .nav-btn.active .nav-icon { opacity: 1; stroke: var(--blurple); }
  .status-indicator {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    margin-right: 6px; vertical-align: middle; flex-shrink: 0;
  }
  .status-indicator.online { background: #43b581; box-shadow: 0 0 6px rgba(67, 181, 129, 0.5); }
  .status-indicator.offline { background: #747f8d; }
  .status-indicator.locked { background: #f04747; box-shadow: 0 0 6px rgba(240, 71, 71, 0.5); }


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
      <span class="status-indicator online" style="margin-right:4px;"></span>
      <span class="app-title">Discord Studio</span>
      <span class="pro-badge">PRO</span>
    </div>
    <div class="sub-label">Presence Studio & 24/7 AFK</div>
  </div>

  <div class="nav-list">
    <button class="nav-btn active" id="nav-activity" onclick="switchPage('activity')"><svg class="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg><span>Activity Studio</span></button>
    <button class="nav-btn" id="nav-quests" onclick="switchPage('quests')"><svg class="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg><span>Discord Quests</span></button>
    <button class="nav-btn" id="nav-voice" onclick="switchPage('voice')"><svg class="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg><span>Voice Room AFK</span></button>
    <button class="nav-btn" id="nav-alerts" onclick="openWhatsAppPanel()" style="border: 1px solid #23a55a66; background: #23a55a15; color: #f2f3f5;"><span style="margin-right:6px;">🔔</span><span>WhatsApp & Alerts</span></button>
    <button class="nav-btn" id="nav-games" onclick="switchPage('games')"><svg class="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"></line><line x1="8" x2="8" y1="10" y2="14"></line><line x1="15" x2="15.01" y1="13" y2="13"></line><line x1="18" x2="18.01" y1="11" y2="11"></line><rect width="20" height="12" x="2" y="6" rx="2"></rect></svg><span>Game Catalog</span></button>
    <button class="nav-btn" id="nav-cloud" onclick="switchPage('cloud')"><svg class="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg><span>24/7 Cloud Guide</span></button>
  </div>

  <div class="sidebar-spacer"></div>

  <div class="status-card">
    <div class="status-header">SYSTEM STATUS</div>
    <div class="status-item" id="sidebarRpc"><span class="status-indicator online" id="dotSidebarRpc"></span>RPC: Active</div>
    <div class="status-item" id="sidebarVoice"><span class="status-indicator online" id="dotSidebarVoice"></span>Voice: In Room</div>
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
      <button class="btn-primary" id="btnTopApply" onclick="applyActivity()">Set Activity on Discord</button>
    </div>

    <div class="split-grid">
      <!-- Left Scrollable Column -->
      <div class="col-scroll">
        <!-- Card A: Quick Presets -->
        <div class="section-card">
          <div class="card-title">Quick Presets (Creative Tools, Coding & Gaming)</div>
          <div class="preset-grid" id="presetGrid"></div>
        </div>

        <!-- Card B: Badges -->
        <div class="section-card">
          <div class="card-title">Creative Tool & Framework Badges (Small Icon)</div>
          <div class="card-desc">Choose your active design tool or programming framework badge (renders as a small badge on your profile):</div>
          <div class="pill-grid" id="badgeGrid"></div>
        </div>

        <!-- Card C: Activity Customization -->
        <div class="section-card">
          <div class="card-title">Activity Customization</div>
          <div class="form-group">
            <label class="form-label">Application ID (Client ID):</label>
            <input class="form-input" id="entryClientId" value="" placeholder="e.g. 1445160676522856458" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Details (Line 1):</label>
            <input class="form-input" id="entryDetails" value="" placeholder="e.g. Exploring Vice City" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">State (Line 2):</label>
            <input class="form-input" id="entryState" value="" placeholder="e.g. Free Roam (Jason & Lucia)" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Large Image Key or HTTPS URL:</label>
            <input class="form-input" id="entryLargeImg" value="" placeholder="Leave blank to use verified app icon" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Large Image Tooltip:</label>
            <input class="form-input" id="entryLargeText" value="" placeholder="e.g. Grand Theft Auto VI" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Small Badge URL / Key (Optional):</label>
            <input class="form-input" id="entrySmallImg" value="" placeholder="Optional badge URL" oninput="updatePreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Small Badge Tooltip (Optional):</label>
            <input class="form-input" id="entrySmallText" value="" placeholder="Badge tooltip" oninput="updatePreview()">
          </div>

          <!-- Elapsed Timer Chooser -->
          <div class="form-group" style="margin-top: 10px;">
            <label class="form-label">Elapsed Timer Mode:</label>
            <div class="form-row">
              <label class="checkbox-row" style="width: 110px;">
                <input type="checkbox" id="cbShowTimer" checked onchange="updatePreview()"> Show Timer
              </label>
              <select class="form-select" id="timerModeMenu" onchange="onTimerModeChange(this.value)" style="flex: 1;">
                <option value="0,0">Natural Elapsed (Starts at 00:00)</option>
                <option value="0,30">30 Minutes Elapsed</option>
                <option value="2,0">2 Hours Elapsed</option>
                <option value="5,0">5 Hours Elapsed (Deep Work)</option>
                <option value="12,0">12 Hours Elapsed</option>
                <option value="24,0">24 Hours Elapsed (1 Full Day)</option>
                <option value="48,0">48 Hours Elapsed (2 Full Days)</option>
                <option value="custom">Custom Hours & Minutes</option>
              </select>
              <button class="btn-secondary" style="flex: 0 0 115px; height: 34px;" onclick="resetTimerNatural()">Reset (00:00)</button>
            </div>
            <div class="form-row">
              <span style="font-size: 11px; color: var(--text-muted);">Custom Elapsed  -  Hours:</span>
              <input class="form-input" id="entryTimerHours" type="number" min="0" value="0" style="width: 60px;">
              <span style="font-size: 11px; color: var(--text-muted);">Minutes:</span>
              <input class="form-input" id="entryTimerMins" type="number" min="0" value="0" style="width: 60px;">
              <button class="btn-primary" style="flex: 1; height: 34px; font-size: 11px;" onclick="applyCustomTimer()">Set Elapsed Time</button>
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
          <div class="card-title">Smart Creative & Code Auto-Detection</div>
          <div class="card-desc">Automatically detects Adobe Photoshop (.psd), Illustrator (.ai), After Effects (.aep), Premiere Pro, Figma, and VS Code (.tsx/.py/.ts) to update your Discord presence live!</div>
          <label class="checkbox-row" style="font-weight: 700; margin-bottom: 6px;">
            <input type="checkbox" checked> Enable Auto-Detect Design Tools & Active Files
          </label>
          <div style="font-size: 11px; color: var(--green);">[ACTIVE] Status: Active & Synced with 24/7 Cloud Worker</div>
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
                <div class="avatar-circle" id="prevAvatarInitials">L</div>
                <div>
                  <div class="popout-username" id="prevUsername">la2nis</div>
                  <div class="popout-online"><span class="status-indicator online"></span>Online (24/7 Cloud AFK)</div>
                </div>
              </div>
              <div class="popout-divider"></div>
              <div class="popout-section-lbl">PLAYING A GAME</div>
              <div class="activity-row">
                <div class="art-canvas">
                  <div class="large-art" id="prevLargeArt" style="font-size:11px;font-weight:700;">APP</div>
                  <div class="small-badge" id="prevSmallBadge" style="display:none;"></div>
                </div>
                <div class="act-info">
                  <div class="act-name" id="prevName">No Activity Set</div>
                  <div class="act-details" id="prevDetails">Profile is Idle / Clean</div>
                  <div class="act-state" id="prevState">Select a preset above to begin</div>
                  <div class="act-timer" id="prevTimer" style="display:none;">00:00 elapsed</div>
                </div>
              </div>
              <div class="popout-buttons" id="prevButtonsBox"></div>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="quick-actions-row">
            <button class="btn-secondary" onclick="clearPresence()">Clear Presence</button>
            <button class="btn-secondary" onclick="applyActivity()">Sync to Cloud Now</button>
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
          <div class="card-title">Search & Detect Any Game (24,000+ Database)</div>
          <div class="card-desc">Type any game name (e.g. NTE, Giants, Hellraiser, Helldivers, Cyberpunk, GTA) to auto-detect its executable & launch spoofing:</div>
          <div class="form-row">
            <input class="form-input" id="questSearchInput" placeholder="Search game name or executable (e.g. NTE, Giants, Hellraiser)..." style="flex: 1;">
            <button class="btn-primary" style="height: 34px;" onclick="searchQuestGame()">Detect Game</button>
          </div>
          <div id="questSearchResults"></div>
        </div>

        <div class="section-card">
          <div class="card-title">Popular & Trending Discord Quests</div>
          <div class="card-desc">Accept the quest in Discord (User Settings > Gift Inventory), then click Launch Spoof below:</div>
          <button class="btn-primary" style="width: 100%; height: 32px; font-size: 11px; margin-bottom: 10px;" onclick="queueTopQuests()">
            Auto-Queue Active Quests (Once Human, FC 27, Marvel Rivals, Delta Force)
          </button>
          <div id="questGamesList"></div>
        </div>

        <div class="section-card">
          <div class="card-title">Custom Quest Executable</div>
          <div class="card-desc">If Discord adds a new game quest, enter its executable name below to simulate it:</div>
          <div class="form-row">
            <input class="form-input" id="customQuestExe" placeholder="e.g. palworld.exe or wutheringwaves.exe" style="flex: 1;">
            <button class="btn-secondary" style="flex: 0 0 110px;" onclick="launchCustomQuest()">Launch Custom</button>
            <button class="btn-secondary" style="flex: 0 0 110px;" onclick="queueCustomQuest()">+ Queue Custom</button>
          </div>
        </div>
      </div>

      <div class="col-scroll">
        <div class="section-card">
          <div class="card-title">Live Quest Progress & Monitor</div>
          <div id="lblQuestStatus" style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">[IDLE] Status: Idle (No game running)</div>
          <div id="lblQuestGame" style="font-size: 12px; color: var(--text-secondary);">Active Game: None</div>
          <div id="lblQuestExe" style="font-size: 11px; color: var(--text-muted); margin: 2px 0;">Process Name: -</div>
          <div id="lblQuestRpc" style="font-size: 11px; font-weight: 700; color: var(--text-muted);">Discord Activity: [IDLE]</div>

          <div class="timer-box">
            <div class="timer-big" id="lblQuestTimer">00:00 / 15:00</div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;" id="lblQuestTargetNote">Standard Quest Duration: 15 Minutes</div>
          </div>

          <div class="progress-track"><div class="progress-fill" id="questProgressBar"></div></div>
          <button class="btn-secondary" style="width: 100%; height: 36px;" onclick="stopQuestSpoofer()">Stop Game Spoofer</button>
        </div>

        <div class="section-card" style="border: 1px solid var(--blurple);">
          <div class="card-title" style="color: var(--blurple); display:flex; align-items:center; gap:6px;">
            <span>[FAST]</span> Instant Discord Client Quest Completer
          </div>
          <div class="card-desc" style="font-size: 11px; line-height: 1.5;">
            Discord requires quests to report progress from a Discord client session. To complete <b>any active Quest instantly</b> without downloading games:<br>
            <b>1.</b> Open Discord (Desktop app or in your browser).<br>
            <b>2.</b> Press <b>Ctrl + Shift + I</b>, then switch to the <b>Console</b> tab.<br>
            <b>3.</b> Click below to copy the verified completer snippet, paste it into the console, and press Enter:
          </div>
          <button class="btn-primary" style="width: 100%; height: 36px; font-weight: 700;" onclick="copyQuestCompleterScript()">
            Copy Instant Quest Completer Script
          </button>
          <div id="questCopyStatus" style="font-size: 11px; color: var(--green); font-weight: 700; margin-top: 8px; display: none;">
            [OK] Copied to clipboard! Paste into Discord Console (Ctrl + Shift + I) to complete your quests instantly.
          </div>
        </div>

        <div class="section-card">
          <div class="card-title">Auto-Quest Queue & Playlist</div>
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
            <button class="btn-primary" style="flex: 1; height: 32px; font-size: 11px;" id="btnStartQueue" onclick="startQuestQueue()">Start Queue</button>
            <button class="btn-secondary" style="flex: 0 0 70px; height: 32px;" onclick="skipQuestQueue()">Skip</button>
            <button class="btn-secondary" style="flex: 0 0 70px; height: 32px;" onclick="clearQuestQueue()">Clear</button>
          </div>
          <div class="queue-box" id="queueItemsBox">
            <div style="text-align: center; color: var(--text-muted); font-size: 11px; padding-top: 28px;">
              No games in queue.<br>Click '+ Queue' on any game to build your auto-playlist!
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
        <div class="page-title">Voice Room AFK & 🔔 WhatsApp Alerts (+21654096479)</div>
        <div class="page-sub">24/7 Discord Voice AFK + Instant WhatsApp & Desktop notifications when someone DMs, @mentions, or chats in your voice room.</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-green" style="height:36px; padding:0 14px; font-size:12px;" onclick="testNotificationAlert(true)">🔔 Test WhatsApp (+21654096479) & Alert</button>
        <button class="btn-primary" style="height:36px; padding:0 14px; font-size:12px;" onclick="openWhatsAppActivation()">📲 Link 24/7 WhatsApp Bot</button>
      </div>
    </div>

    <div class="split-grid">
      <div class="col-scroll">
        <div class="section-card">
          <div class="card-title">Connection Credentials & Live Room Picker</div>
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label class="form-label" style="margin:0;">Select Server (Guild):</label>
              <button class="btn-secondary" style="height:24px; padding:0 10px; font-size:10px;" onclick="loadUserGuilds()">Load My Servers</button>
            </div>
            <select class="form-select" id="selectGuildDropdown" onchange="onGuildDropdownChange(this.value)" style="margin-bottom:6px;">
              <option value="1442511921898192917">Main Server (1442511921898192917)</option>
            </select>
            <input class="form-input" id="entryGuildId" value="1442511921898192917" placeholder="Server ID (Guild ID)">
          </div>

          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label class="form-label" style="margin:0;">Select Voice Room in Server:</label>
              <button class="btn-secondary" style="height:24px; padding:0 10px; font-size:10px;" onclick="loadGuildVoiceChannels()">Refresh Voice Rooms</button>
            </div>
            <select class="form-select" id="selectChannelDropdown" onchange="onChannelDropdownChange(this.value)" style="margin-bottom:6px;">
              <option value="1484570674659070063">+ JOIN TO CREATE (Auto-Creates Your Room)  -  1484570674659070063</option>
              <option value="1442511922565091382">Main Lobby  -  1442511922565091382</option>
              <option value="1475888620630966322"> Quran Broadcast  -  1475888620630966322</option>
              <option value="1482608241316729035">Study Lounge  -  1482608241316729035</option>
              <option value="1446993760977289276">Music Room  -  1446993760977289276</option>
              <option value="1447784971023421663">Movie Time  -  1447784971023421663</option>
              <option value="1460725269806584081">Lone Ranger  -  1460725269806584081</option>
              <option value="1460725809600925706">Rock & Roll  -  1460725809600925706</option>
              <option value="1460726493490577613">Three Musketeers  -  1460726493490577613</option>
              <option value="1482580750267056269">Five Stars  -  1482580750267056269</option>
              <option value="1496634010980319263">Fantastic Four  -  1496634010980319263</option>
            </select>
            <input class="form-input" id="entryChannelId" value="1484570674659070063" placeholder="Voice Channel ID (or pick from dropdown above)">
          </div>

          <div class="form-group">
            <label class="form-label">Custom Activity while in Room (Optional):</label>
            <input class="form-input" id="entryVoiceActivity" value="" placeholder="Optional Custom Activity (leave empty for none)">
          </div>
          <div class="form-row" style="margin: 12px 0;">
            <label class="checkbox-row" style="margin-right: 16px;">
              <input type="checkbox" id="cbMute" checked> Self-Mute (Mutes Mic)
            </label>
            <label class="checkbox-row">
              <input type="checkbox" id="cbDeaf" checked> Self-Deafen (Zero Bandwidth)
            </label>
          </div>
          <button class="btn-green" id="btnJoinVoice" style="width: 100%; height: 42px; font-size: 13px; margin-bottom: 8px;" onclick="joinVoiceRoom()">Join Voice Room (24/7 AFK)</button>
          <button class="btn-red" style="width: 100%; height: 34px; font-size: 11px; margin-bottom: 8px;" onclick="leaveVoiceRoom()">Leave Voice Room</button>
          <button class="btn-red" style="width: 100%; height: 38px; font-size: 11px; font-weight: 700; background: #8B0000; margin-bottom: 6px;" onclick="triggerEmergencyKillswitch()">EMERGENCY KILLSWITCH (Force Leave & Lock)</button>
          <button class="btn-secondary" style="width: 100%; height: 30px; font-size: 11px;" onclick="resetEmergencyLock()">Reset Emergency Lock</button>
        </div>

        <div class="section-card" id="waAlertCardTop" style="border: 2px solid #5865f2;">
          <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
            <span>📱 24/7 Phone Push Notifications (ntfy) & WhatsApp (+21654096479)</span>
            <span id="waStatusBadge" style="font-size:10px; padding:2px 6px; border-radius:4px; background:var(--bg-input); color:var(--green);">Active 24/7</span>
          </div>
          <div class="card-desc">
            Receive instant push notifications with sound directly on your phone whenever someone DMs you, @mentions you, or chats in your voice room. 100% free, zero signup, no bot activation required!
          </div>

          <div style="background:#5865f215; border:1px solid #5865f244; border-radius:8px; padding:10px 12px; margin-bottom:12px;">
            <div style="font-size:12px; font-weight:700; color:#5865f2; margin-bottom:4px;">📲 Instant 10-Second Phone Setup (No Bot Needed):</div>
            <div style="font-size:11px; color:var(--text-secondary); line-height:1.5;">
              1. Download free <b>ntfy</b> app on your phone (Google Play Store or iOS App Store) or open <a href="https://ntfy.sh/la2nis-afk" target="_blank" style="color:#5865f2; text-decoration:underline; font-weight:700;">ntfy.sh/la2nis-afk ↗</a>.<br>
              2. Tap <b>+</b> and subscribe to topic: <code style="background:var(--bg-surface); padding:2px 6px; border-radius:4px; color:#5865f2; font-weight:700;">la2nis-afk</code>.<br>
              3. Done! Tap <b>"🔔 Test Phone Push Notification"</b> below to hear your phone ring!
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom:10px;">
            <label class="checkbox-row"><input type="checkbox" id="cbNotifyEnabled" checked> Enable Alerts</label>
            <label class="checkbox-row"><input type="checkbox" id="cbNotifyDm" checked> Direct Messages (DMs)</label>
            <label class="checkbox-row"><input type="checkbox" id="cbNotifyMention" checked> @Mentions & Replies</label>
            <label class="checkbox-row"><input type="checkbox" id="cbNotifyVoiceChat" checked> Voice Room Chat</label>
          </div>

          <div class="form-group">
            <label class="form-label">Phone Push Notification Topic (ntfy.sh):</label>
            <div style="display:flex; gap:6px;">
              <input class="form-input" id="entryNtfyTopic" value="la2nis-afk" placeholder="la2nis-afk" style="flex:1;">
              <button class="btn-secondary" style="height:36px; padding:0 12px; font-size:11px;" onclick="window.open('https://ntfy.sh/' + (document.getElementById('entryNtfyTopic').value.trim() || 'la2nis-afk'), '_blank')">↗ Open Web Feed</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">WhatsApp Phone Number (+21654096479):</label>
            <input class="form-input" id="entryWaPhone" value="+21654096479" placeholder="+21654096479">
          </div>

          <div class="form-group">
            <label class="form-label" style="margin:0;">Cloud WhatsApp API Key (Optional / Webhook):</label>
            <input class="form-input" id="entryWaApiKey" value="" placeholder="Optional: Discord Webhook URL or CallMeBot API Key">
            <div style="font-size:10px; color:var(--text-muted); margin-top:3px;">
              ⚠️ Note: CallMeBot's unofficial WhatsApp bot is currently blocked/down on WhatsApp. Using <b>ntfy</b> above gives you instant, 100% guaranteed phone alerts without waiting for any bot!
            </div>
          </div>

          <div class="form-row" style="gap:6px;">
            <button class="btn-primary" style="flex:1; height:36px; font-size:11px;" onclick="saveNotificationSettings()">💾 Save Alert Settings</button>
            <button class="btn-green" style="flex:1; height:36px; font-size:11px;" onclick="testNotificationAlert(false)">🔔 Test Phone Push Notification</button>
          </div>
          <button class="btn-secondary" style="width:100%; height:28px; font-size:10px; margin-top:4px;" onclick="testNotificationAlert(true)">💬 Open WhatsApp (+21654096479) Test Draft</button>
        </div>
      </div>

      <div class="col-scroll">
        <div class="section-card" style="border: 2px solid #5865f2; background: linear-gradient(180deg, #181b33 0%, var(--bg-surface) 100%);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div class="card-title" style="margin:0; color:#7983f5;">📱 24/7 Phone Push & Alert Center</div>
            <span style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; background:#5865f233; color:#7983f5;">ACTIVE</span>
          </div>
          <div style="font-size:11px; color:var(--text-secondary); margin-bottom:10px;">
            Active triggers for <b>la2nis</b>: <b>DMs</b>, <b>@Mentions/Replies</b> & <b>Voice Room Chat</b> ➔ Pushed to phone (<b>topic: la2nis-afk</b>) & WhatsApp (<b>+21654096479</b>).
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn-green" style="flex:1; height:34px; font-size:11px; padding:0 10px;" onclick="testNotificationAlert(false)">🔔 Ring Phone Now (Test Push)</button>
            <button class="btn-primary" style="flex:1; height:34px; font-size:11px; padding:0 10px;" onclick="window.open('https://ntfy.sh/' + (document.getElementById('entryNtfyTopic')?.value || 'la2nis-afk'), '_blank')">📱 View Live Alerts on Phone</button>
            <button class="btn-secondary" style="flex:0 0 auto; height:34px; font-size:11px; padding:0 10px;" onclick="document.getElementById('waAlertCardTop').scrollIntoView({behavior:'smooth'})">⚙️ Settings</button>
          </div>
        </div>

        <div class="section-card">
          <div class="card-title">Live Room Telemetry</div>
          <div id="monStatus" style="font-size: 13px; font-weight: 700; color: var(--green); margin-bottom: 6px;">[CONNECTED] Status: Connected & In Voice Room (24/7 Cloud)</div>
          <div id="monUser" style="font-size: 12px; color: var(--text-secondary); margin: 4px 0;">Account: la2nis</div>
          <div id="monRoom" style="font-size: 12px; color: var(--text-muted); margin: 4px 0;">Active Voice Channel: 1484570674659070063</div>
          <div id="monUptime" style="font-size: 12px; color: var(--text-muted); margin: 4px 0;">Session Uptime: 00:00:00</div>
          <div id="monLatency" style="font-size: 11px; font-weight: 700; color: var(--green); margin-top: 6px;">Heartbeat Latency: 34 ms (Cloudflare Edge)</div>
        </div>

        <div class="section-card" style="margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="card-title" style="margin: 0; display: flex; align-items: center; gap: 8px;">
              <span class="status-indicator online"></span>
              <span>Live System & Safety Console</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn-secondary" style="height: 22px; padding: 0 8px; font-size: 10px;" onclick="clearWebConsole()">Clear</button>
            </div>
          </div>
          <div id="webEventConsole" style="background: #090a0d; border: 1px solid var(--border); border-radius: 8px; padding: 10px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; color: #c9d1d9; height: 165px; overflow-y: auto; line-height: 1.5;">
            <div style="color: var(--text-muted);">[SYSTEM] Live event console connected. Monitoring voice engine & safety state...</div>
          </div>
        </div>

        <div class="section-card" style="margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="card-title" style="margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>📩 Live DMs, @Mentions & Voice Chat Inbox</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn-secondary" style="height: 22px; padding: 0 8px; font-size: 10px;" onclick="clearMentionsInbox()">Clear Inbox</button>
            </div>
          </div>
          <div id="webMentionsBox" style="background: #090a0d; border: 1px solid var(--border); border-radius: 8px; padding: 10px; font-size: 11px; color: #c9d1d9; height: 155px; overflow-y: auto; line-height: 1.45;">
            <div style="color: var(--text-muted);">No DMs or @mentions received yet while AFK. Incoming alerts will appear here & forward to WhatsApp.</div>
          </div>
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
        <div class="card-title">Game & Application Search Engine</div>
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
        <div class="card-title">24/7 Cloud Hosting Engine</div>
        <div class="card-desc" style="font-size: 12px; color: var(--text-secondary);">
          Your Discord Studio Pro instance is actively hosted on Cloudflare's global edge network using a persistent Durable Object with a 25-second internal heartbeat alarm.<br><br>
          - <b>Status:</b>  Online 24/7 (Zero PC power required)<br>
          - <b>Session Longevity:</b> Designed to run 1+ day continuously without disconnecting<br>
          - <b>Handover Protocol:</b> Seamless runner takeover without voice channel recreation<br>
          - <b>Anti-Glitch Engine:</b> Sliding window circuit breaker strictly prevents channel creation spam<br>
          - <b>Voice Mode:</b> Self-Muted & Self-Deafened (Zero Bandwidth)
        </div>
      </div>
    </div>
  </div>

</div>

<script>
const PRESETS_DATA = ${JSON.stringify(PRESETS)};

const BADGES_DATA = [
  { id: "none", name: "No Badge", emoji: " - ", tooltip: "Clean Activity", url: "" },
  { id: "photoshop", name: "Photoshop", emoji: "Ps", tooltip: "Adobe Photoshop CC", url: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PHXS.png" },
  { id: "illustrator", name: "Illustrator", emoji: "Ai", tooltip: "Adobe Illustrator CC", url: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/ILST.png" },
  { id: "aftereffects", name: "After Effects", emoji: "Ae", tooltip: "Adobe After Effects CC", url: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/AEFT.png" },
  { id: "premiere", name: "Premiere Pro", emoji: "Pr", tooltip: "Adobe Premiere Pro CC", url: "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PPRO.png" },
  { id: "figma", name: "Figma", emoji: "Fg", tooltip: "Figma UI/UX", url: "https://cdn-icons-png.flaticon.com/512/5968/5968705.png" },
  { id: "react", name: "React", emoji: "Re", tooltip: "React 19 / JSX", url: "https://raw.githubusercontent.com/github/explore/main/topics/react/react.png" },
  { id: "nextjs", name: "Next.js", emoji: "Nx", tooltip: "Next.js App Router", url: "https://raw.githubusercontent.com/github/explore/main/topics/nextjs/nextjs.png" },
  { id: "typescript", name: "TypeScript", emoji: "TS", tooltip: "TypeScript 5.4", url: "https://raw.githubusercontent.com/github/explore/main/topics/typescript/typescript.png" },
  { id: "javascript", name: "JavaScript", emoji: "JS", tooltip: "JavaScript ES2024", url: "https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png" },
  { id: "python", name: "Python", emoji: "Py", tooltip: "Python 3.12", url: "https://raw.githubusercontent.com/github/explore/main/topics/python/python.png" },
  { id: "nodejs", name: "Node.js", emoji: "Node", tooltip: "Node.js v22", url: "https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png" },
  { id: "rust", name: "Rust", emoji: "Rs", tooltip: "Rust 2024", url: "https://raw.githubusercontent.com/github/explore/main/topics/rust/rust.png" },
  { id: "cpp", name: "C++", emoji: "C++", tooltip: "C++20 / STL", url: "https://raw.githubusercontent.com/github/explore/main/topics/cpp/cpp.png" },
  { id: "csharp", name: "C# / .NET", emoji: "C#", tooltip: "C# 12 / .NET 8", url: "https://raw.githubusercontent.com/github/explore/main/topics/csharp/csharp.png" },
  { id: "tailwind", name: "Tailwind CSS", emoji: "CSS", tooltip: "Tailwind CSS", url: "https://raw.githubusercontent.com/github/explore/main/topics/tailwind/tailwind.png" }
];

const QUEST_GAMES_DATA = [
  { id: "oncehuman", name: "Once Human", exe: "once human/once_human.exe", client_id: "1260340082150346932", emoji: "", desc: "Active Quest: 15m for 700 Orbs" },
  { id: "fc27", name: "EA SPORTS FC 27", exe: "ea sports fc 27/fc27.exe", client_id: "1531874756096295054", emoji: "", desc: "Active Quest: 15m for 700 Orbs (Select PC)" },
  { id: "marvelrivals", name: "Marvel Rivals", exe: "win64/marvel.exe", client_id: "1314395942253756416", emoji: "", desc: "6v6 Super Hero Team Shooter" },
  { id: "deltaforce", name: "Delta Force", exe: "win64/deltaforceclient-win64-shipping.exe", client_id: "1314682894106497096", emoji: "", desc: "Tactical First-Person Shooter" },
  { id: "ror2", name: "Risk of Rain 2", exe: "risk of rain 2/risk of rain 2.exe", client_id: "1402418087793528862", emoji: "", desc: "Multiplayer Roguelike" },
  { id: "wherewindsmeet", name: "Where Winds Meet", exe: "where winds meet/wherewindsmeet.exe", client_id: "1437509662303059998", emoji: "", desc: "Wuxia Open-World RPG" },
  { id: "gta6", name: "Grand Theft Auto VI", exe: "gta6.exe", client_id: "1445160676522856458", emoji: "", desc: "Rockstar Games Next-Gen Open World" },
  { id: "nte", name: "Neverness to Everness (NTE)", exe: "htgame.exe", client_id: "1470616226995765409", emoji: "", desc: "Anime Open-World RPG" },
  { id: "giants", name: "March of Giants", exe: "thelineclient-win64-shipping.exe", client_id: "1428223713928810496", emoji: "", desc: "War Strategy MOBA" },
  { id: "hellraiser", name: "Clive Barker's Hellraiser: Revival", exe: "hellraiser-win64-shipping.exe", client_id: "1552168352116641822", emoji: "", desc: "Horror Survival" },
  { id: "helldivers2", name: "HELLDIVERS 2", exe: "helldivers2.exe", client_id: "1198592398579482654", emoji: "", desc: "Galactic Co-Op Shooter" },
  { id: "genshin", name: "Genshin Impact", exe: "genshinimpact.exe", client_id: "762434991303950386", emoji: "", desc: "Open-World Action RPG" },
  { id: "valorant", name: "VALORANT", exe: "valorant.exe", client_id: "700136079562375258", emoji: "", desc: "5v5 Tactical Shooter" },
  { id: "fortnite", name: "Fortnite", exe: "fortniteclient-win64-shipping.exe", client_id: "432980957394370572", emoji: "", desc: "Battle Royale" },
  { id: "cyberpunk", name: "Cyberpunk 2077", exe: "cyberpunk2077.exe", client_id: "658056503651106837", emoji: "", desc: "Night City RPG" }
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
    ["GTA VI", "gta6"], ["Photoshop", "photoshop"], ["Illustrator", "illustrator"], ["After Effects", "aftereffects"], ["Premiere Pro", "premiere"],
    ["Figma", "figma"], ["VS Code", "vscode"], ["VALORANT", "valorant"], ["Fortnite", "fortnite"],
    ["ROBLOX", "roblox"], ["Genshin", "genshin"], ["Lo-Fi Chill", "chill"], ["Deep Study", "studying"]
  ];
  const pGrid = document.getElementById('presetGrid');
  pGrid.innerHTML = presetList.map(([label, key]) =>
    \`<button class="preset-btn" id="pbtn-\${key}" onclick="selectPreset('\${key}')">\${label}</button>\`
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
        <div class="quest-sub">\${g.desc} | \${g.exe}</div>
      </div>
      <button class="btn-secondary" style="flex: 0 0 75px; height: 30px;" onclick='addQuestToQueue(\${JSON.stringify(g)})'>+ Queue</button>
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
  document.getElementById('entryLargeText').value = p.name || p.large_text;
  document.getElementById('entrySmallImg').value = p.small_image;
  document.getElementById('entrySmallText').value = p.small_text;
  updatePreview();
  applyActivity(false, key);
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
  const name = document.getElementById('entryLargeText').value.trim();
  const details = document.getElementById('entryDetails').value.trim();
  const state = document.getElementById('entryState').value.trim();
  const largeImg = document.getElementById('entryLargeImg').value.trim();
  const smallImg = document.getElementById('entrySmallImg').value.trim();

  const hasAny = Boolean(name || details || state);
  document.getElementById('prevName').textContent = name || (hasAny ? 'Custom Activity' : 'No Activity Set');
  document.getElementById('prevDetails').textContent = details || (hasAny ? '' : 'Profile is Idle / Clean');
  document.getElementById('prevState').textContent = state || (hasAny ? '' : 'Select a preset above to begin');
  document.getElementById('prevTimer').style.display = (hasAny && document.getElementById('cbShowTimer').checked) ? 'block' : 'none';

  const largeBox = document.getElementById('prevLargeArt');
  if (largeImg.startsWith('http')) {
    largeBox.innerHTML = \`<img src="\${largeImg}" onerror="this.parentElement.textContent='APP'">\`;
  } else {
    largeBox.textContent = hasAny ? 'APP' : 'APP';
  }

  const smallBox = document.getElementById('prevSmallBadge');
  if (!smallImg || !hasAny) {
    smallBox.style.display = 'none';
  } else {
    smallBox.style.display = 'flex';
    if (smallImg.startsWith('http')) {
      smallBox.innerHTML = \`<img src="\${smallImg}" onerror="this.parentElement.textContent=''">\`;
    } else {
      smallBox.textContent = '';
    }
  }

  const b1 = (document.getElementById('entryB1Label')?.value || '').trim();
  const b2 = (document.getElementById('entryB2Label')?.value || '').trim();
  const btnBox = document.getElementById('prevButtonsBox');
  if (btnBox) {
    let btnsHtml = '';
    if (hasAny && b1) btnsHtml += \`<button class="popout-btn">\${b1}</button>\`;
    if (hasAny && b2) btnsHtml += \`<button class="popout-btn">\${b2}</button>\`;
    btnBox.innerHTML = btnsHtml;
  }
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

async function applyActivity(resetTimer = false, presetKey = '') {
  const hrs = parseFloat(document.getElementById('entryTimerHours').value || '0');
  const mins = parseFloat(document.getElementById('entryTimerMins').value || '0');
  const cid = document.getElementById('entryClientId').value.trim();
  const actName = document.getElementById('entryLargeText').value.trim() || 'Custom Activity';
  const payload = {
    key: presetKey,
    application_id: cid,
    client_id: cid,
    name: actName,
    details: document.getElementById('entryDetails').value.trim(),
    state: document.getElementById('entryState').value.trim(),
    large_image: document.getElementById('entryLargeImg').value.trim(),
    large_text: actName,
    small_image: document.getElementById('entrySmallImg').value.trim(),
    small_text: document.getElementById('entrySmallText').value.trim(),
    elapsed_hours: hrs,
    elapsed_minutes: mins,
    reset_timer: resetTimer
  };
  const btn = document.getElementById('btnTopApply');
  btn.textContent = 'Activity Synced!';
  btn.style.background = 'var(--green)';
  setTimeout(() => {
    btn.textContent = 'Set Activity on Discord';
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
  const vAct = document.getElementById('entryVoiceActivity');
  if (vAct) vAct.value = '';
  document.getElementById('entryDetails').value = '';
  document.getElementById('entryState').value = '';
  document.getElementById('entryLargeText').value = '';
  document.getElementById('entryLargeImg').value = '';
  document.getElementById('entrySmallImg').value = '';
  document.getElementById('entrySmallText').value = '';
  document.getElementById('entryClientId').value = '';
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
  updatePreview();
  await fetch('/api/activity', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ clear: true, name: '', details: '', state: '', application_id: '', client_id: '', large_image: '', large_text: '', small_image: '', small_text: '', key: '' })
  });
  document.getElementById('sidebarRpc').innerHTML = '<span class="status-indicator offline"></span>RPC: Cleared';
}

/* QUEST SPOOFER & AUTO-QUEUE */
function startQuestSpoof(g) {
  questElapsed = 0;
  document.getElementById('lblQuestStatus').textContent = '[PLAYING] ' + g.name;
  document.getElementById('lblQuestStatus').style.color = 'var(--green)';
  document.getElementById('lblQuestGame').textContent = 'Active Game: ' + g.name;
  document.getElementById('lblQuestExe').textContent = 'Process: ' + g.exe + ' (Cloud Simulated)';
  document.getElementById('lblQuestRpc').textContent = 'Discord Activity: [PLAYING] ' + g.name;
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
        document.getElementById('lblQuestStatus').textContent = '[DONE] 15-Minute Quest Completed! Claim your reward in Discord.';
      }
    }
  }, 1000);
}

function stopQuestSpoofer() {
  if (questInterval) clearInterval(questInterval);
  activeQuestIdx = -1;
  document.getElementById('lblQuestStatus').textContent = '[IDLE] Status: Idle (No game running)';
  document.getElementById('lblQuestStatus').style.color = 'var(--text-muted)';
  document.getElementById('lblQuestGame').textContent = 'Active Game: None';
  document.getElementById('lblQuestExe').textContent = 'Process Name: -';
  document.getElementById('lblQuestRpc').textContent = 'Discord Activity: [IDLE]';
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
    box.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 11px; padding-top: 28px;">No games in queue.<br>Click \\'+ Queue\\' on any game to build your auto-playlist!</div>';
    return;
  }
  box.innerHTML = questQueue.map((item, i) => \`
    <div class="queue-item">
      <span><b>\${i+1}.</b> \${item.game.name} \${item.game.name}</span>
      <span style="color: \${item.status==='running'?'var(--green)':item.status==='done'?'var(--blurple)':'var(--text-muted)'}; font-weight:700;">
        \${item.status==='running'?'[ACTIVE] In Progress':item.status==='done'?'[DONE] Complete':'[QUEUE] Queued'}
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
    document.getElementById('lblQuestStatus').textContent = '[DONE] All Queued Quests Finished! Ready to claim.';
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
  startQuestSpoof({ id: 'custom', name: raw.replace('.exe', ''), exe, client_id: '1470616226995765409', emoji: '' });
}

function queueCustomQuest() {
  const raw = document.getElementById('customQuestExe').value.trim();
  if (!raw) return;
  const exe = raw.endsWith('.exe') ? raw : raw.toLowerCase().replace(/\\s+/g, '') + '.exe';
  addQuestToQueue({ id: 'custom_' + Date.now(), name: raw.replace('.exe', ''), exe, client_id: '1470616226995765409', emoji: '' });
}

function searchQuestGame() {
  const q = document.getElementById('questSearchInput').value.trim().toLowerCase();
  if (!q) return;
  const matches = QUEST_GAMES_DATA.filter(g => g.name.toLowerCase().includes(q) || g.exe.toLowerCase().includes(q) || g.id.includes(q));
  const list = matches.length ? matches : [{ id: q, name: q.toUpperCase(), exe: q.replace(/\\s+/g, '') + '.exe', client_id: '1470616226995765409', emoji: '', desc: 'Detected Game' }];
  document.getElementById('questSearchResults').innerHTML = list.map(g => \`
    <div class="quest-row" style="margin-top:6px;">
      <div class="quest-emoji">\${g.emoji}</div>
      <div class="quest-info">
        <div class="quest-title">\${g.name}</div>
        <div class="quest-sub">Executable: \${g.exe} | App ID: \${g.client_id}</div>
      </div>
      <button class="btn-green" style="height:28px; padding:0 10px; font-size:11px;" onclick='startQuestSpoof(\${JSON.stringify(g)})'>Spoof Now</button>
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
      sel.innerHTML = d.channels.map(c => \`<option value="\${c.id}" \${c.id === currentCid ? 'selected' : ''}>#  \${c.name}  -  \${c.id}</option>\`).join('');
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
  appendWebLog('VOICE', 'Join voice room requested...', 'VOICE');
  const guild_id = document.getElementById('entryGuildId').value.trim();
  const channel_id = document.getElementById('entryChannelId').value.trim();
  const self_mute = document.getElementById('cbMute').checked;
  const self_deaf = document.getElementById('cbDeaf').checked;
  const actName = document.getElementById('entryVoiceActivity').value.trim();
  const btn = document.getElementById('btnJoinVoice');
  if (btn) btn.textContent = 'Connecting & Joining Voice Room...';
  document.getElementById('monStatus').textContent = '[CONNECTING] Connecting to Voice Channel in Discord...';
  document.getElementById('monStatus').style.color = 'var(--yellow)';

  try {
    const r = await fetch('/api/voice', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({ action: 'join', guild_id, channel_id, self_mute, self_deaf, name: actName })
    });
    const d = await r.json().catch(() => ({ ok: false, error: 'Non-JSON response from server' }));
    if (!d.ok && d.error) {
      throw new Error(d.error);
    }
    const activeChan = d.channel_id || channel_id;
    const chanLabel = d.channel_name ? (d.channel_name + ' (' + activeChan + ')') : activeChan;
    appendWebLog('VOICE', 'SUCCESS: Voice join dispatched for ' + chanLabel + '. Connecting on Discord Gateway...', 'SUCCESS');
    document.getElementById('monStatus').textContent = '[CONNECTING] Dispatched join for ' + chanLabel + ' — Awaiting Gateway confirmation...';
    document.getElementById('monStatus').style.color = 'var(--yellow)';
    document.getElementById('monRoom').textContent = 'Target Voice Channel: ' + chanLabel;
    document.getElementById('sidebarVoice').innerHTML = '<span class="status-indicator offline" style="background:var(--yellow);"></span>Voice: Connecting...';
    setTimeout(refreshTelemetry, 1500);
    setTimeout(refreshTelemetry, 3500);
  } catch (e) {
    appendWebLog('ERROR', 'Failed to join voice room: ' + (e && e.message ? e.message : e), 'ERROR');
    document.getElementById('monStatus').textContent = '[ERROR] Error joining voice room: ' + e;
    document.getElementById('monStatus').style.color = 'var(--red)';
  } finally {
    if (btn) btn.textContent = 'Join Voice Room (24/7 AFK)';
  }
}

const seenLogIds = new Set();
const seenAlertClientIds = new Set();
let initialAlertsLoaded = false;
let notifyConfigLoadedToUi = false;

function playAlertChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {}
}

async function requestBrowserNotificationPerm() {
  if (!('Notification' in window)) {
    appendWebLog('WARN', 'This browser does not support desktop notifications.', 'WARN');
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    appendWebLog('SAFETY', 'Browser Desktop/Mobile notifications enabled! Playing test chime...', 'SAFETY');
    playAlertChime();
    new Notification('Discord Studio PRO — Alerts Active', {
      body: 'You will now receive instant pop-up & sound alerts when someone DMs or @mentions you!'
    });
  } else {
    appendWebLog('WARN', 'Browser notification permission was not granted (' + perm + ').', 'WARN');
  }
}

async function saveNotificationSettings() {
  const payload = {
    action: 'save_config',
    enabled: document.getElementById('cbNotifyEnabled').checked,
    dm: document.getElementById('cbNotifyDm').checked,
    mention: document.getElementById('cbNotifyMention').checked,
    voice_chat: document.getElementById('cbNotifyVoiceChat').checked,
    wa_phone: (document.getElementById('entryWaPhone')?.value || '+21654096479').trim(),
    wa_apikey: (document.getElementById('entryWaApiKey')?.value || '').trim(),
    ntfy_topic: (document.getElementById('entryNtfyTopic')?.value || 'la2nis-afk').trim()
  };
  appendWebLog('SAFETY', 'Saving AFK Notification & WhatsApp settings...', 'SAFETY');
  try {
    const r = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await r.json().catch(() => ({ ok: false }));
    if (d.ok) {
      appendWebLog('SAFETY', 'SUCCESS: AFK Message & WhatsApp alert settings saved!', 'SAFETY');
      const badge = document.getElementById('waStatusBadge');
      if (badge) {
        badge.textContent = payload.wa_phone && payload.wa_apikey ? 'WhatsApp Linked' : (payload.enabled ? 'Browser Active' : 'Paused');
      }
    } else {
      appendWebLog('ERROR', 'Failed to save notification settings: ' + JSON.stringify(d), 'ERROR');
    }
  } catch (e) {
    appendWebLog('ERROR', 'Error saving notification settings: ' + e, 'ERROR');
  }
}

function openWhatsAppPanel() {
  switchPage('voice');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navAlerts = document.getElementById('nav-alerts');
  if (navAlerts) navAlerts.classList.add('active');
  setTimeout(() => {
    const el = document.getElementById('waAlertCardTop');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

function openWhatsAppActivation() {
  window.location.href = 'whatsapp://send?phone=34644872157&text=I%20allow%20callmebot%20to%20send%20me%20messages';
}

async function testNotificationAlert(openDirectWa = false) {
  await saveNotificationSettings();
  playAlertChime();
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('🔔 Test Discord AFK Alert', {
        body: 'From @TestUser: Hey la2nis, are you in the voice room?'
      });
    } catch (e) {}
  }
  appendWebLog('VOICE', 'Sending test alert to Inbox & WhatsApp...', 'VOICE');
  try {
    const r = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ action: 'test' })
    });
    const d = await r.json().catch(() => ({ ok: false }));
    if (d.ok) {
      appendWebLog('SAFETY', 'Test alert dispatched! ' + (d.wa_result || ''), 'SAFETY');
      setTimeout(refreshTelemetry, 500);
      const apiKeyVal = (document.getElementById('entryWaApiKey')?.value || '').trim();
      const phoneVal = (document.getElementById('entryWaPhone')?.value || '+21654096479').replace(/[^0-9]/g, '');
      if (openDirectWa && !apiKeyVal && phoneVal) {
        const lines = [
          '🔔 *Discord AFK Test Alert*',
          '👤 *From:* Discord Studio PRO',
          '📍 *Room:* ' + (d.alert && d.alert.channel_name ? d.alert.channel_name : 'Voice Room'),
          '💬 *Message:* Hey @la2nis! Your WhatsApp (+21654096479) AFK notification system is working!'
        ];
        const msg = encodeURIComponent(lines.join(String.fromCharCode(10)));
        window.location.href = 'whatsapp://send?phone=' + phoneVal + '&text=' + msg;
      }
    } else {
      appendWebLog('WARN', 'Test alert note: ' + (d.error || JSON.stringify(d)), 'WARN');
    }
  } catch (e) {
    appendWebLog('ERROR', 'Test alert error: ' + e, 'ERROR');
  }
}

async function clearMentionsInbox() {
  const box = document.getElementById('webMentionsBox');
  if (box) box.innerHTML = '<div style="color: var(--text-muted);">Inbox cleared.</div>';
  seenAlertClientIds.clear();
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_inbox' })
    });
  } catch (e) {}
}

function appendWebLog(tag, msg, level = 'INFO') {
  const box = document.getElementById('webEventConsole');
  if (!box) return;
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const ts = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  
  let color = '#c9d1d9';
  if (level === 'EMERGENCY' || level === 'ERROR') color = 'var(--red)';
  else if (level === 'WARN') color = 'var(--yellow)';
  else if (level === 'SAFETY' || level === 'SUCCESS') color = 'var(--green)';
  else if (level === 'VOICE') color = 'var(--blurple)';

  const row = document.createElement('div');
  row.style.marginBottom = '2px';
  row.innerHTML = '<span style="color:var(--text-muted);">[' + ts + ']</span> <b style="color:' + color + ';">[' + tag + ']</b> <span>' + msg + '</span>';
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
}

function clearWebConsole() {
  const box = document.getElementById('webEventConsole');
  if (box) box.innerHTML = '<div style="color:var(--text-muted);">[SYSTEM] Console cleared.</div>';
  seenLogIds.clear();
}

async function triggerEmergencyKillswitch() {
  appendWebLog('EMERGENCY', 'Triggering Emergency Killswitch! Disconnecting from Discord voice and locking...', 'EMERGENCY');
  document.getElementById('monStatus').innerHTML = '<span style="color:var(--red);">[LOCKED] Status: EMERGENCY LOCKED (All Joins Blocked)</span>';
  document.getElementById('sidebarVoice').innerHTML = '<span class="status-indicator locked"></span>Voice: LOCKED';
  
  const btn = document.getElementById('btnJoinVoice');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
    btn.textContent = 'Voice Join Locked (Click Reset Lock to Unlock)';
  }

  try {
    const res = await fetch('/api/voice', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({ action: 'emergency_killswitch', reason: 'Web Dashboard Manual Killswitch' })
    });
    const data = await res.json().catch(() => ({ ok: false, error: 'Non-JSON or error response from server' }));
    if (data.ok) {
      appendWebLog('EMERGENCY', 'SUCCESS: Discord voice disconnected server-side. Auto-joining locked.', 'EMERGENCY');
      document.getElementById('monRoom').textContent = 'Active Voice Channel: None (Locked)';
    } else {
      appendWebLog('ERROR', 'Emergency request returned: ' + JSON.stringify(data), 'ERROR');
    }
  } catch (err) {
    appendWebLog('ERROR', 'Emergency Killswitch network failure: ' + err, 'ERROR');
  }
}

async function resetEmergencyLock() {
  appendWebLog('SAFETY', 'Resetting Emergency Lockout...', 'SAFETY');
  try {
    const res = await fetch('/api/voice', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({ action: 'unlock_emergency' })
    });
    const data = await res.json().catch(() => ({ ok: false, error: 'Non-JSON or error response from server' }));
    if (data.ok) {
      appendWebLog('SAFETY', 'SUCCESS: Emergency lock released. Resuming 24/7 AFK mode...', 'SAFETY');
      document.getElementById('monStatus').innerHTML = '<span style="color:var(--yellow);">[CONNECTING] Safety lock reset — Resuming 24/7 Voice AFK...</span>';
      document.getElementById('sidebarVoice').innerHTML = '<span class="status-indicator offline" style="background:var(--yellow);"></span>Voice: Rejoining...';
      setTimeout(refreshTelemetry, 1500);
      setTimeout(refreshTelemetry, 3500);
      const btn = document.getElementById('btnJoinVoice');
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.textContent = 'Join Voice Room (24/7 AFK)';
      }
    } else {
      appendWebLog('ERROR', 'Reset request returned: ' + JSON.stringify(data), 'ERROR');
    }
  } catch (err) {
    appendWebLog('ERROR', 'Reset error: ' + err, 'ERROR');
  }
}

async function leaveVoiceRoom() {
  appendWebLog('VOICE', 'Leave voice room requested. Sending disconnect packet...', 'VOICE');
  await fetch('/api/voice', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ action: 'leave' })
  });
  document.getElementById('monStatus').textContent = 'Status: Disconnected from Voice';
  document.getElementById('monStatus').style.color = 'var(--text-muted)';
  document.getElementById('sidebarVoice').innerHTML = '<span class="status-indicator offline"></span>Voice: Offline';
}


function copyQuestCompleterScript() {
  const code = [
    'let wpRequire;',
    'window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => { wpRequire = req; }]);',
    'const questsStore = Object.values(wpRequire.c).find(x => x?.exports?.default?.getQuest).exports.default;',
    'const api = Object.values(wpRequire.c).find(x => x?.exports?.default?.post).exports.default;',
    'const uncompleted = Object.values(questsStore.quests).filter(x => !x.userStatus?.completedAt);',
    'console.log("[QUEST SPOOFER] Found " + uncompleted.length + " active quests!");',
    'for (const q of uncompleted) {',
    '    console.log("[QUEST SPOOFER] Completing quest: " + (q.config?.messages?.questName || q.id) + "...");',
    '    await api.post({ url: "/quests/" + q.id + "/heartbeat", body: { stream_key: null, terminal: true } });',
    '}',
    'console.log("[QUEST SPOOFER] All active Discord quests successfully completed! Check your Gift Inventory.");'
  ].join(String.fromCharCode(10));

  navigator.clipboard.writeText(code);
  const statusEl = document.getElementById('questCopyStatus');
  if (statusEl) {
    statusEl.style.display = 'block';
    setTimeout(() => { statusEl.style.display = 'none'; }, 6000);
  }
  appendWebLog('[OK] Copied Instant Discord Quest Completer script to clipboard.');
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
        <div class="quest-sub">App ID: \${m.id} | \${m.cat}</div>
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

    if (d.notify_config && !notifyConfigLoadedToUi) {
      notifyConfigLoadedToUi = true;
      const nc = d.notify_config;
      if (document.getElementById('cbNotifyEnabled')) document.getElementById('cbNotifyEnabled').checked = nc.enabled !== false;
      if (document.getElementById('cbNotifyDm')) document.getElementById('cbNotifyDm').checked = nc.dm !== false;
      if (document.getElementById('cbNotifyMention')) document.getElementById('cbNotifyMention').checked = nc.mention !== false;
      if (document.getElementById('cbNotifyVoiceChat')) document.getElementById('cbNotifyVoiceChat').checked = nc.voice_chat !== false;
      if (nc.wa_phone && document.getElementById('entryWaPhone')) document.getElementById('entryWaPhone').value = nc.wa_phone;
      if (nc.wa_apikey && document.getElementById('entryWaApiKey')) document.getElementById('entryWaApiKey').value = nc.wa_apikey;
      if (nc.ntfy_topic && document.getElementById('entryNtfyTopic')) document.getElementById('entryNtfyTopic').value = nc.ntfy_topic;
      const badge = document.getElementById('waStatusBadge');
      if (badge) {
        badge.textContent = 'Active 24/7 (ntfy)';
      }
    }
    if (d.notifications && Array.isArray(d.notifications)) {
      const mbox = document.getElementById('webMentionsBox');
      for (const item of d.notifications) {
        const aid = String(item.id || (item.ts + '_' + item.author));
        if (!seenAlertClientIds.has(aid)) {
          if (seenAlertClientIds.size === 0 && mbox && mbox.innerHTML.includes('No DMs or @mentions')) {
            mbox.innerHTML = '';
          }
          seenAlertClientIds.add(aid);
          if (mbox) {
            const row = document.createElement('div');
            row.style.padding = '6px 8px';
            row.style.marginBottom = '6px';
            row.style.borderRadius = '6px';
            row.style.background = 'var(--bg-surface)';
            row.style.borderLeft = item.type === 'DM' ? '3px solid var(--red)' : (item.type === 'VOICE_CHAT' ? '3px solid var(--green)' : '3px solid var(--blurple)');
            const badgeColor = item.type === 'DM' ? 'var(--red)' : (item.type === 'VOICE_CHAT' ? 'var(--green)' : 'var(--blurple)');
            row.innerHTML = '<div style="display:flex; justify-content:space-between; margin-bottom:2px;">' +
              '<span><b style="color:' + badgeColor + ';">[' + (item.type || 'ALERT') + ']</b> <b style="color:var(--text-primary);">' + (item.author || 'User') + '</b> <span style="color:var(--text-muted);">in ' + (item.channel_name || 'Discord') + '</span></span>' +
              '<span style="color:var(--text-muted); font-size:10px;">' + (item.ts || '') + '</span></div>' +
              '<div style="color:#dbdee1; word-break:break-word;">' + (item.content || '') + '</div>';
            mbox.insertBefore(row, mbox.firstChild);
          }
          if (initialAlertsLoaded) {
            playAlertChime();
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('🔔 Discord ' + (item.type || 'Alert') + ' from ' + (item.author || 'User'), {
                  body: (item.channel_name ? '[' + item.channel_name + '] ' : '') + (item.content || '')
                });
              } catch (e) {}
            }
          }
        }
      }
      initialAlertsLoaded = true;
    }
    if (d.debug_logs && Array.isArray(d.debug_logs)) {
      for (const log of d.debug_logs) {
        const key = (log.ts || '') + '_' + (log.tag || '') + '_' + (log.message || '');
        if (!seenLogIds.has(key)) {
          seenLogIds.add(key);
          const box = document.getElementById('webEventConsole');
          if (box) {
            let color = '#c9d1d9';
            if (log.level === 'EMERGENCY' || log.level === 'ERROR') color = 'var(--red)';
            else if (log.level === 'WARN') color = 'var(--yellow)';
            else if (log.level === 'SAFETY' || log.level === 'SUCCESS') color = 'var(--green)';
            else if (log.level === 'VOICE') color = 'var(--blurple)';

            const row = document.createElement('div');
            row.style.marginBottom = '2px';
            row.innerHTML = '<span style="color:var(--text-muted);">[' + (log.ts || '') + ']</span> <b style="color:' + color + ';">[' + (log.tag || 'SYSTEM') + ']</b> <span>' + (log.message || '') + '</span>';
            box.appendChild(row);
            box.scrollTop = box.scrollHeight;
          }
        }
      }
    }
    const btnJoin = document.getElementById('btnJoinVoice');
    if (d.emergency_locked) {
      document.getElementById('monStatus').textContent = '[LOCKED] Status: EMERGENCY LOCKED (All Joins Blocked)';
      document.getElementById('monStatus').style.color = 'var(--red)';
      document.getElementById('monRoom').textContent = 'Active Voice Channel: None (Emergency Locked)';
      document.getElementById('sidebarVoice').innerHTML = '<span class="status-indicator locked"></span>Voice: LOCKED';
      document.getElementById('sidebarVoice').className = 'status-item inactive';
      if (btnJoin) {
        btnJoin.disabled = true;
        btnJoin.style.opacity = '0.5';
        btnJoin.style.cursor = 'not-allowed';
        btnJoin.textContent = 'Voice Join Locked (Click Reset Lock to Unlock)';
      }
    } else {
      if (btnJoin && btnJoin.disabled) {
        btnJoin.disabled = false;
        btnJoin.style.opacity = '1';
        btnJoin.style.cursor = 'pointer';
        btnJoin.textContent = 'Join Voice Room (24/7 AFK)';
      }
      if (d.live_in_voice && d.active_channel_id) {
        const cname = d.channel_name ? \`\${d.channel_name} (\${d.active_channel_id})\` : d.active_channel_id;
        document.getElementById('monStatus').textContent = '[CONNECTED] Status: Connected & In Voice Room: ' + cname;
        document.getElementById('monStatus').style.color = 'var(--green)';
        document.getElementById('monRoom').textContent = 'Active Voice Channel: ' + cname;
        document.getElementById('sidebarVoice').innerHTML = '<span class="status-indicator online"></span>Voice: In Room';
        document.getElementById('sidebarVoice').className = 'status-item';
      } else if (d.in_voice) {
        const targetId = d.requested_channel_id || d.channel_id || '';
        const cname = d.channel_name ? \`\${d.channel_name} (\${targetId})\` : targetId;
        document.getElementById('monStatus').textContent = '[CONNECTING] Status: Syncing with 24/7 Voice Engine for ' + cname + '...';
        document.getElementById('monStatus').style.color = 'var(--yellow)';
        document.getElementById('monRoom').textContent = 'Target Voice Channel: ' + cname;
        document.getElementById('sidebarVoice').innerHTML = '<span class="status-indicator offline" style="background:var(--yellow);"></span>Voice: Connecting...';
      } else {
        document.getElementById('monStatus').textContent = 'Status: Disconnected from Voice';
        document.getElementById('monStatus').style.color = 'var(--text-muted)';
        document.getElementById('monRoom').textContent = 'Active Voice Channel: None';
        document.getElementById('sidebarVoice').innerHTML = '<span class="status-indicator offline"></span>Voice: Offline';
      }
    }
    if (d.account) {
      document.getElementById('prevUsername').textContent = d.account;
      const initials = d.account.slice(0, 2).toUpperCase();
      const initEl = document.getElementById('prevAvatarInitials');
      if (initEl) initEl.textContent = initials;
      document.getElementById('monUser').textContent = d.account + ' (24/7 Cloud Session)';
    }
    if (d.session_start_ms) {
      sessionStartMs = d.session_start_ms;
    }
    if (d.startTimestampMs) {
      startTimestampMs = d.startTimestampMs;
    }
    if (d.self_mute !== undefined) {
      const cbMute = document.getElementById('cbMute');
      if (cbMute && document.activeElement !== cbMute) cbMute.checked = Boolean(d.self_mute);
    }
    if (d.self_deaf !== undefined) {
      const cbDeaf = document.getElementById('cbDeaf');
      if (cbDeaf && document.activeElement !== cbDeaf) cbDeaf.checked = Boolean(d.self_deaf);
    }
    if (d.activity !== undefined) {
      const act = d.activity || {};
      const isCleared = act.cleared || (!act.name && !act.details && !act.state);
      const isTyping = [
        'entryClientId', 'entryDetails', 'entryState', 'entryLargeImg',
        'entryLargeText', 'entrySmallImg', 'entrySmallText'
      ].some(id => document.activeElement === document.getElementById(id));

      if (isCleared) {
        document.getElementById('sidebarRpc').innerHTML = '<span class="status-indicator offline"></span>RPC: Cleared';
        if (!isTyping) {
          document.getElementById('entryClientId').value = '';
          document.getElementById('entryDetails').value = '';
          document.getElementById('entryState').value = '';
          document.getElementById('entryLargeImg').value = '';
          document.getElementById('entryLargeText').value = '';
          document.getElementById('entrySmallImg').value = '';
          document.getElementById('entrySmallText').value = '';
          document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
          updatePreview();
        }
      } else {
        document.getElementById('sidebarRpc').innerHTML = '<span class="status-indicator online"></span>RPC: Active';
        if (!isTyping) {
          if (act.client_id || act.application_id) document.getElementById('entryClientId').value = act.client_id || act.application_id;
          if (act.details !== undefined) document.getElementById('entryDetails').value = act.details;
          if (act.state !== undefined) document.getElementById('entryState').value = act.state;
          if (act.large_image !== undefined) document.getElementById('entryLargeImg').value = act.large_image;
          if (act.large_text !== undefined || act.name !== undefined) document.getElementById('entryLargeText').value = act.large_text || act.name || '';
          if (act.small_image !== undefined) document.getElementById('entrySmallImg').value = act.small_image;
          if (act.small_text !== undefined) document.getElementById('entrySmallText').value = act.small_text;
          if (act.key) {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            const pBtn = document.getElementById('pbtn-' + act.key);
            if (pBtn) pBtn.classList.add('active');
          }
          updatePreview();
        }
      }
    }
  } catch (e) {}
}

initGrids();
updatePreview();
searchCatalog();
refreshTelemetry();
loadGuildVoiceChannels();
setInterval(refreshTelemetry, 2500);
</script>
</body>
</html>`;

const DELETED_OLD_CHANNELS = new Set(["1557661172990480487", "1559013974500966420"]);
const DEFAULT_JTC_CHANNEL = "1484570674659070063"; // + JOIN TO CREATE in 1442511921898192917

export class DiscordAFKSession {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.logs = [];
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
    this.channelName = "+ JOIN TO CREATE";
    this.selfMute = true;
    this.selfDeaf = true;
    this.activity = { cleared: true, name: "", details: "", state: "", application_id: "", client_id: "" };
    this.liveVoiceConnected = false;
    this.startTimestampMs = Date.now();
    this.sessionStartMs = Date.now();
    this.leaderInstanceId = null;
    this.lastTelemetryAt = 0;
    this.emergencyLocked = false;
    this.notifyConfig = { enabled: true, dm: true, mention: true, voice_chat: true, wa_phone: "+21654096479", wa_apikey: "", ntfy_topic: "la2nis-afk" };
    this.notifications = [];
    this.seenAlertIds = [];
  }

  async sendWhatsAppAlert(alertObj) {
    const nc = this.notifyConfig || {};
    if (nc.enabled === false) return "Alerts disabled";
    const phone = String(nc.wa_phone || "+21654096479").replace(/[^0-9+]/g, "").trim();
    const apikey = String(nc.wa_apikey || "").trim();
    const ntfyTopic = String(nc.ntfy_topic || "la2nis-afk").trim();

    let ntfyResult = "";
    if (ntfyTopic) {
      try {
        const nr = await fetch("https://ntfy.sh/" + encodeURIComponent(ntfyTopic), {
          method: "POST",
          headers: {
            "Title": "Discord " + (alertObj.type || "AFK") + " Alert: " + (alertObj.author || "User"),
            "Priority": "high",
            "Tags": "bell,loudspeaker"
          },
          body: "From: " + (alertObj.author || "Unknown") + "\nWhere: " + (alertObj.channel_name || "Discord") + "\nMessage: " + (alertObj.content || "")
        });
        if (nr.ok) {
          ntfyResult = "Mobile push sent via ntfy (" + ntfyTopic + ")";
          this.addLog("SAFETY", "NOTIFY", "Mobile push delivered to phone via ntfy topic: " + ntfyTopic);
        }
      } catch (ne) {}
    }

    if (!apikey) {
      const summary = ntfyResult ? (ntfyResult + " & Live Inbox") : ("Delivered to Live Inbox & PC WhatsApp (" + phone + ")");
      this.addLog("SAFETY", "NOTIFY", summary);
      return summary;
    }

    const text = "🔔 *Discord AFK Alert [" + (alertObj.type || "MSG") + "]*\n" +
      "👤 *From:* " + (alertObj.author || "Unknown") + "\n" +
      "📍 *Where:* " + (alertObj.channel_name || "Discord") + "\n" +
      "💬 *Message:* " + (alertObj.content || "");

    try {
      if (apikey.startsWith("http://") || apikey.startsWith("https://")) {
        const r = await fetch(apikey, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, text: text, alert: alertObj })
        });
        return r.ok ? "Webhook notification sent!" : ("Webhook HTTP " + r.status);
      }
      const cleanPhone = phone.replace(/^\+/, "");
      const url = "https://api.callmebot.com/whatsapp.php?phone=" + encodeURIComponent(cleanPhone) +
        "&text=" + encodeURIComponent(text) +
        "&apikey=" + encodeURIComponent(apikey);
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const bodyText = await r.text().catch(() => "");
      if (r.ok) {
        this.addLog("SAFETY", "WHATSAPP", "WhatsApp notification delivered to " + phone);
        return "WhatsApp message sent to " + phone + "!";
      } else {
        this.addLog("WARN", "WHATSAPP", "WhatsApp API response (" + r.status + "): " + bodyText.slice(0, 120));
        return "CallMeBot HTTP " + r.status + ": " + bodyText.slice(0, 80);
      }
    } catch (e) {
      this.addLog("ERROR", "WHATSAPP", "WhatsApp request error: " + (e.message || e));
      return "Error: " + (e.message || e);
    }
  }

  addLog(level, tag, message) {
    if (!this.logs) this.logs = [];
    const d = new Date();
    const pad = n => String(n).padStart(2, "0");
    const ts = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    this.logs.push({
      level: String(level || "INFO").toUpperCase(),
      tag: String(tag || "SYSTEM").toUpperCase(),
      message: String(message || ""),
      ts: ts
    });
    if (this.logs.length > 80) {
      this.logs.shift();
    }
    this.ctx.storage.put("logs", this.logs).catch(() => {});
  }

  addLogs(newLogs) {
    if (!Array.isArray(newLogs)) return;
    for (const log of newLogs) {
      if (log && typeof log === "object") {
        this.addLog(log.level, log.tag, log.message);
      }
    }
  }

  async initState() {
    const savedSessionStart = await this.ctx.storage.get("sessionStartMs");
    if (savedSessionStart) {
      this.sessionStartMs = Number(savedSessionStart);
    } else {
      this.sessionStartMs = Date.now();
      await this.ctx.storage.put("sessionStartMs", this.sessionStartMs);
    }
    const savedLock = await this.ctx.storage.get("emergencyLocked");
    if (savedLock !== undefined) this.emergencyLocked = Boolean(savedLock);
    const savedVoiceReq = await this.ctx.storage.get("voiceRequestedAt");
    if (savedVoiceReq) this.voiceRequestedAt = Number(savedVoiceReq);
    const savedLogs = await this.ctx.storage.get("logs");
    if (savedLogs && Array.isArray(savedLogs)) this.logs = savedLogs;
    const savedLeader = await this.ctx.storage.get("leaderInstanceId");
    if (savedLeader) this.leaderInstanceId = savedLeader;
    const savedLastTel = await this.ctx.storage.get("lastTelemetryAt");
    if (savedLastTel) this.lastTelemetryAt = Number(savedLastTel);
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
    if (savedActiveChan !== undefined) this.activeChannelId = savedActiveChan ? String(savedActiveChan) : null;
    const savedLiveVoice = await this.ctx.storage.get("liveVoiceConnected");
    if (savedLiveVoice !== undefined) this.liveVoiceConnected = Boolean(savedLiveVoice);
    const savedInVoice = await this.ctx.storage.get("inVoice");
    if (savedInVoice !== undefined) this.inVoice = Boolean(savedInVoice);
    if (savedChanName) this.channelName = savedChanName;
    const savedSelfMute = await this.ctx.storage.get("selfMute");
    if (savedSelfMute !== undefined) this.selfMute = Boolean(savedSelfMute);
    const savedSelfDeaf = await this.ctx.storage.get("selfDeaf");
    if (savedSelfDeaf !== undefined) this.selfDeaf = Boolean(savedSelfDeaf);
    const savedNotifyCfg = await this.ctx.storage.get("notifyConfig");
    if (savedNotifyCfg && typeof savedNotifyCfg === "object") { if (!savedNotifyCfg.wa_phone) savedNotifyCfg.wa_phone = "+21654096479"; this.notifyConfig = savedNotifyCfg; }
    const savedNotifs = await this.ctx.storage.get("notifications");
    if (savedNotifs && Array.isArray(savedNotifs)) this.notifications = savedNotifs;
    const savedSeenAlerts = await this.ctx.storage.get("seenAlertIds");
    if (savedSeenAlerts && Array.isArray(savedSeenAlerts)) this.seenAlertIds = savedSeenAlerts;
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
    const act = this.activity;
    const activities = [];
    if (act && !act.cleared && (act.name || act.details || act.state)) {
      const entry = {
        name: act.name || "Custom Activity",
        type: Number(act.type || 0),
        timestamps: { start: this.startTimestampMs || Date.now() }
      };
      if (act.application_id || act.client_id) entry.application_id = String(act.application_id || act.client_id);
      if (act.details) entry.details = act.details;
      if (act.state) entry.state = act.state;
      activities.push(entry);
    }
    return {
      status: (act && act.status) || "online",
      since: 0,
      activities,
      afk: true
    };
  }

  async ensureConnected() {
    await this.initState();
    return { status: "ready" };
  }

  async alarm() {
    // Keep DO state active
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
      if (body.action === "emergency_killswitch") {
        this.emergencyLocked = true;
        this.inVoice = false;
        this.liveVoiceConnected = false;
        this.activeChannelId = null;
        await this.ctx.storage.put("emergencyLocked", true);
        await this.ctx.storage.put("inVoice", false);
        await this.ctx.storage.delete("activeChannelId");
        this.addLog("EMERGENCY", "KILLSWITCH", "Emergency Killswitch engaged: Force leave packet sent, room joining frozen.");

        if (this.ws && this.connected) {
          try {
            this.ws.send(JSON.stringify({
              op: 4,
              d: { guild_id: String(this.guildId).trim(), channel_id: null, self_mute: true, self_deaf: true }
            }));
            this.ws.close(1000, "Emergency Killswitch");
          } catch (e) {}
          this.ws = null;
          this.connected = false;
          this.ready = false;
        }

        // Forceful immediate disconnect via direct Discord REST API
        if (token && this.guildId) {
          try {
            await fetch("https://discord.com/api/v10/guilds/" + this.guildId + "/voice-states/@me", {
              method: "PATCH",
              headers: {
                "Authorization": token,
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
              },
              body: JSON.stringify({ channel_id: null })
            });
          } catch (e) {}
        }
        return new Response(JSON.stringify({ ok: true, emergency_locked: true, status: "emergency_locked" }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "unlock_emergency") {
        this.emergencyLocked = false;
        this.inVoice = true;
        this.voiceRequestedAt = Date.now();
        this.recentJoinTimestamps = [];
        this.consecutiveRapidDrops = 0;
        await this.ctx.storage.put("emergencyLocked", false);
        await this.ctx.storage.put("inVoice", true);
        await this.ctx.storage.put("voiceRequestedAt", this.voiceRequestedAt);
        await this.resolveValidChannel(token);
        this.addLog("SAFETY", "SAFETY", "Emergency lock cleared: Normal 24/7 AFK voice operations resumed.");
        return new Response(JSON.stringify({ ok: true, emergency_locked: false, in_voice: true, status: "unlocked" }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "leave") {
        this.inVoice = false;
        this.liveVoiceConnected = false;
        await this.ctx.storage.put("inVoice", false);
        this.activeChannelId = null;
        await this.ctx.storage.delete("activeChannelId");
        this.addLog("VOICE", "LEAVE", "Voice disconnect requested: Left voice room.");

        if (this.ws && this.connected) {
          try {
            this.ws.send(JSON.stringify({
              op: 4,
              d: { guild_id: String(this.guildId).trim(), channel_id: null, self_mute: true, self_deaf: true }
            }));
          } catch (e) {}
        }

        // Forceful immediate disconnect via direct Discord REST API
        if (token && this.guildId) {
          try {
            await fetch("https://discord.com/api/v10/guilds/" + this.guildId + "/voice-states/@me", {
              method: "PATCH",
              headers: {
                "Authorization": token,
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
              },
              body: JSON.stringify({ channel_id: null })
            });
          } catch (e) {}
        }
        return new Response(JSON.stringify({ ok: true, status: "left" }), { headers: { "Content-Type": "application/json" } });
      }
      if (this.emergencyLocked) {
        return new Response(JSON.stringify({ ok: false, error: "Emergency lockout is ACTIVE. Please reset lock before joining voice.", emergency_locked: true }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      this.inVoice = true;
      this.recentJoinTimestamps = [];
      this.consecutiveRapidDrops = 0;
      await this.ctx.storage.put("inVoice", true);
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
      if (body.self_mute !== undefined) {
        this.selfMute = Boolean(body.self_mute);
        await this.ctx.storage.put("selfMute", this.selfMute);
      }
      if (body.self_deaf !== undefined) {
        this.selfDeaf = Boolean(body.self_deaf);
        await this.ctx.storage.put("selfDeaf", this.selfDeaf);
      }
      if (body.name && String(body.name).trim()) {
        this.activity.name = String(body.name).trim();
        this.activity.cleared = false;
        await this.ctx.storage.put("activity", this.activity);
      }
      this.voiceRequestedAt = Date.now();
      await this.ctx.storage.put("voiceRequestedAt", this.voiceRequestedAt);
      const targetChan = await this.resolveValidChannel(token);
      this.addLog("VOICE", "JOIN", "Voice join dispatched for " + (this.channelName || targetChan) + " (" + targetChan + "). Syncing with 24/7 Voice Engine...");

      return new Response(JSON.stringify({
        ok: true,
        guild_id: this.guildId,
        channel_id: this.activeChannelId || targetChan,
        requested_channel_id: this.channelId,
        voice_requested_at: this.voiceRequestedAt,
        channel_name: this.channelName,
        self_mute: this.selfMute,
        self_deaf: this.selfDeaf,
        in_voice: this.inVoice
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/telemetry")) {
      await this.initState();
      const body = await request.json().catch(() => ({}));
      const now = Date.now();
      const leaderStale = !this.lastTelemetryAt || ((now - this.lastTelemetryAt) > 25000);
      if (body.instance_id) {
        if (body.register_leader || !this.leaderInstanceId || leaderStale || this.leaderInstanceId === String(body.instance_id)) {
          this.leaderInstanceId = String(body.instance_id);
          this.lastTelemetryAt = now;
          await this.ctx.storage.put("leaderInstanceId", this.leaderInstanceId);
          await this.ctx.storage.put("lastTelemetryAt", this.lastTelemetryAt);
        }
      }
      if (body.active_channel_id !== undefined) {
        if (body.active_channel_id) {
          this.activeChannelId = String(body.active_channel_id);
          await this.ctx.storage.put("activeChannelId", this.activeChannelId);
        } else {
          this.activeChannelId = null;
          await this.ctx.storage.delete("activeChannelId");
        }
      }
      if (body.reset_requested_channel) {
        this.channelId = String(body.reset_requested_channel);
        await this.ctx.storage.put("channelId", this.channelId);
      }
      if (body.channel_name) {
        this.channelName = String(body.channel_name);
        await this.ctx.storage.put("channelName", this.channelName);
      }
      if (body.in_voice !== undefined) {
        this.liveVoiceConnected = Boolean(body.in_voice);
        await this.ctx.storage.put("liveVoiceConnected", this.liveVoiceConnected);
      }
      if (body.logs && Array.isArray(body.logs)) {
        this.addLogs(body.logs);
      }
      return new Response(JSON.stringify({ ok: true, leader_instance_id: this.leaderInstanceId }), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/notifications")) {
      await this.initState();
      const body = await request.json().catch(() => ({}));
      if (body.action === "save_config") {
        this.notifyConfig = {
          enabled: body.enabled !== false,
          dm: body.dm !== false,
          mention: body.mention !== false,
          voice_chat: body.voice_chat !== false,
          wa_phone: String(body.wa_phone || "+21654096479").trim(),
          wa_apikey: String(body.wa_apikey || "").trim(),
          ntfy_topic: String(body.ntfy_topic || "la2nis-afk").trim()
        };
        await this.ctx.storage.put("notifyConfig", this.notifyConfig);
        this.addLog("SAFETY", "NOTIFY", "Updated AFK Message & WhatsApp notification settings.");
        return new Response(JSON.stringify({ ok: true, notify_config: this.notifyConfig }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "clear_inbox") {
        this.notifications = [];
        await this.ctx.storage.put("notifications", this.notifications);
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "test") {
        const d = new Date();
        const pad = n => String(n).padStart(2, "0");
        const ts = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
        const testAlert = {
          id: "test_" + Date.now(),
          type: "MENTION",
          author: "TestUser (@test)",
          channel_name: this.channelName || "Voice Room Chat",
          content: "Hey @la2nis! Testing your 24/7 Discord AFK WhatsApp & Dashboard notification system!",
          ts
        };
        this.notifications.push(testAlert);
        if (this.notifications.length > 35) this.notifications.shift();
        await this.ctx.storage.put("notifications", this.notifications);
        const waRes = await this.sendWhatsAppAlert(testAlert);
        return new Response(JSON.stringify({ ok: true, wa_result: waRes, alert: testAlert }), { headers: { "Content-Type": "application/json" } });
      }
      if (body.action === "incoming_message" && body.alert) {
        const alert = body.alert;
        const aid = String(alert.id || "");
        if (aid && this.seenAlertIds.includes(aid)) {
          return new Response(JSON.stringify({ ok: true, duplicate: true }), { headers: { "Content-Type": "application/json" } });
        }
        if (aid) {
          this.seenAlertIds.push(aid);
          if (this.seenAlertIds.length > 100) this.seenAlertIds.shift();
          await this.ctx.storage.put("seenAlertIds", this.seenAlertIds);
        }
        const nc = this.notifyConfig || {};
        if (nc.enabled === false) {
          return new Response(JSON.stringify({ ok: true, skipped: "disabled" }), { headers: { "Content-Type": "application/json" } });
        }
        if (alert.type === "DM" && nc.dm === false) {
          return new Response(JSON.stringify({ ok: true, skipped: "dm_disabled" }), { headers: { "Content-Type": "application/json" } });
        }
        if (alert.type === "MENTION" && nc.mention === false) {
          return new Response(JSON.stringify({ ok: true, skipped: "mention_disabled" }), { headers: { "Content-Type": "application/json" } });
        }
        if (alert.type === "VOICE_CHAT" && nc.voice_chat === false) {
          return new Response(JSON.stringify({ ok: true, skipped: "voice_chat_disabled" }), { headers: { "Content-Type": "application/json" } });
        }
        const d = new Date();
        const pad = n => String(n).padStart(2, "0");
        alert.ts = alert.ts || (pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()));
        this.notifications.push(alert);
        if (this.notifications.length > 35) this.notifications.shift();
        await this.ctx.storage.put("notifications", this.notifications);
        const waRes = await this.sendWhatsAppAlert(alert);
        return new Response(JSON.stringify({ ok: true, wa_result: waRes }), { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ ok: false, error: "Unknown notification action" }), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/activity")) {
      const body = await request.json().catch(() => ({}));
      if (body.clear || (!body.name && !body.details && !body.state && !body.preset && !body.key)) {
        this.activity = { cleared: true, name: "", details: "", state: "", application_id: "", client_id: "", large_image: "", large_text: "", small_image: "", small_text: "", key: "" };
      } else {
        const pKey = body.key || body.preset;
        if (pKey && PRESETS[pKey]) {
          this.activity = { ...PRESETS[pKey] };
        }
        for (const k of ["name", "details", "state", "status", "application_id", "client_id", "large_image", "large_text", "small_image", "small_text", "key"]) {
          if (body[k] !== undefined && body[k] !== "") this.activity[k] = body[k];
        }
        const targetAppId = body.application_id || body.client_id;
        if (targetAppId) {
          this.activity.application_id = String(targetAppId);
          this.activity.client_id = String(targetAppId);
        }
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
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
      });
    }

    await this.initState();
    const longevitySec = Math.max(0, Math.floor((Date.now() - this.sessionStartMs) / 1000));
    const leaderAlive = Boolean(this.leaderInstanceId && this.lastTelemetryAt && ((Date.now() - this.lastTelemetryAt) < 25000));
    const effectiveLiveInVoice = leaderAlive ? Boolean(this.liveVoiceConnected) : false;
    return new Response(JSON.stringify({
      status: this.emergencyLocked ? "emergency_locked" : (effectiveLiveInVoice ? "online" : "connected"),
      service: "Discord Studio PRO  -  24/7 Cloud Worker (v10 Modern)",
      version: "v10-modern",
      account: this.username,
      emergency_locked: Boolean(this.emergencyLocked),
      session_start_ms: this.sessionStartMs,
      session_longevity_sec: longevitySec,
      leader_instance_id: leaderAlive ? this.leaderInstanceId : null,
      leader_alive: leaderAlive,
      last_telemetry_ago_sec: this.lastTelemetryAt ? Math.floor((Date.now() - this.lastTelemetryAt) / 1000) : null,
      in_voice: this.inVoice,
      live_in_voice: effectiveLiveInVoice,
      guild_id: this.guildId,
      channel_id: this.activeChannelId || this.channelId,
      active_channel_id: this.activeChannelId,
      requested_channel_id: this.channelId,
      channel_name: this.channelName,
      self_mute: this.selfMute !== undefined ? this.selfMute : true,
      self_deaf: this.selfDeaf !== undefined ? this.selfDeaf : true,
      startTimestampMs: this.startTimestampMs,
      activity: this.activity,
      notify_config: this.notifyConfig || { enabled: true, dm: true, mention: true, voice_chat: true, wa_phone: "", wa_apikey: "" },
      notifications: this.notifications || [],
      debug_logs: this.logs || []
    }, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const accept = request.headers.get("Accept") || "";
    if (!url.pathname.startsWith("/health") && !url.pathname.startsWith("/api") && (accept.includes("text/html") || url.pathname.startsWith("/dashboard") || url.pathname === "/")) {
      return new Response(DASHBOARD_HTML, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
        }
      });
    }
    const id = env.DISCORD_AFK_SESSION.idFromName("global-24-7-afk-v10");
    const stub = env.DISCORD_AFK_SESSION.get(id);
    return stub.fetch(request);
  }
};


