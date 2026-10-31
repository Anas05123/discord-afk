import fs from "fs";
import http from "http";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

// ============================================================================
// CONFIGURATION & INITIALIZATION
// ============================================================================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cfgPath = path.resolve(__dirname, "..", "config.json");

let cfg = {};
try {
  if (fs.existsSync(cfgPath)) {
    cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  }
} catch (e) {
  cfg = {};
}

let rawToken = (process.env.DISCORD_TOKEN || cfg.discord_token || "").trim();
rawToken = rawToken.replace(/^["'`\s]+|["'`\s]+$/g, "");
if (rawToken.startsWith("Bot ")) {
  rawToken = rawToken.slice(4).trim();
}
const TOKEN = rawToken;
const WORKER_URL = (process.env.WORKER_URL || "https://discord-afk-keepalive.anas05123.workers.dev").replace(/\/$/, "");
const PORT = process.env.PORT || 10000;
const DEFAULT_JTC_LOBBY = "1484570674659070063";

const daemonInstanceId = `runner_${process.env.GITHUB_RUN_ID || Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const IS_GITHUB_ACTIONS = Boolean(process.env.GITHUB_ACTIONS === "true" || process.env.GITHUB_RUN_ID);

// ============================================================================
// REFINED STRUCTURED LOGGER
// ============================================================================
const pendingCloudLogs = [];

function pushCloudLog(level, tag, message) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ts = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  pendingCloudLogs.push({ level, tag, message, ts });
  if (pendingCloudLogs.length > 40) pendingCloudLogs.shift();
}

class Logger {
  static _ts() {
    const d = new Date();
    const pad = (n, len = 2) => String(n).padStart(len, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  }

  static info(tag, message, meta = "") {
    const metaStr = meta ? ` | ${meta}` : "";
    console.log(`[${this._ts()}] [INFO] [${tag}] ${message}${metaStr}`);
    const lvl = (tag === "VOICE" || tag === "JTC_ENGINE") ? "VOICE" : "SAFETY";
    pushCloudLog(lvl, tag, `${message}${metaStr}`);
  }

  static warn(tag, message, meta = "") {
    const metaStr = meta ? ` | ${meta}` : "";
    console.warn(`[${this._ts()}] [WARN] [${tag}] ${message}${metaStr}`);
    pushCloudLog("WARN", tag, `${message}${metaStr}`);
  }

  static error(tag, message, meta = "") {
    const metaStr = meta ? ` | ${meta}` : "";
    console.error(`[${this._ts()}] [ERROR] [${tag}] ${message}${metaStr}`);
    pushCloudLog("ERROR", tag, `${message}${metaStr}`);
  }

  static countdown(remainingSec, totalSec, reason) {
    console.log(`[${this._ts()}] [COOLDOWN] ⏳ ${reason}: ${remainingSec}s remaining (of ${totalSec}s)...`);
  }
}

Logger.info("INIT", `Discord Voice AFK Runner initialized. Instance: ${daemonInstanceId}`);

const daemonBootMs = Date.now();
if (IS_GITHUB_ACTIONS) {
  // GitHub Actions afk.yml has timeout-minutes: 330 (5h 30m) and cron: '0 */5 * * *' (00, 05, 10, 15, 20 UTC).
  // If a run overlaps the next cron trigger and gets cancelled at 330m, GitHub skips the next scheduled run!
  // Therefore, exit cleanly 2 minutes before the next 5-hour cron boundary (once running >= 2h) or at 315m max.
  const MAX_GH_LIFETIME_MS = 315 * 60 * 1000; // 5h 15m (safely under 330m timeout-minutes)
  setInterval(() => {
    const uptimeMs = Date.now() - daemonBootMs;
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMin = now.getUTCMinutes();
    const nextHour = (utcHour + 1) % 24;
    const isApproachingCronBoundary = (nextHour % 5 === 0) && (utcMin >= 58) && (uptimeMs >= 90 * 60 * 1000);
    if (isApproachingCronBoundary || uptimeMs >= MAX_GH_LIFETIME_MS) {
      Logger.info("LIFETIME", "Reaching scheduled GitHub Actions cron boundary. Exiting cleanly so next scheduled runner launches without queue skip...");
      if (ws && ws.readyState === 1) {
        try { ws.close(1000, "Clean cron boundary handover"); } catch (e) {}
      }
      process.exit(0);
    }
  }, 15000);
  Logger.info("LIFETIME", "Environment: GitHub Actions Runner. Cron-aligned clean handover configured (max 5h 15m).");
} else {
  Logger.info("LIFETIME", "Environment: Persistent Local / Container Daemon. Active/Standby 24/7/365 failover enabled.");
}

// ============================================================================
// ANTI-GLITCH CIRCUIT BREAKER & COOLDOWN CONTROLLER
// ============================================================================
class AntiGlitchGuard {
  constructor() {
    this.recentJoins = []; // timestamps in ms
    this.cooldownUntil = 0;
    this.consecutiveFailures = 0;
    this.countdownTimer = null;
    this.isJtcMovePending = false;
    this.jtcMoveDeadline = 0;
    this.lastOpcode4SentMs = 0;
  }

  isCooldownActive() {
    return Date.now() < this.cooldownUntil;
  }

  getRemainingCooldownSec() {
    return Math.max(0, Math.ceil((this.cooldownUntil - Date.now()) / 1000));
  }

  canAttemptOpcode4(reason = "") {
    if (isEmergencyLocked) {
      Logger.warn("GUARD", `Opcode 4 strictly blocked: Emergency Lockout is ACTIVE`, `reason="${reason}"`);
      return false;
    }
    if (this.isCooldownActive()) {
      Logger.warn("GUARD", `Opcode 4 blocked by active cooldown (${this.getRemainingCooldownSec()}s remaining)`, `reason="${reason}"`);
      return false;
    }

    if (this.isJtcMovePending) {
      if (Date.now() < this.jtcMoveDeadline) {
        Logger.warn("GUARD", "Opcode 4 blocked: awaiting server JTC bot to move our user into new room", `deadlineIn=${Math.ceil((this.jtcMoveDeadline - Date.now()) / 1000)}s`);
        return false;
      } else {
        // Expired without move
        this.isJtcMovePending = false;
        this.triggerCooldown(30, "JTC room creation timed out after 12s without server bot move");
        return false;
      }
    }

    const elapsedSinceLastOp4 = Date.now() - this.lastOpcode4SentMs;
    if (elapsedSinceLastOp4 < 6000) {
      Logger.warn("GUARD", `Opcode 4 throttled (minimum 6s interval; elapsed=${elapsedSinceLastOp4}ms)`);
      return false;
    }

    return true;
  }

  recordOpcode4Sent(isJtcLobby = false, isChannelJoin = true) {
    const now = Date.now();
    this.lastOpcode4SentMs = now;

    if (isChannelJoin) {
      this.recentJoins.push(now);
      // Keep only join attempts in last 60 seconds
      this.recentJoins = this.recentJoins.filter(t => (now - t) < 60000);
    }

    if (isJtcLobby) {
      this.isJtcMovePending = true;
      this.jtcMoveDeadline = now + 12000; // 12 seconds maximum wait for JTC move
    }

    // Self-healing circuit breaker: if > 3 channel joins in 60s, pause for 45s & reset to JTC lobby (DO NOT permanently lock)
    if (isChannelJoin && this.recentJoins.length > 3) {
      this.consecutiveFailures++;
      this.recentJoins = [];
      Logger.warn("ANTI_GLITCH", `Rapid join attempts detected. Engaging 45s self-healing cooldown and falling back to Join-to-Create lobby.`);
      if (localChannelId && localChannelId !== DEFAULT_JTC_LOBBY) {
        deadChannelsCache.add(String(localChannelId));
        localChannelId = DEFAULT_JTC_LOBBY;
        reportTelemetryToCloud(localActiveChannelId, localInVoice, "", false, DEFAULT_JTC_LOBBY);
      }
      this.triggerCooldown(45, "Self-healing anti-glitch protection before safe AFK rejoin");
      return false;
    }

    return true;
  }

  notifyJtcMoveComplete(newChannelId, channelName) {
    this.isJtcMovePending = false;
    this.jtcMoveDeadline = 0;
    this.consecutiveFailures = 0;
    Logger.info("JTC_ENGINE", `Successfully moved into dynamic room: "${channelName}" (${newChannelId})`);
  }

  triggerCooldown(seconds, reason) {
    this.isJtcMovePending = false;
    this.jtcMoveDeadline = 0;
    this.cooldownUntil = Date.now() + (seconds * 1000);

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    Logger.warn("COOLDOWN", `Starting protection countdown: ${seconds}s`, `reason="${reason}"`);
    let remaining = seconds;
    Logger.countdown(remaining, seconds, reason);

    this.countdownTimer = setInterval(() => {
      remaining = this.getRemainingCooldownSec();
      if (remaining <= 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        Logger.info("COOLDOWN", `Cooldown completed. Ready for next safe voice connection.`);
      } else if (remaining % 5 === 0 || remaining <= 5) {
        Logger.countdown(remaining, seconds, reason);
      }
    }, 1000);
  }

  reset() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.cooldownUntil = 0;
    this.isJtcMovePending = false;
    this.jtcMoveDeadline = 0;
    this.recentJoins = [];
  }
}

const antiGlitch = new AntiGlitchGuard();

// ============================================================================
// STATE VARIABLES
// ============================================================================
const channelNamesCache = new Map();
const deadChannelsCache = new Set();
let pendingJoinChannelId = null;
let pendingJoinDeadline = 0;
let lastAttemptedSwitchChan = "";

let ws = null;
let myUserId = null;
let mySessionId = null;
let isUserActiveOnOtherClient = false;
let userPcYieldTimer = null;
let sequence = null;
let heartbeatTimer = null;
let syncTimer = null;
let isConnected = false;
let lastHeartbeatAck = true;
let isEmergencyLocked = false;
let consecutiveRapidDrops = 0;
let lastVoiceJoinTimestamp = 0;

let localGuildId = process.env.GUILD_ID || cfg.saved_guild_id || "1442511921898192917";
let localChannelId = process.env.CHANNEL_ID || cfg.saved_channel_id || DEFAULT_JTC_LOBBY;
let localActiveChannelId = null;
let localDynamicChannelId = null; // Sticky JTC-created room
let localInVoice = false;
let currentVoiceMute = null;
let currentVoiceDeaf = null;
let desiredMute = true;
let desiredDeaf = true;
let lastMute = null;
let lastDeaf = null;
let lastTargetChan = "";
let lastActivityKey = "";
let lastHandledVoiceRequestAt = 0;
let lastTelemetryHeartbeatMs = 0;
let isStandbyMode = false;

// ============================================================================
// BUILT-IN HTTP SERVER (PASS CLOUD HEALTH CHECKS)
// ============================================================================
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    status: isConnected ? "online" : "connecting",
    service: "Discord Studio PRO — 24/7 Cloud Voice Engine (Node 22 Modern)",
    instance_id: daemonInstanceId,
    connected_to_discord: isConnected,
    user_id: myUserId,
    in_voice: localInVoice,
    active_channel: localActiveChannelId || localChannelId,
    dynamic_channel: localDynamicChannelId,
    user_active_on_pc: isUserActiveOnOtherClient,
    cooldown_remaining_sec: antiGlitch.getRemainingCooldownSec(),
    guild_id: localGuildId,
    uptime_seconds: Math.floor(process.uptime())
  }));
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    Logger.warn("HTTP_HEALTH", `Port ${PORT} already in use locally; continuing Gateway daemon without duplicate health port.`);
  }
});
server.listen(PORT, () => {
  Logger.info("HTTP_HEALTH", `Cloud Health check HTTP server running on port ${PORT}`);
});

// ============================================================================
// ACTIVITY APP REGISTRY
// ============================================================================
const APP_REGISTRY = {
  aftereffects: { id: "748568089939148832", name: "Adobe After Effects" },
  photoshop: { id: "748586506888806460", name: "Adobe Photoshop" },
  illustrator: { id: "751430009716998144", name: "Adobe Illustrator" },
  premiere: { id: "748580494324662353", name: "Adobe Premiere Pro" },
  figma: { id: "866719067092418580", name: "Figma" },
  vscode: { id: "810516608442695700", name: "Visual Studio Code" },
  gta6: { id: "1445160676522856458", name: "Grand Theft Auto VI" },
  valorant: { id: "700136079562375258", name: "VALORANT" },
  fortnite: { id: "432980957394370572", name: "Fortnite" },
  roblox: { id: "363445589247131668", name: "Roblox" },
  genshin: { id: "762434991303950386", name: "Genshin Impact" },
  oncehuman: { id: "1260340082150346932", name: "Once Human" },
  fc27: { id: "1531874756096295054", name: "EA SPORTS FC™ 27" },
  marvelrivals: { id: "1314395942253756416", name: "Marvel Rivals" },
  deltaforce: { id: "1314682894106497096", name: "Delta Force" },
  ror2: { id: "1402418087793528862", name: "Risk of Rain 2" },
  wherewindsmeet: { id: "1437509662303059998", name: "Where Winds Meet" },
  nte: { id: "1470616226995765409", name: "Neverness to Everness" },
  giants: { id: "1428223713928810496", name: "March of Giants" },
  hellraiser: { id: "1552168352116641822", name: "Clive Barker's Hellraiser: Revival" },
  helldivers2: { id: "1198592398579482654", name: "HELLDIVERS 2" },
  cyberpunk: { id: "658056503651106837", name: "Cyberpunk 2077" }
};

function cacheGuildChannels(guilds) {
  if (!Array.isArray(guilds)) return;
  for (const g of guilds) {
    if (Array.isArray(g.channels)) {
      for (const c of g.channels) {
        if (c.id && c.name) {
          channelNamesCache.set(String(c.id), String(c.name));
        }
      }
    }
  }
}

async function resolveChannelName(chanId) {
  if (!chanId) return "";
  const sId = String(chanId);
  if (channelNamesCache.has(sId)) {
    return channelNamesCache.get(sId);
  }
  try {
    const r = await fetch(`https://discord.com/api/v10/channels/${sId}`, {
      headers: { Authorization: TOKEN, "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(4000)
    });
    if (r.ok) {
      const d = await r.json();
      if (d && d.name) {
        channelNamesCache.set(sId, String(d.name));
        return String(d.name);
      }
    }
  } catch (e) {}
  return "";
}

async function verifyChannelExists(chanId) {
  if (!chanId) return false;
  const sId = String(chanId);
  if (sId === DEFAULT_JTC_LOBBY) return true;
  try {
    const r = await fetch(`https://discord.com/api/v10/channels/${sId}`, {
      headers: { Authorization: TOKEN, "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(4000)
    });
    return r.ok;
  } catch (e) {
    return true;
  }
}

function resolveAppInfo(act) {
  const givenAppId = String(act.application_id || act.client_id || "").trim();
  const rawKey = String(act.key || "").toLowerCase().trim();
  const rawName = String(act.name || "").toLowerCase().trim();
  const rawLargeText = String(act.large_text || "").toLowerCase().trim();
  const combined = `${rawName} ${rawLargeText}`.trim();

  if (rawKey && APP_REGISTRY[rawKey]) {
    return APP_REGISTRY[rawKey];
  }

  if (combined.includes("once human")) return APP_REGISTRY.oncehuman;
  if (combined.includes("fc 27") || combined.includes("fc27") || combined.includes("ea sports fc")) return APP_REGISTRY.fc27;
  if (combined.includes("marvel rivals") || combined.includes("marvel")) return APP_REGISTRY.marvelrivals;
  if (combined.includes("delta force")) return APP_REGISTRY.deltaforce;
  if (combined.includes("risk of rain")) return APP_REGISTRY.ror2;
  if (combined.includes("grand theft auto") || combined.includes("gta 6") || combined.includes("gta vi")) return APP_REGISTRY.gta6;
  if (combined.includes("visual studio code") || combined.includes("vscode")) return APP_REGISTRY.vscode;
  if (combined.includes("photoshop") || combined.includes("phxs")) return APP_REGISTRY.photoshop;
  if (combined.includes("after effect") || combined.includes("afterfx") || combined.includes("aeft")) return APP_REGISTRY.aftereffects;
  if (combined.includes("premiere") || combined.includes("ppro")) return APP_REGISTRY.premiere;
  if (combined.includes("figma")) return APP_REGISTRY.figma;
  if (combined.includes("valorant")) return APP_REGISTRY.valorant;
  if (combined.includes("fortnite")) return APP_REGISTRY.fortnite;
  if (combined.includes("roblox")) return APP_REGISTRY.roblox;
  if (combined.includes("genshin")) return APP_REGISTRY.genshin;
  if (combined.includes("neverness") || combined.includes("nte")) return APP_REGISTRY.nte;
  if (combined.includes("giants") || combined.includes("march of")) return APP_REGISTRY.giants;
  if (combined.includes("hellraiser")) return APP_REGISTRY.hellraiser;
  if (combined.includes("helldivers")) return APP_REGISTRY.helldivers2;
  if (combined.includes("cyberpunk")) return APP_REGISTRY.cyberpunk;
  if (combined.includes("illustrator") || combined.includes("ilst")) return APP_REGISTRY.illustrator;

  if (givenAppId) {
    for (const app of Object.values(APP_REGISTRY)) {
      if (app.id === givenAppId) return app;
    }
  }

  return {
    id: givenAppId,
    name: act.name || act.large_text || "Custom Activity"
  };
}

function hasValidActivity(act) {
  if (!act || act.cleared) return false;
  const name = (act.name || "").trim();
  const details = (act.details || "").trim();
  const state = (act.state || "").trim();
  if (!name && !details && !state) return false;
  if (name.toLowerCase().includes("illustrator") && !details && !state) return false;
  if ((act.key === "illustrator" || act.client_id === "751430009716998144" || act.application_id === "751430009716998144") && !details && !state) return false;
  return Boolean(name || details || state);
}

function buildPresence(act, startMs) {
  const activities = [];
  if (hasValidActivity(act)) {
    const appInfo = resolveAppInfo(act);
    const displayName = act.name || appInfo.name || "Custom Activity";
    const entry = {
      name: displayName,
      type: Number(act.type || 0),
      timestamps: { start: startMs || Date.now() }
    };
    if (act.details) entry.details = act.details;
    if (act.state) entry.state = act.state;
    if (appInfo.id) {
      entry.application_id = String(appInfo.id);
    }
    const assets = {};
    if (act.large_image && !act.large_image.startsWith("http://") && !act.large_image.startsWith("https://")) {
      assets.large_image = act.large_image;
    }
    if (act.large_text) assets.large_text = act.large_text;
    if (act.small_image && !act.small_image.startsWith("http://") && !act.small_image.startsWith("https://")) {
      assets.small_image = act.small_image;
    }
    if (act.small_text) assets.small_text = act.small_text;
    if (Object.keys(assets).length > 0) {
      entry.assets = assets;
    }
    activities.push(entry);
  }
  return {
    status: (act && act.status) || "online",
    since: 0,
    activities,
    afk: true
  };
}

// ============================================================================
// CLOUD SYNC & LEADER CONTROL
// ============================================================================
// ============================================================================
// EMERGENCY KILLSWITCH (MANUAL & AUTOMATIC)
// ============================================================================
async function triggerEmergencyKillswitch(reason = "Manual Trigger") {
  isEmergencyLocked = true;
  Logger.error("EMERGENCY", `⛔ EMERGENCY KILLSWITCH ENGAGED! Reason: "${reason}"`);
  Logger.error("EMERGENCY", "Forcefully leaving voice room and freezing all room joins to protect account from timeout.");

  if (ws && ws.readyState === 1) {
    try {
      ws.send(JSON.stringify({
        op: 4,
        d: {
          guild_id: String(localGuildId),
          channel_id: null,
          self_mute: true,
          self_deaf: true
        }
      }));
    } catch (e) {}
  }

  localInVoice = false;
  localActiveChannelId = null;
  localDynamicChannelId = null;

  try {
    await fetch(`${WORKER_URL}/api/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify({ action: "emergency_killswitch", reason }),
      signal: AbortSignal.timeout(4000)
    });
  } catch (e) {}
}

async function flushPendingLogsIfNeeded() {
  if (pendingCloudLogs.length > 0) {
    await reportTelemetryToCloud(localActiveChannelId, localInVoice);
  }
}

async function syncWithCloudWorker() {
  if (!isConnected || !ws || ws.readyState !== 1) return;

  try {
    const r = await fetch(`${WORKER_URL}/health`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(4000)
    });
    if (!r.ok) return;
    const remote = await r.json();

    // Emergency Killswitch Check from Cloud (Manual user trigger only)
    if (remote.emergency_locked) {
      if (!isEmergencyLocked) {
        isEmergencyLocked = true;
        pendingJoinChannelId = null;
        pendingJoinDeadline = 0;
        Logger.warn("EMERGENCY", "⛔ Cloud reported Emergency Lockout! Forcefully leaving voice room and locking.");
        if (localInVoice && ws && ws.readyState === 1) {
          try {
            ws.send(JSON.stringify({
              op: 4,
              d: { guild_id: String(localGuildId), channel_id: null, self_mute: true, self_deaf: true }
            }));
          } catch (e) {}
          localInVoice = false;
          localActiveChannelId = null;
          localDynamicChannelId = null;
        }
      }
      await flushPendingLogsIfNeeded();
      return;
    } else if (isEmergencyLocked && remote.emergency_locked === false) {
      isEmergencyLocked = false;
      consecutiveRapidDrops = 0;
      deadChannelsCache.clear();
      lastAttemptedSwitchChan = "";
      pendingJoinChannelId = null;
      pendingJoinDeadline = 0;
      antiGlitch.reset();
      Logger.info("SAFETY", "Emergency lockout cleared from Cloud Worker. Normal 24/7 AFK operation resumed.");
    }

    // Check if user clicked Join Voice Room on Web Dashboard
    let manualJoinTriggered = false;
    if (remote.voice_requested_at && Number(remote.voice_requested_at) > lastHandledVoiceRequestAt) {
      const isInitialBoot = (lastHandledVoiceRequestAt === 0);
      lastHandledVoiceRequestAt = Number(remote.voice_requested_at);
      if (!isInitialBoot) {
        manualJoinTriggered = true;
        deadChannelsCache.clear();
        lastAttemptedSwitchChan = "";
        pendingJoinChannelId = null;
        pendingJoinDeadline = 0;
        antiGlitch.reset();
        isUserActiveOnOtherClient = false;
        if (userPcYieldTimer) {
          clearTimeout(userPcYieldTimer);
          userPcYieldTimer = null;
        }
        Logger.info("VOICE", "Manual Join Voice Room request received from Web Dashboard. Executing immediate join...");
      }
    }

    // 0. Leader Lock & Active/Standby Failover Check
    if (remote.leader_instance_id && remote.leader_instance_id !== daemonInstanceId && remote.leader_alive) {
      if (IS_GITHUB_ACTIONS) {
        Logger.info("LEADER_LOCK", `Newer 24/7 runner (${remote.leader_instance_id}) active. Handing over session cleanly without voice teardown.`);
        await flushPendingLogsIfNeeded();
        if (ws && ws.readyState === 1) {
          try { ws.close(1000, "Clean runner handover"); } catch (e) {}
        }
        process.exit(0);
      } else {
        if (!isStandbyMode) {
          isStandbyMode = true;
          Logger.info("LEADER_LOCK", `Cloud runner (${remote.leader_instance_id}) is active. Local daemon entering Standby Failover mode (will auto-reclaim if cloud runner stops).`);
        }
        return;
      }
    } else if (!remote.leader_instance_id || !remote.leader_alive) {
      if (isStandbyMode) {
        isStandbyMode = false;
        Logger.info("LEADER_LOCK", `Cloud runner inactive. Local daemon reclaiming 24/7 leadership automatically!`);
      }
      await reportTelemetryToCloud(localActiveChannelId, localInVoice, "", true);
      lastTelemetryHeartbeatMs = Date.now();
    }

    // 1. Sync Guild ID
    if (remote.guild_id && remote.guild_id !== localGuildId) {
      localGuildId = remote.guild_id;
    }

    // 2. Sync Voice State
    const shouldBeInVoice = remote.in_voice !== false;
    let targetChan = String(remote.requested_channel_id || localChannelId || DEFAULT_JTC_LOBBY);
    if (deadChannelsCache.has(targetChan)) {
      targetChan = DEFAULT_JTC_LOBBY;
    }
    desiredDeaf = remote.self_deaf !== undefined ? Boolean(remote.self_deaf) : true;
    desiredMute = remote.self_mute !== undefined ? Boolean(remote.self_mute) : true;

    // Check if user actively joined voice on another client (PC / mobile)
    if (isUserActiveOnOtherClient) {
      await flushPendingLogsIfNeeded();
      return;
    }

    // Check if a pending join to a specific channel timed out without Discord letting us in (e.g. full/locked room)
    if (pendingJoinChannelId && Date.now() > pendingJoinDeadline) {
      const timedOutChan = pendingJoinChannelId;
      pendingJoinChannelId = null;
      pendingJoinDeadline = 0;
      if (localActiveChannelId !== timedOutChan) {
        if (timedOutChan !== DEFAULT_JTC_LOBBY) {
          Logger.warn("VOICE", `Channel ${timedOutChan} did not accept join after 10s (room may be full, locked, or deleted). Falling back to Join-to-Create Lobby (${DEFAULT_JTC_LOBBY}).`);
          deadChannelsCache.add(timedOutChan);
          targetChan = DEFAULT_JTC_LOBBY;
          localChannelId = DEFAULT_JTC_LOBBY;
          await reportTelemetryToCloud(localActiveChannelId, localInVoice, "", false, DEFAULT_JTC_LOBBY);
        } else if (!localInVoice) {
          antiGlitch.triggerCooldown(15, "Awaiting Discord voice server response before retry");
          await flushPendingLogsIfNeeded();
          return;
        }
      }
    }

    if (shouldBeInVoice) {
      // Are we already in a voice channel?
      if (localInVoice && localActiveChannelId) {
        // Check if user explicitly requested a DIFFERENT valid channel that we haven't already tried/failed
        const requestedDifferentSpecificChannel = (
          targetChan &&
          targetChan !== localActiveChannelId &&
          targetChan !== DEFAULT_JTC_LOBBY &&
          !deadChannelsCache.has(targetChan) &&
          (manualJoinTriggered || targetChan !== lastAttemptedSwitchChan)
        );

        if (requestedDifferentSpecificChannel) {
          const exists = await verifyChannelExists(targetChan);
          if (!exists) {
            Logger.warn("VOICE", `Requested channel ${targetChan} no longer exists. Staying in current room (${localActiveChannelId}) and resetting target to lobby.`);
            deadChannelsCache.add(targetChan);
            localChannelId = DEFAULT_JTC_LOBBY;
            await reportTelemetryToCloud(localActiveChannelId, true, "", false, DEFAULT_JTC_LOBBY);
            await flushPendingLogsIfNeeded();
            return;
          }

          if (antiGlitch.canAttemptOpcode4("switch_specific_channel")) {
            Logger.info("VOICE", `Switching to dashboard requested channel: ${targetChan}`);
            lastAttemptedSwitchChan = targetChan;
            pendingJoinChannelId = targetChan;
            pendingJoinDeadline = Date.now() + 10000;
            if (!antiGlitch.recordOpcode4Sent(false, true)) {
              await flushPendingLogsIfNeeded();
              return;
            }
            ws.send(JSON.stringify({
              op: 4,
              d: {
                guild_id: String(localGuildId),
                channel_id: String(targetChan),
                self_mute: desiredMute,
                self_deaf: desiredDeaf
              }
            }));
            localChannelId = targetChan;
            lastTargetChan = targetChan;
            lastMute = desiredMute;
            lastDeaf = desiredDeaf;
          }
          await flushPendingLogsIfNeeded();
          return;
        }

        // Otherwise we are already in our target room or generated JTC room!
        if (manualJoinTriggered) {
          const cName = await resolveChannelName(localActiveChannelId);
          Logger.info("VOICE", `Active in room: "${cName}" (${localActiveChannelId}) [mute=${desiredMute}, deaf=${desiredDeaf}]`);
        }

        const needsAudioUpdate = (desiredMute !== lastMute || desiredDeaf !== lastDeaf || manualJoinTriggered);
        if (needsAudioUpdate && antiGlitch.canAttemptOpcode4("audio_state_enforce")) {
          Logger.info("VOICE", `Enforcing audio state in room: Mute=${desiredMute}, Deaf=${desiredDeaf}`);
          antiGlitch.recordOpcode4Sent(false, false);
          ws.send(JSON.stringify({
            op: 4,
            d: {
              guild_id: String(localGuildId),
              channel_id: String(localActiveChannelId),
              self_mute: desiredMute,
              self_deaf: desiredDeaf
            }
          }));
          lastMute = desiredMute;
          lastDeaf = desiredDeaf;
        }
      } else {
        // We are NOT currently in voice. Wait if a join packet is already in flight
        if (pendingJoinChannelId && Date.now() < pendingJoinDeadline && !manualJoinTriggered) {
          await flushPendingLogsIfNeeded();
          return;
        }

        if (!antiGlitch.canAttemptOpcode4("join_voice_initial")) {
          await flushPendingLogsIfNeeded();
          return;
        }

        if (targetChan !== DEFAULT_JTC_LOBBY) {
          const exists = await verifyChannelExists(targetChan);
          if (!exists) {
            Logger.warn("VOICE", `Target channel ${targetChan} does not exist. Falling back to lobby: ${DEFAULT_JTC_LOBBY}`);
            deadChannelsCache.add(targetChan);
            targetChan = DEFAULT_JTC_LOBBY;
            localChannelId = targetChan;
            await reportTelemetryToCloud(null, false, "", false, DEFAULT_JTC_LOBBY);
          }
        }

        const isJoiningLobby = (targetChan === DEFAULT_JTC_LOBBY);
        Logger.info("VOICE", `Connecting to Voice Channel: ${targetChan} (Guild: ${localGuildId}) [mute=${desiredMute}, deaf=${desiredDeaf}]`);
        pendingJoinChannelId = targetChan;
        pendingJoinDeadline = Date.now() + 10000;
        if (!antiGlitch.recordOpcode4Sent(isJoiningLobby, true)) {
          await flushPendingLogsIfNeeded();
          return;
        }
        ws.send(JSON.stringify({
          op: 4,
          d: {
            guild_id: String(localGuildId),
            channel_id: String(targetChan),
            self_mute: desiredMute,
            self_deaf: desiredDeaf
          }
        }));
        localChannelId = targetChan;
        lastTargetChan = targetChan;
        lastMute = desiredMute;
        lastDeaf = desiredDeaf;
      }
    } else {
      // Cloud requested Leave Voice Room
      if (localInVoice && antiGlitch.canAttemptOpcode4("leave_voice")) {
        Logger.info("VOICE", "Cloud requested Leave Voice Room");
        antiGlitch.recordOpcode4Sent(false, false);
        ws.send(JSON.stringify({
          op: 4,
          d: {
            guild_id: String(localGuildId),
            channel_id: null,
            self_mute: true,
            self_deaf: true
          }
        }));
        localInVoice = false;
        localActiveChannelId = null;
        localDynamicChannelId = null;
        pendingJoinChannelId = null;
        pendingJoinDeadline = 0;
        lastTargetChan = "";
        lastMute = null;
        lastDeaf = null;
        await reportTelemetryToCloud(null, false, "");
      }
    }

    // 3. Sync Activity Presence
    const act = remote.activity || {};
    const isValid = hasValidActivity(act);
    const actKey = isValid
      ? `${act.name || ""}_${act.details || ""}_${act.state || ""}_${act.client_id || ""}_${act.application_id || ""}_${remote.startTimestampMs || 0}_${act.status || ""}`
      : "CLEARED_ACTIVITY";

    if (actKey !== lastActivityKey) {
      Logger.info("ACTIVITY", `Updating presence: ${isValid ? `"${act.name || act.large_text}"` : "CLEARED"}`);
      const presencePayload = buildPresence(isValid ? act : null, remote.startTimestampMs);
      ws.send(JSON.stringify({
        op: 3,
        d: presencePayload
      }));
      lastActivityKey = actKey;
    }

    if (pendingCloudLogs.length > 0 || (Date.now() - lastTelemetryHeartbeatMs) > 8000) {
      await reportTelemetryToCloud(localActiveChannelId, localInVoice);
      lastTelemetryHeartbeatMs = Date.now();
    }
  } catch (err) {
    // Transient sync network error
  }
}

async function reportTelemetryToCloud(activeChan, inVoice, chanName = "", registerLeader = false, resetRequestedChan = "") {
  try {
    const logsToSend = pendingCloudLogs.splice(0, pendingCloudLogs.length);
    const payload = {
      instance_id: daemonInstanceId,
      active_channel_id: activeChan || null,
      in_voice: Boolean(inVoice),
      logs: logsToSend
    };
    if (registerLeader) {
      payload.register_leader = true;
    }
    if (chanName) {
      payload.channel_name = chanName;
    }
    if (resetRequestedChan) {
      payload.reset_requested_channel = String(resetRequestedChan);
    }
    await fetch(`${WORKER_URL}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000)
    });
  } catch (e) {}
}

// ============================================================================
// GATEWAY WEBSOCKET CONTROLLER
// ============================================================================
const processedMessageIds = new Set();
let mentionPollTimer = null;
let lastLocalWaPopupMs = 0;

async function handleIncomingDiscordMessage(msg) {
  try {
    // Strictly ignore all bots and webhooks — only real human users allowed!
    if (!msg || !msg.author || msg.author.bot === true || msg.webhook_id) return;

    const msgId = String(msg.id || "");
    if (!msgId || processedMessageIds.has(msgId)) return;

    // Ignore old historical messages from before this daemon booted
    if (msg.timestamp) {
      const msgTimeMs = Date.parse(msg.timestamp);
      if (!isNaN(msgTimeMs) && msgTimeMs < (daemonBootMs - 10000)) {
        processedMessageIds.add(msgId);
        return;
      }
    }

    const isFromSelf = String(msg.author.id) === String(myUserId);
    const isDm = !msg.guild_id;
    const contentStr = String(msg.content || "");

    const isMentioned = (
      (Array.isArray(msg.mentions) && msg.mentions.some(u => String(u.id) === String(myUserId))) ||
      contentStr.includes(`<@${myUserId}>`) ||
      contentStr.includes(`<@!${myUserId}>`) ||
      String(msg.referenced_message?.author?.id || "") === String(myUserId) ||
      contentStr.toLowerCase().includes("la2nis")
    );
    // Allow self-tags (isMentioned) so tagging yourself to test always works!
    // For un-tagged DMs or voice room chat, only trigger on other people.
    const isActiveVoiceRoomMsg = Boolean(!isFromSelf && localActiveChannelId && String(msg.channel_id) === String(localActiveChannelId));
    const isHumanDm = Boolean(!isFromSelf && isDm);

    if (!isMentioned && !isHumanDm && !isActiveVoiceRoomMsg) return;

    processedMessageIds.add(msgId);
    if (processedMessageIds.size > 300) {
      const first = processedMessageIds.values().next().value;
      processedMessageIds.delete(first);
    }

    const alertType = isHumanDm ? "DM" : (isMentioned ? "MENTION" : "VOICE_CHAT");
    const authorLabel = msg.author.global_name
      ? `${msg.author.global_name} (@${msg.author.username})`
      : `@${msg.author.username || "User"}`;
    const chanName = isDm
      ? "Direct Message (DM)"
      : ((await resolveChannelName(msg.channel_id)) || `Channel ${msg.channel_id}`);
    const cleanContent = (contentStr || "[Attachment / Sticker / Voice Message]").trim().slice(0, 280);

    Logger.info("NOTIFY", `🔔 [${alertType}] From ${authorLabel} in ${chanName}: "${cleanContent}"`);

    // 1. Forward to Cloud Worker (updates Web Dashboard Inbox, Desktop App Inbox, Browser Push & CallMeBot)
    fetch(`${WORKER_URL}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify({
        action: "incoming_message",
        alert: {
          id: msgId,
          type: alertType,
          author: authorLabel,
          channel_id: String(msg.channel_id || ""),
          channel_name: chanName,
          content: cleanContent
        }
      }),
      signal: AbortSignal.timeout(5000)
    }).catch(() => {});

    // 2. If running locally on Windows PC, play chime & auto-send WhatsApp message to +21654096479
    if (!IS_GITHUB_ACTIONS && process.platform === "win32") {
      const now = Date.now();
      if ((now - lastLocalWaPopupMs) > 8000) {
        lastLocalWaPopupMs = now;
        const waText = (
          `🔔 *Discord ${alertType} Alert*\n` +
          `👤 *From:* ${authorLabel}\n` +
          `📍 *Where:* ${chanName}\n` +
          `💬 *Message:* ${cleanContent}`
        );
        const sendScript = path.resolve(__dirname, "..", "core", "send_whatsapp.py");
        exec(`powershell -NoProfile -WindowStyle Hidden -Command "[console]::beep(880,140); [console]::beep(1175,220); python '${sendScript}' '21654096479' '${waText.replace(/'/g, "''")}'"`, () => {});
      }
    }
  } catch (e) {}
}

async function pollDiscordMentions() {
  if (!TOKEN || !myUserId || isStandbyMode) return;
  try {
    // 1. Check global @mentions across ALL servers
    const r1 = await fetch("https://discord.com/api/v10/users/@me/mentions?limit=6&roles=true&everyone=false", {
      headers: { Authorization: TOKEN, "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(4000)
    });
    if (r1.ok) {
      const mentions = await r1.json();
      if (Array.isArray(mentions)) {
        for (const m of mentions.reverse()) {
          await handleIncomingDiscordMessage(m);
        }
      }
    }
  } catch (e) {}

  try {
    // 2. Check mentions in active server (also catches self-tags <@myUserId> used for testing!)
    if (localGuildId) {
      const r2 = await fetch(`https://discord.com/api/v10/guilds/${localGuildId}/messages/search?mentions=${myUserId}&include_nsfw=true`, {
        headers: { Authorization: TOKEN, "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(4000)
      });
      if (r2.ok) {
        const searchData = await r2.json();
        if (Array.isArray(searchData?.messages)) {
          for (const group of searchData.messages.slice(0, 4).reverse()) {
            const hit = Array.isArray(group) ? group.find(x => x.hit) || group[0] : null;
            if (hit) await handleIncomingDiscordMessage(hit);
          }
        }
      }
    }
  } catch (e) {}
}

function connectGateway() {
  if (!TOKEN) {
    Logger.error("AUTH", "No DISCORD_TOKEN provided. Please set DISCORD_TOKEN in GitHub Secrets.");
    return;
  }

  Logger.info("GATEWAY", `Connecting to Discord Gateway (v=10, token: ${TOKEN.slice(0, 6)}...${TOKEN.slice(-4)})`);
  ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");

  ws.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(typeof event.data === "string" ? event.data : event.data.toString());
      if (data.s !== null && data.s !== undefined) sequence = data.s;

      // OP 10: Hello
      if (data.op === 10) {
        const interval = data.d?.heartbeat_interval || 41250;
        lastHeartbeatAck = true;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          if (!lastHeartbeatAck) {
            Logger.warn("HEARTBEAT", "Heartbeat ACK missed! Connection is unresponsive. Forcing reconnect...");
            try { ws.close(4000, "Heartbeat ACK timeout"); } catch (e) {}
            return;
          }
          lastHeartbeatAck = false;
          try { ws.send(JSON.stringify({ op: 1, d: sequence })); } catch (e) {}
        }, interval);

        // Identify
        ws.send(JSON.stringify({
          op: 2,
          d: {
            token: TOKEN,
            properties: { os: "Windows", browser: "Chrome", device: "" }
          }
        }));
      }

      // OP 11: Heartbeat ACK
      else if (data.op === 11) {
        lastHeartbeatAck = true;
      }

      // OP 0: Dispatch
      else if (data.op === 0) {
        // READY Event
        if (data.t === "READY") {
          myUserId = String(data.d?.user?.id || "");
          mySessionId = String(data.d?.session_id || "");
          isConnected = true;
          Logger.info("AUTH", `Logged in as ${data.d?.user?.username} (ID: ${myUserId}) | Session: ${mySessionId}`);

          cacheGuildChannels(data.d?.guilds);

          // Check if already in voice from Discord Gateway
          if (Array.isArray(data.d?.guilds)) {
            for (const g of data.d.guilds) {
              if (Array.isArray(g.voice_states)) {
                const myState = g.voice_states.find(vs => String(vs.user_id) === String(myUserId));
                if (myState && myState.channel_id) {
                  localActiveChannelId = String(myState.channel_id);
                  localInVoice = true;
                  localGuildId = String(g.id);
                  currentVoiceMute = Boolean(myState.self_mute);
                  currentVoiceDeaf = Boolean(myState.self_deaf);
                  const cName = await resolveChannelName(localActiveChannelId);

                  if (localActiveChannelId !== DEFAULT_JTC_LOBBY) {
                    localDynamicChannelId = localActiveChannelId;
                  }

                  if (myState.session_id && String(myState.session_id) !== String(mySessionId)) {
                    isUserActiveOnOtherClient = true;
                    Logger.info("YIELD", `Detected active PC/Mobile voice session in "${cName}" (${localActiveChannelId}). Monitoring without interrupting.`);
                  } else {
                    Logger.info("VOICE", `Resumed active voice session from gateway in "${cName}" (${localActiveChannelId})`);
                  }
                  reportTelemetryToCloud(localActiveChannelId, true, cName);
                  break;
                }
              }
            }
          }

          // If voice state was not present in gateway guilds, check Cloud Worker telemetry for active dynamic room
          if (!localActiveChannelId) {
            try {
              const r = await fetch(`${WORKER_URL}/health`, {
                headers: { "User-Agent": "Mozilla/5.0" },
                signal: AbortSignal.timeout(4000)
              });
              if (r.ok) {
                const remote = await r.json();
                if (remote.active_channel_id && remote.active_channel_id !== DEFAULT_JTC_LOBBY) {
                  const exists = await verifyChannelExists(remote.active_channel_id);
                  if (exists) {
                    localActiveChannelId = String(remote.active_channel_id);
                    localDynamicChannelId = String(remote.active_channel_id);
                    localInVoice = true;
                    const cName = remote.channel_name || await resolveChannelName(localActiveChannelId);
                    Logger.info("SESSION_HANDOVER", `Adopted existing active dynamic voice room from cloud telemetry: "${cName}" (${localActiveChannelId})`);
                    reportTelemetryToCloud(localActiveChannelId, true, cName);
                  }
                }
              }
            } catch (e) {}
          }

          // Subscribe to Guilds via Opcode 37 & Opcode 14 so Discord Gateway streams all live MESSAGE_CREATE events!
          try {
            const subs = {};
            if (Array.isArray(data.d?.guilds)) {
              for (const g of data.d.guilds.slice(0, 50)) {
                if (g?.id) subs[String(g.id)] = { typing: true, activities: true, threads: true };
              }
            }
            if (localGuildId) {
              subs[String(localGuildId)] = { typing: true, activities: true, threads: true };
            }
            ws.send(JSON.stringify({ op: 37, d: { subscriptions: subs } }));
            if (localGuildId) {
              ws.send(JSON.stringify({ op: 14, d: { guild_id: String(localGuildId), typing: true, activities: true, threads: true } }));
            }
          } catch (e) {}

          if (mentionPollTimer) clearInterval(mentionPollTimer);
          mentionPollTimer = setInterval(pollDiscordMentions, 5000);

          // Start 2.5s Cloud Dashboard Sync Loop
          if (syncTimer) clearInterval(syncTimer);
          syncTimer = setInterval(syncWithCloudWorker, 1500);

          // Register this runner as the active leader
          reportTelemetryToCloud(localActiveChannelId, localInVoice, "", true);

          // Trigger immediate first sync
          setTimeout(syncWithCloudWorker, 500);
        }

        // Channel updates
        else if (data.t === "CHANNEL_CREATE" || data.t === "CHANNEL_UPDATE") {
          if (data.d?.id && data.d?.name) {
            channelNamesCache.set(String(data.d.id), String(data.d.name));
          }
        } else if (data.t === "GUILD_CREATE") {
          cacheGuildChannels([data.d]);
        } else if (data.t === "MESSAGE_CREATE") {
          handleIncomingDiscordMessage(data.d);
        }

        // VOICE_STATE_UPDATE
        else if (data.t === "VOICE_STATE_UPDATE") {
          if (String(data.d?.user_id) === myUserId) {
            const eventSessionId = String(data.d?.session_id || "");
            const newChannelId = data.d?.channel_id ? String(data.d.channel_id) : null;

            // Scenario 1: User joined or moved to a voice channel
            if (newChannelId) {
              const prevChannelId = localActiveChannelId;
              const cName = await resolveChannelName(newChannelId);
              localActiveChannelId = newChannelId;
              localInVoice = true;
              currentVoiceMute = Boolean(data.d.self_mute);
              currentVoiceDeaf = Boolean(data.d.self_deaf);

              // Did another client (PC / Mobile) join or move voice?
              const isOtherClient = Boolean(mySessionId && eventSessionId && eventSessionId !== mySessionId);
              if (isOtherClient) {
                const wasAlreadyYieldingSameRoom = (isUserActiveOnOtherClient && prevChannelId === newChannelId);
                isUserActiveOnOtherClient = true;
                if (userPcYieldTimer) {
                  clearTimeout(userPcYieldTimer);
                  userPcYieldTimer = null;
                }
                if (!wasAlreadyYieldingSameRoom) {
                  Logger.info("YIELD", `User active on PC/Mobile in room "${cName}" (${newChannelId}). Daemon yielding voice control.`);
                }
                reportTelemetryToCloud(newChannelId, true, cName);
                return;
              }

              lastVoiceJoinTimestamp = Date.now();
              consecutiveRapidDrops = 0;
              pendingJoinChannelId = null;
              pendingJoinDeadline = 0;

              // Check if server JTC bot moved us from lobby into dynamic room
              if (antiGlitch.isJtcMovePending && newChannelId !== DEFAULT_JTC_LOBBY) {
                localDynamicChannelId = newChannelId;
                antiGlitch.notifyJtcMoveComplete(newChannelId, cName);
                reportTelemetryToCloud(newChannelId, true, cName);
                return;
              }

              if (newChannelId === DEFAULT_JTC_LOBBY) {
                Logger.info("JTC_ENGINE", `In Join-to-Create lobby (${newChannelId}). Awaiting dynamic room creation by server bot...`);
              } else {
                localDynamicChannelId = newChannelId;
                Logger.info("VOICE", `Active in room: "${cName}" (${newChannelId}) [mute=${currentVoiceMute}, deaf=${currentVoiceDeaf}]`);
              }
              reportTelemetryToCloud(newChannelId, true, cName);
            }

            // Scenario 2: Disconnected from voice
            else {
              const wasDynamicRoom = Boolean(localDynamicChannelId);
              const wasAwaitingJtc = antiGlitch.isJtcMovePending;
              Logger.warn("VOICE", `Disconnected from voice channel (wasInRoom: ${localActiveChannelId || 'none'}, awaitingJTC: ${wasAwaitingJtc})`);

              localActiveChannelId = null;
              localDynamicChannelId = null;
              localInVoice = false;
              currentVoiceMute = null;
              currentVoiceDeaf = null;
              lastMute = null;
              lastDeaf = null;
              reportTelemetryToCloud(null, false, "");

              // If user was on PC and left voice, give a 15-second grace countdown before resuming AFK
              if (isUserActiveOnOtherClient) {
                if (userPcYieldTimer) clearTimeout(userPcYieldTimer);
                antiGlitch.triggerCooldown(15, "User left voice on PC/Mobile. Grace countdown before AFK resume");
                userPcYieldTimer = setTimeout(() => {
                  isUserActiveOnOtherClient = false;
                  userPcYieldTimer = null;
                  Logger.info("YIELD", "PC/Mobile grace period ended. Ready to resume 24/7 AFK mode.");
                }, 15000);
                return;
              }

              const staySec = (Date.now() - lastVoiceJoinTimestamp) / 1000;
              // Self-healing cooldown on 2 consecutive rapid drops (<12s) instead of permanent lockout
              if (staySec < 12.0 && !isUserActiveOnOtherClient && !isEmergencyLocked && lastVoiceJoinTimestamp > 0) {
                consecutiveRapidDrops++;
                Logger.warn("ANTI_GLITCH", `Rapid voice drop detected (${consecutiveRapidDrops}/2) in ${staySec.toFixed(1)}s.`);
                if (consecutiveRapidDrops >= 2) {
                  consecutiveRapidDrops = 0;
                  Logger.warn("ANTI_GLITCH", "2 consecutive rapid room drops detected. Engaging 45s safety cooldown and falling back to Join-to-Create lobby.");
                  if (localChannelId && localChannelId !== DEFAULT_JTC_LOBBY) {
                    deadChannelsCache.add(String(localChannelId));
                    localChannelId = DEFAULT_JTC_LOBBY;
                    reportTelemetryToCloud(null, false, "", false, DEFAULT_JTC_LOBBY);
                  }
                  antiGlitch.triggerCooldown(45, "Self-healing protection after 2 rapid drops");
                  return;
                }
              } else {
                consecutiveRapidDrops = 0;
              }

              // If room creation failed or disconnected immediately during JTC creation:
              if (wasAwaitingJtc || wasDynamicRoom) {
                antiGlitch.triggerCooldown(30, "Room disconnected/deleted. Circuit breaker cooling down to strictly prevent channel creation loops");
              } else {
                antiGlitch.triggerCooldown(15, "Voice disconnected. Cooldown backoff before safe reconnect");
              }
            }
          }
        }
      }

      // OP 1: Heartbeat
      else if (data.op === 1) {
        ws.send(JSON.stringify({ op: 1, d: sequence }));
      }

      // OP 7 (Reconnect) or OP 9 (Invalid Session)
      else if (data.op === 7 || data.op === 9) {
        Logger.warn("GATEWAY", `Received OP ${data.op}. Reconnecting WebSocket session...`);
        try { ws.close(); } catch (e) {}
      }
    } catch (e) {
      Logger.error("EVENT_PARSE", `Failed processing event: ${e.message}`);
    }
  });

  ws.addEventListener("close", (e) => {
    isConnected = false;
    localInVoice = false;
    localActiveChannelId = null;
    localDynamicChannelId = null;
    currentVoiceMute = null;
    currentVoiceDeaf = null;
    isUserActiveOnOtherClient = false;
    lastHeartbeatAck = true;

    if (userPcYieldTimer) {
      clearTimeout(userPcYieldTimer);
      userPcYieldTimer = null;
    }
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (syncTimer) clearInterval(syncTimer);

    if (e.code === 4004) {
      Logger.error("AUTH", "Authentication Failed (code: 4004)! The token was rejected by Discord.");
      process.exit(1);
    }

    Logger.warn("GATEWAY", `Gateway closed (code: ${e.code}). Reconnecting in 6s...`);
    setTimeout(connectGateway, 6000);
  });

  ws.addEventListener("error", (err) => {
    Logger.error("GATEWAY", `WebSocket connection error: ${err.message || err}`);
    try { ws.close(); } catch (e) {}
  });
}

connectGateway();
