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
const DEFAULT_JTC_LOBBY = "1484570674659070063";

const channelNamesCache = new Map();

let ws = null;
let myUserId = null;
let mySessionId = null;
let isUserActiveOnOtherClient = false;
let resumeAfkTimer = null;
let sequence = null;
let heartbeatTimer = null;
let syncTimer = null;
let isConnected = false;
let lastHeartbeatAck = true;
let lastJoinInitiatedMs = 0;
let lastOpcode4SentMs = 0;

let localGuildId = process.env.GUILD_ID || cfg.saved_guild_id || "1442511921898192917";
let localChannelId = process.env.CHANNEL_ID || cfg.saved_channel_id || DEFAULT_JTC_LOBBY;
let localActiveChannelId = null;
let localInVoice = false;
let currentVoiceMute = null;
let currentVoiceDeaf = null;
let desiredMute = true;
let desiredDeaf = true;
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
    user_active_on_pc: isUserActiveOnOtherClient,
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
      headers: { Authorization: TOKEN, "User-Agent": "Mozilla/5.0" }
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
      headers: { Authorization: TOKEN, "User-Agent": "Mozilla/5.0" }
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

  // 0. Direct match by preset key if present
  if (rawKey && APP_REGISTRY[rawKey]) {
    return APP_REGISTRY[rawKey];
  }

  // 1. Keyword matching on name or large_text first (prioritizes user-selected title over stale ID)
  if (combined.includes("grand theft auto") || combined.includes("gta 6") || combined.includes("gta vi")) {
    return APP_REGISTRY.gta6;
  }
  if (combined.includes("visual studio code") || combined.includes("vscode")) {
    return APP_REGISTRY.vscode;
  }
  if (combined.includes("photoshop") || combined.includes("phxs")) {
    return APP_REGISTRY.photoshop;
  }
  if (combined.includes("after effect") || combined.includes("afterfx") || combined.includes("aeft")) {
    return APP_REGISTRY.aftereffects;
  }
  if (combined.includes("premiere") || combined.includes("ppro")) {
    return APP_REGISTRY.premiere;
  }
  if (combined.includes("figma")) {
    return APP_REGISTRY.figma;
  }
  if (combined.includes("valorant")) {
    return APP_REGISTRY.valorant;
  }
  if (combined.includes("fortnite")) {
    return APP_REGISTRY.fortnite;
  }
  if (combined.includes("roblox")) {
    return APP_REGISTRY.roblox;
  }
  if (combined.includes("genshin")) {
    return APP_REGISTRY.genshin;
  }
  if (combined.includes("neverness") || combined.includes("nte")) {
    return APP_REGISTRY.nte;
  }
  if (combined.includes("giants") || combined.includes("march of")) {
    return APP_REGISTRY.giants;
  }
  if (combined.includes("hellraiser")) {
    return APP_REGISTRY.hellraiser;
  }
  if (combined.includes("helldivers")) {
    return APP_REGISTRY.helldivers2;
  }
  if (combined.includes("cyberpunk")) {
    return APP_REGISTRY.cyberpunk;
  }
  if (combined.includes("illustrator") || combined.includes("ilst")) {
    return APP_REGISTRY.illustrator;
  }

  // 2. Direct match by official application ID if present
  if (givenAppId) {
    for (const app of Object.values(APP_REGISTRY)) {
      if (app.id === givenAppId) {
        return app;
      }
    }
  }

  // 3. Fallback to custom
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
    let targetChan = remote.requested_channel_id || localChannelId || DEFAULT_JTC_LOBBY;
    desiredDeaf = remote.self_deaf !== undefined ? Boolean(remote.self_deaf) : true;
    desiredMute = remote.self_mute !== undefined ? Boolean(remote.self_mute) : true;

    // If the dashboard requested a new channel, force join regardless of previous yield
    if (remote.requested_channel_id && remote.requested_channel_id !== lastTargetChan && shouldBeInVoice) {
      console.log(`[VoiceDaemon] 🎯 Dashboard requested new channel ${remote.requested_channel_id} (clearing any PC yield lock)`);
      isUserActiveOnOtherClient = false;
      localInVoice = false;
      targetChan = remote.requested_channel_id;
    }

    // If we are NOT in voice at all, user is not active in voice on PC either!
    if (!localInVoice && shouldBeInVoice) {
      isUserActiveOnOtherClient = false;
    }

    if (isUserActiveOnOtherClient) {
      // User is actively in voice on PC / mobile! DO NOT touch voice or send Opcode 4!
      return;
    } else if (shouldBeInVoice) {
      if (!localInVoice) {
        // Verify channel exists before joining (prevent joining deleted dynamic room)
        const exists = await verifyChannelExists(targetChan);
        if (!exists) {
          console.log(`[VoiceDaemon] ⚠️ Target channel ${targetChan} was deleted. Falling back to lobby: ${DEFAULT_JTC_LOBBY}`);
          targetChan = DEFAULT_JTC_LOBBY;
          localChannelId = targetChan;
          lastTargetChan = targetChan;
        }

        console.log(`[VoiceDaemon] 🔊 Connecting to Voice Room: ${targetChan} (guild: ${localGuildId}) [mute=${desiredMute}, deaf=${desiredDeaf}]`);
        lastJoinInitiatedMs = Date.now();
        lastOpcode4SentMs = Date.now();
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
      } else {
        // Already active in voice on daemon session
        const activeChan = localActiveChannelId || localChannelId;
        const needsUpdate = (
          desiredMute !== lastMute ||
          desiredDeaf !== lastDeaf
        );
        if (needsUpdate && (Date.now() - lastOpcode4SentMs) > 6000) {
          console.log(`[VoiceDaemon] 🎙️ Enforcing Voice State in ${activeChan}: Mute=${desiredMute}, Deaf=${desiredDeaf}`);
          lastOpcode4SentMs = Date.now();
          ws.send(JSON.stringify({
            op: 4,
            d: {
              guild_id: String(localGuildId),
              channel_id: String(activeChan),
              self_mute: desiredMute,
              self_deaf: desiredDeaf
            }
          }));
          lastMute = desiredMute;
          lastDeaf = desiredDeaf;
        }
      }
    } else {
      if (localInVoice) {
        console.log("[VoiceDaemon] ⚪ Cloud requested Leave Voice Room");
        lastOpcode4SentMs = Date.now();
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
        lastMute = null;
        lastDeaf = null;
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

async function reportTelemetryToCloud(activeChan, inVoice, chanName = "") {
  try {
    const payload = {
      active_channel_id: activeChan,
      in_voice: inVoice
    };
    if (chanName) {
      payload.channel_name = chanName;
    }
    await fetch(`${WORKER_URL}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify(payload)
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
        lastHeartbeatAck = true;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          if (!lastHeartbeatAck) {
            console.log("[VoiceDaemon] ⚠️ Heartbeat ACK missed! Connection is zombie/stuck. Forcing reconnect...");
            try { ws.close(4000, "Heartbeat ACK timeout"); } catch (e) {}
            return;
          }
          lastHeartbeatAck = false;
          try { ws.send(JSON.stringify({ op: 1, d: sequence })); } catch (e) {}
        }, interval);

        ws.send(JSON.stringify({
          op: 2,
          d: {
            token: TOKEN,
            properties: { os: "Windows", browser: "Chrome", device: "" }
          }
        }));
      } else if (data.op === 11) {
        lastHeartbeatAck = true;
      } else if (data.op === 0 && data.t === "READY") {
        myUserId = String(data.d?.user?.id || "");
        mySessionId = String(data.d?.session_id || "");
        isConnected = true;
        console.log(`[VoiceDaemon] 🎉 Logged in as ${data.d?.user?.username} (${myUserId}) [session: ${mySessionId}]`);

        // Cache channels from all guilds
        cacheGuildChannels(data.d?.guilds);

        // Check if user account is ALREADY connected to voice in ANY guild
        if (Array.isArray(data.d?.guilds)) {
          for (const g of data.d.guilds) {
            if (Array.isArray(g.voice_states)) {
              const myState = g.voice_states.find(vs => String(vs.user_id) === String(myUserId));
              if (myState && myState.channel_id) {
                localActiveChannelId = String(myState.channel_id);
                localInVoice = true;
                localGuildId = String(g.id);
                lastTargetChan = localActiveChannelId;
                currentVoiceMute = Boolean(myState.self_mute);
                currentVoiceDeaf = Boolean(myState.self_deaf);
                const stateSession = String(myState.session_id || "");
                const cName = await resolveChannelName(localActiveChannelId);

                isUserActiveOnOtherClient = false;
                const cName = await resolveChannelName(localActiveChannelId);
                console.log(`[VoiceDaemon] 🛡️ Resumed active voice session in room "${cName}" (${localActiveChannelId}) [session: ${stateSession}].`);
                reportTelemetryToCloud(localActiveChannelId, true, cName);
                break;
              }
            }
          }
        }

        // Start 2.5s Cloud Dashboard Sync Loop
        if (syncTimer) clearInterval(syncTimer);
        syncTimer = setInterval(syncWithCloudWorker, 2500);

        // Immediate first sync with Cloudflare worker
        setTimeout(syncWithCloudWorker, 300);
      } else if (data.op === 0 && (data.t === "CHANNEL_CREATE" || data.t === "CHANNEL_UPDATE")) {
        if (data.d?.id && data.d?.name) {
          channelNamesCache.set(String(data.d.id), String(data.d.name));
        }
      } else if (data.op === 0 && data.t === "GUILD_CREATE") {
        cacheGuildChannels([data.d]);
      } else if (data.op === 0 && data.t === "VOICE_STATE_UPDATE") {
        if (String(data.d?.user_id) === myUserId) {
          const eventSessionId = String(data.d?.session_id || "");
          const timeSinceDaemonJoin = Date.now() - lastJoinInitiatedMs;
          const justJoinedByDaemon = timeSinceDaemonJoin < 10000;

          if (data.d?.channel_id) {
            localActiveChannelId = String(data.d.channel_id);
            localInVoice = true;
            localChannelId = localActiveChannelId;
            currentVoiceMute = Boolean(data.d.self_mute);
            currentVoiceDeaf = Boolean(data.d.self_deaf);
            const cName = await resolveChannelName(localActiveChannelId);

            if (justJoinedByDaemon) {
              // This is the daemon's own join or the server's JTC bot moving us into our room!
              isUserActiveOnOtherClient = false;
              if (resumeAfkTimer) {
                clearTimeout(resumeAfkTimer);
                resumeAfkTimer = null;
              }
              console.log(`[VoiceDaemon] ✅ Daemon Active in Voice Room: "${cName}" (${localActiveChannelId}) [mute=${currentVoiceMute}, deaf=${currentVoiceDeaf}]`);
              reportTelemetryToCloud(localActiveChannelId, true, cName);
              return;
            }

            const isOtherClient = Boolean(mySessionId && eventSessionId && eventSessionId !== mySessionId);
            if (isOtherClient) {
              // The user actively joined or moved voice from PC / Mobile! DO NOT SEND OPCODE 4! DO NOT DISCONNECT THEM!
              isUserActiveOnOtherClient = true;
              if (resumeAfkTimer) {
                clearTimeout(resumeAfkTimer);
                resumeAfkTimer = null;
              }
              console.log(`[VoiceDaemon] 👤 User active in voice on PC/Mobile (room: "${cName}" - ${localActiveChannelId}, session: ${eventSessionId}). Yielding voice control.`);
              reportTelemetryToCloud(localActiveChannelId, true, cName);
              return;
            }

            if (isUserActiveOnOtherClient) {
              // Routine event while user is on PC - keep yielding!
              reportTelemetryToCloud(localActiveChannelId, true, cName);
              return;
            }

            // Normal voice state update on our session
            console.log(`[VoiceDaemon] ✅ Voice State in Room: "${cName}" (${localActiveChannelId}) [mute=${currentVoiceMute}, deaf=${currentVoiceDeaf}]`);
            reportTelemetryToCloud(localActiveChannelId, true, cName);
          } else {
            console.log(`[VoiceDaemon] ⚠️ Disconnected from voice channel (session: ${eventSessionId}, wasOnOtherDevice: ${isUserActiveOnOtherClient})`);
            localActiveChannelId = null;
            localInVoice = false;
            currentVoiceMute = null;
            currentVoiceDeaf = null;
            lastMute = null;
            lastDeaf = null;
            reportTelemetryToCloud(null, false, "");

            if (resumeAfkTimer) clearTimeout(resumeAfkTimer);
            resumeAfkTimer = setTimeout(async () => {
              isUserActiveOnOtherClient = false;
              resumeAfkTimer = null;
              console.log(`[VoiceDaemon] 🔄 Auto-resuming 24/7 AFK mode...`);

              let target = localChannelId || DEFAULT_JTC_LOBBY;
              const exists = await verifyChannelExists(target);
              if (!exists) {
                console.log(`[VoiceDaemon] ⚠️ Previous channel ${target} was deleted. Falling back to lobby: ${DEFAULT_JTC_LOBBY}`);
                target = DEFAULT_JTC_LOBBY;
                localChannelId = target;
              }

              if (isConnected && ws && ws.readyState === 1) {
                lastJoinInitiatedMs = Date.now();
                lastOpcode4SentMs = Date.now();
                ws.send(JSON.stringify({
                  op: 4,
                  d: {
                    guild_id: String(localGuildId),
                    channel_id: String(target),
                    self_mute: desiredMute,
                    self_deaf: desiredDeaf
                  }
                }));
                lastTargetChan = target;
                lastMute = desiredMute;
                lastDeaf = desiredDeaf;
              }
            }, 4000);
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
    currentVoiceMute = null;
    currentVoiceDeaf = null;
    isUserActiveOnOtherClient = false;
    lastHeartbeatAck = true;
    if (resumeAfkTimer) {
      clearTimeout(resumeAfkTimer);
      resumeAfkTimer = null;
    }
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
