import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

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

let ws = null;
let myUserId = null;
let sequence = null;
let heartbeatTimer = null;
let syncTimer = null;
let isConnected = false;

let localGuildId = process.env.GUILD_ID || cfg.saved_guild_id || "1442511921898192917";
let localChannelId = process.env.CHANNEL_ID || cfg.saved_channel_id || "1484570674659070063";
let localActiveChannelId = null;
let localInVoice = false;
let lastMute = null;
let lastDeaf = null;
let lastTargetChan = "";
let lastActivityKey = "";

// 1. Built-in HTTP server to pass cloud health checks (Render, Koyeb, Railway, etc.)
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    status: isConnected ? "online" : "connecting",
    service: "Discord Studio PRO — 24/7 Cloud Voice Engine",
    connected_to_discord: isConnected,
    user_id: myUserId,
    in_voice: localInVoice,
    active_channel: localActiveChannelId || localChannelId,
    guild_id: localGuildId,
    uptime_seconds: Math.floor(process.uptime())
  }));
});

server.listen(PORT, () => {
  console.log(`[VoiceDaemon] 🌐 Cloud Health check HTTP server running on port ${PORT}`);
});

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
  nte: { id: "1470616226995765409", name: "Neverness to Everness" },
  giants: { id: "1428223713928810496", name: "March of Giants" },
  hellraiser: { id: "1552168352116641822", name: "Clive Barker's Hellraiser: Revival" },
  helldivers2: { id: "1198592398579482654", name: "HELLDIVERS 2" },
  cyberpunk: { id: "658056503651106837", name: "Cyberpunk 2077" }
};

function resolveAppInfo(act) {
  const rawKey = (act.key || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const rawName = (act.name || act.large_text || "").toLowerCase();

  // 1. Exact preset key match
  if (rawKey && APP_REGISTRY[rawKey]) {
    return APP_REGISTRY[rawKey];
  }

  // 2. Keyword matching on name or title to guarantee correct official app ID
  if (rawName.includes("after effect") || rawName.includes("afterfx") || rawName.includes("aeft")) {
    return APP_REGISTRY.aftereffects;
  }
  if (rawName.includes("photoshop") || rawName.includes("phxs")) {
    return APP_REGISTRY.photoshop;
  }
  if (rawName.includes("premiere") || rawName.includes("ppro")) {
    return APP_REGISTRY.premiere;
  }
  if (rawName.includes("illustrator") || rawName.includes("ilst")) {
    return APP_REGISTRY.illustrator;
  }
  if (rawName.includes("figma")) {
    return APP_REGISTRY.figma;
  }
  if (rawName.includes("grand theft auto") || rawName.includes("gta 6") || rawName.includes("gta vi")) {
    return APP_REGISTRY.gta6;
  }
  if (rawName.includes("visual studio code") || rawName.includes("vscode")) {
    return APP_REGISTRY.vscode;
  }
  if (rawName.includes("valorant")) {
    return APP_REGISTRY.valorant;
  }
  if (rawName.includes("fortnite")) {
    return APP_REGISTRY.fortnite;
  }
  if (rawName.includes("roblox")) {
    return APP_REGISTRY.roblox;
  }
  if (rawName.includes("genshin")) {
    return APP_REGISTRY.genshin;
  }
  if (rawName.includes("neverness") || rawName.includes("nte")) {
    return APP_REGISTRY.nte;
  }
  if (rawName.includes("giants") || rawName.includes("march of")) {
    return APP_REGISTRY.giants;
  }
  if (rawName.includes("hellraiser")) {
    return APP_REGISTRY.hellraiser;
  }
  if (rawName.includes("helldivers")) {
    return APP_REGISTRY.helldivers2;
  }
  if (rawName.includes("cyberpunk")) {
    return APP_REGISTRY.cyberpunk;
  }

  // 3. Fallback to application_id or client_id (application_id takes priority)
  const appId = String(act.application_id || act.client_id || "");
  return { id: appId, name: act.name || act.large_text || "Custom Activity" };
}

function hasValidActivity(act) {
  if (!act || act.cleared) return false;
  const name = (act.name || "").trim();
  const details = (act.details || "").trim();
  const state = (act.state || "").trim();
  const largeText = (act.large_text || "").trim();
  return Boolean(name || details || state || largeText);
}

function buildPresence(act, startMs) {
  const activities = [];
  if (hasValidActivity(act)) {
    const appInfo = resolveAppInfo(act);
    const displayName = act.name || act.large_text || appInfo.name || "Custom Activity";
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

async function syncWithCloudWorker() {
  if (!isConnected || !ws || ws.readyState !== 1) return;
  try {
    const r = await fetch(`${WORKER_URL}/health`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!r.ok) return;
    const remote = await r.json();

    // 1. Sync Guild ID
    if (remote.guild_id && remote.guild_id !== localGuildId) {
      localGuildId = remote.guild_id;
    }

    // 2. Sync Voice Room State
    const shouldBeInVoice = remote.in_voice !== false;
    const targetChan = remote.requested_channel_id || "1484570674659070063";
    const selfDeaf = Boolean(remote.self_deaf || false);
    const selfMute = remote.self_mute !== undefined ? Boolean(remote.self_mute) : true;

    if (shouldBeInVoice) {
      if (!localInVoice) {
        // Not currently in any voice channel: Join the target lobby
        console.log(`[VoiceDaemon] 🔊 Connecting to Voice Room: ${targetChan} (guild: ${localGuildId})`);
        ws.send(JSON.stringify({
          op: 4,
          d: {
            guild_id: String(localGuildId),
            channel_id: String(targetChan),
            self_mute: selfMute,
            self_deaf: selfDeaf
          }
        }));
        localChannelId = targetChan;
        lastTargetChan = targetChan;
        lastMute = selfMute;
        lastDeaf = selfDeaf;
      } else {
        // Already in voice! Stay put. Never re-trigger Join-to-Create lobby.
        // Only update mute/deaf state if changed, or if user explicitly requested a DIFFERENT channel
        if (remote.requested_channel_id && remote.requested_channel_id !== lastTargetChan && remote.requested_channel_id !== localActiveChannelId) {
          console.log(`[VoiceDaemon] 🔀 Switching to requested Channel: ${remote.requested_channel_id}`);
          ws.send(JSON.stringify({
            op: 4,
            d: {
              guild_id: String(localGuildId),
              channel_id: String(remote.requested_channel_id),
              self_mute: selfMute,
              self_deaf: selfDeaf
            }
          }));
          localChannelId = remote.requested_channel_id;
          lastTargetChan = remote.requested_channel_id;
        } else if (selfMute !== lastMute || selfDeaf !== lastDeaf) {
          console.log(`[VoiceDaemon] 🎙️ Updating Mute (${selfMute}) / Deaf (${selfDeaf})`);
          ws.send(JSON.stringify({
            op: 4,
            d: {
              guild_id: String(localGuildId),
              channel_id: String(localActiveChannelId || localChannelId),
              self_mute: selfMute,
              self_deaf: selfDeaf
            }
          }));
          lastMute = selfMute;
          lastDeaf = selfDeaf;
        }
      }
    } else {
      if (localInVoice) {
        console.log("[VoiceDaemon] ⚪ Cloud requested Leave Voice Room");
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
        lastTargetChan = "";
      }
    }

    // 3. Sync Activity Presence
    const act = remote.activity || {};
    const isValid = hasValidActivity(act);
    const actKey = isValid
      ? `${act.name || ""}_${act.details || ""}_${act.state || ""}_${act.client_id || ""}_${act.application_id || ""}_${remote.startTimestampMs || 0}_${act.status || ""}`
      : "CLEARED_ACTIVITY";

    if (actKey !== lastActivityKey) {
      console.log(`[VoiceDaemon] ✨ Cloud requested Activity: ${isValid ? `"${act.name || act.large_text}" - "${act.details || ''}"` : "⚪ REMOVED / CLEARED"}`);
      const presencePayload = buildPresence(isValid ? act : null, remote.startTimestampMs);
      ws.send(JSON.stringify({
        op: 3,
        d: presencePayload
      }));
      lastActivityKey = actKey;
    }
  } catch (err) {
    // transient fetch error
  }
}

async function reportTelemetryToCloud(activeChan, inVoice) {
  try {
    await fetch(`${WORKER_URL}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify({
        active_channel_id: activeChan,
        in_voice: inVoice
      })
    });
  } catch (e) {}
}

function connectGateway() {
  if (!TOKEN) {
    console.error("[VoiceDaemon] ❌ Error: No DISCORD_TOKEN provided. Please set DISCORD_TOKEN environment variable.");
    return;
  }

  console.log(`[VoiceDaemon] 🔑 Token check: starts with "${TOKEN.slice(0, 6)}...", total length: ${TOKEN.length}`);
  console.log("[VoiceDaemon] 🚀 Connecting to Discord Gateway...");
  ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");

  ws.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(typeof event.data === "string" ? event.data : event.data.toString());
      if (data.s !== null && data.s !== undefined) sequence = data.s;

      if (data.op === 10) {
        const interval = data.d?.heartbeat_interval || 41250;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          try { ws.send(JSON.stringify({ op: 1, d: sequence })); } catch (e) {}
        }, interval);

        ws.send(JSON.stringify({
          op: 2,
          d: {
            token: TOKEN,
            properties: { os: "Windows", browser: "Chrome", device: "" }
          }
        }));
      } else if (data.op === 0 && data.t === "READY") {
        myUserId = String(data.d?.user?.id || "");
        isConnected = true;
        console.log(`[VoiceDaemon] 🎉 Logged in as ${data.d?.user?.username} (${myUserId})`);

        // Start 2.5s Cloud Dashboard Sync Loop
        if (syncTimer) clearInterval(syncTimer);
        syncTimer = setInterval(syncWithCloudWorker, 2500);

        // Immediate first sync with Cloudflare worker
        setTimeout(syncWithCloudWorker, 300);
      } else if (data.op === 0 && data.t === "VOICE_STATE_UPDATE") {
        if (String(data.d?.user_id) === myUserId) {
          if (data.d?.channel_id) {
            localActiveChannelId = String(data.d.channel_id);
            localInVoice = true;
            localChannelId = localActiveChannelId;
            console.log(`[VoiceDaemon] ✅ Active in Voice Room: ${localActiveChannelId}`);
            reportTelemetryToCloud(localActiveChannelId, true);
          } else {
            console.log("[VoiceDaemon] ⚠️ Disconnected from voice channel");
            localActiveChannelId = null;
            localInVoice = false;
            reportTelemetryToCloud(null, false);
          }
        }
      } else if (data.op === 1) {
        ws.send(JSON.stringify({ op: 1, d: sequence }));
      } else if (data.op === 7 || data.op === 9) {
        try { ws.close(); } catch (e) {}
      }
    } catch (e) {}
  });

  ws.addEventListener("close", (e) => {
    isConnected = false;
    localInVoice = false;
    localActiveChannelId = null;
    lastTargetChan = "";
    lastMute = null;
    lastDeaf = null;
    lastActivityKey = "";
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (syncTimer) clearInterval(syncTimer);
    if (e.code === 4004) {
      console.error(`[VoiceDaemon] ❌ Authentication Failed (code: 4004)! The token was rejected by Discord.`);
      console.error(`[VoiceDaemon] Token length: ${TOKEN.length}, preview: ${TOKEN.slice(0, 6)}...${TOKEN.slice(-4)}`);
      console.error(`[VoiceDaemon] Please ensure DISCORD_TOKEN in GitHub Secrets contains the exact token without extra quotes or spaces.`);
      process.exit(1);
    }
    console.log(`[VoiceDaemon] Gateway closed (code: ${e.code}). Reconnecting in 4s...`);
    setTimeout(connectGateway, 4000);
  });

  ws.addEventListener("error", (err) => {
    console.log(`[VoiceDaemon] WebSocket error: ${err.message || err}`);
    try { ws.close(); } catch (e) {}
  });
}

connectGateway();
