import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Keep Node event loop permanently active in background
const processKeepAlive = setInterval(() => {}, 1000 * 60 * 60);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cfgPath = path.resolve(__dirname, "..", "config.json");

let cfg = {};
try {
  cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
} catch (e) {}

const TOKEN = (process.env.DISCORD_TOKEN || cfg.discord_token || "").trim();
const WORKER_URL = "https://discord-afk-keepalive.anas05123.workers.dev";

if (!TOKEN) {
  console.error("[VoiceDaemon] ❌ Error: No DISCORD_TOKEN found in config.json or environment!");
  process.exit(1);
}

// Gateway state
let ws = null;
let myUserId = null;
let myUsername = "la2nis";
let sessionId = null;
let sequence = null;
let resumeGatewayUrl = null;
let heartbeatTimer = null;
let lastHeartbeatSent = 0;
let lastHeartbeatAck = 0;
let isConnected = false;
let isReconnecting = false;

// Voice AFK state
let activeVoiceChannel = null;
let currentGuildId = "1442511921898192917";
let wantedInVoice = true;
let targetChannelId = "1484570674659070063";
let rejoinTimer = null;
let rejoinAttempts = 0;

// Cloud Sync state
let syncTimer = null;
let lastProcessedVoiceReq = null;
let lastActivityKey = "";

function sendGateway(payload) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(payload));
  }
}

function joinVoice(guildId, channelId) {
  if (!guildId || !channelId) return;
  console.log(`[VoiceDaemon] 🔊 Requesting Voice Channel: ${channelId} (guild: ${guildId})`);
  currentGuildId = String(guildId);
  targetChannelId = String(channelId);
  wantedInVoice = true;

  // Use self_deaf: false and self_mute: true so server AFK idle detection doesn't auto-kick
  sendGateway({
    op: 4,
    d: {
      guild_id: currentGuildId,
      channel_id: targetChannelId,
      self_mute: true,
      self_deaf: false
    }
  });
}

function leaveVoice() {
  console.log("[VoiceDaemon] ⚪ User requested Leave Voice Room.");
  wantedInVoice = false;
  activeVoiceChannel = null;
  if (rejoinTimer) {
    clearTimeout(rejoinTimer);
    rejoinTimer = null;
  }

  sendGateway({
    op: 4,
    d: {
      guild_id: currentGuildId,
      channel_id: null,
      self_mute: true,
      self_deaf: false
    }
  });

  reportTelemetry(null, false);
}

function buildPresence(act, startMs) {
  const activities = [];
  if (act && act.name) {
    const entry = {
      name: act.name,
      type: Number(act.type || 0),
      timestamps: { start: startMs || Date.now() }
    };
    if (act.details) entry.details = act.details;
    if (act.state) entry.state = act.state;
    if (act.client_id || act.application_id) {
      entry.application_id = String(act.client_id || act.application_id);
    }
    if (act.large_image || act.small_image) {
      entry.assets = {};
      if (act.large_image) entry.assets.large_image = act.large_image;
      if (act.large_text) entry.assets.large_text = act.large_text;
      if (act.small_image) entry.assets.small_image = act.small_image;
      if (act.small_text) entry.assets.small_text = act.small_text;
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

async function reportTelemetry(activeChan, inVoice) {
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

async function syncWithCloudWorker() {
  if (!isConnected || !ws || ws.readyState !== 1) return;
  try {
    const r = await fetch(`${WORKER_URL}/health`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!r.ok) return;
    const remote = await r.json();

    const remoteVoiceReq = remote.voice_requested_at || 0;

    // 1. Check if user explicitly clicked Join or Leave on the Web Dashboard
    if (lastProcessedVoiceReq === null) {
      // First boot sync: adopt cloud desire
      lastProcessedVoiceReq = remoteVoiceReq;
      if (remote.in_voice) {
        wantedInVoice = true;
        currentGuildId = remote.guild_id || currentGuildId;
        targetChannelId = remote.active_channel_id || remote.channel_id || targetChannelId;
        if (!activeVoiceChannel) {
          joinVoice(currentGuildId, targetChannelId);
        }
      } else {
        wantedInVoice = false;
      }
    } else if (remoteVoiceReq !== lastProcessedVoiceReq) {
      // User clicked a button in the Web Dashboard!
      lastProcessedVoiceReq = remoteVoiceReq;
      if (remote.in_voice === false) {
        leaveVoice();
      } else {
        currentGuildId = remote.guild_id || currentGuildId;
        const requested = remote.requested_channel_id || remote.channel_id;
        joinVoice(currentGuildId, requested);
      }
    }

    // 2. Presence Activity Sync
    const act = remote.activity || {};
    const actKey = `${act.name || ""}_${act.details || ""}_${act.state || ""}_${act.client_id || ""}_${remote.startTimestampMs || 0}`;
    if (actKey !== lastActivityKey) {
      console.log(`[VoiceDaemon] ✨ Cloud Activity synced: "${act.name || 'Cleared'}" - "${act.details || ''}"`);
      const presencePayload = buildPresence(act, remote.startTimestampMs);
      sendGateway({
        op: 3,
        d: presencePayload
      });
      lastActivityKey = actKey;
    }
  } catch (err) {}
}

function scheduleRejoin() {
  if (rejoinTimer) return;
  rejoinAttempts++;
  const delaySec = Math.min(5 * rejoinAttempts, 30);
  console.log(`[VoiceDaemon] 🔄 Rejoining voice in ${delaySec}s (attempt ${rejoinAttempts})...`);
  rejoinTimer = setTimeout(() => {
    rejoinTimer = null;
    if (wantedInVoice && !activeVoiceChannel && isConnected) {
      joinVoice(currentGuildId, targetChannelId);
    }
  }, delaySec * 1000);
}

function connectGateway() {
  if (isReconnecting) return;
  console.log("[VoiceDaemon] Connecting to Discord Gateway...");

  const gwUrl = resumeGatewayUrl || "wss://gateway.discord.gg/?v=10&encoding=json";
  ws = new WebSocket(gwUrl);

  ws.addEventListener("open", () => {
    console.log("[VoiceDaemon] Gateway socket connected.");
  });

  ws.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(typeof event.data === "string" ? event.data : event.data.toString());
      if (data.s !== null && data.s !== undefined) sequence = data.s;

      // Opcode 10: HELLO
      if (data.op === 10) {
        const interval = data.d?.heartbeat_interval || 41250;
        if (heartbeatTimer) clearInterval(heartbeatTimer);

        // Heartbeat with initial jitter
        const jitter = Math.floor(Math.random() * interval * 0.5);
        setTimeout(() => {
          sendGateway({ op: 1, d: sequence });
          lastHeartbeatSent = Date.now();
        }, jitter);

        heartbeatTimer = setInterval(() => {
          sendGateway({ op: 1, d: sequence });
          lastHeartbeatSent = Date.now();
        }, interval);

        // Attempt RESUME if we have session info, otherwise IDENTIFY
        if (sessionId && sequence !== null) {
          console.log(`[VoiceDaemon] 🔄 Resuming session: ${sessionId} (seq: ${sequence})...`);
          sendGateway({
            op: 6,
            d: {
              token: TOKEN,
              session_id: sessionId,
              seq: sequence
            }
          });
        } else {
          sendGateway({
            op: 2,
            d: {
              token: TOKEN,
              properties: { os: "Windows", browser: "Chrome", device: "" }
            }
          });
        }
      }

      // Opcode 11: Heartbeat ACK
      else if (data.op === 11) {
        lastHeartbeatAck = Date.now();
      }

      // Opcode 1: Heartbeat requested by server
      else if (data.op === 1) {
        sendGateway({ op: 1, d: sequence });
      }

      // Opcode 7: Gateway requested Reconnect
      else if (data.op === 7) {
        console.log("[VoiceDaemon] Gateway requested Reconnect (Op 7).");
        try { ws.close(); } catch (e) {}
      }

      // Opcode 9: Invalid Session
      else if (data.op === 9) {
        console.log("[VoiceDaemon] Invalid session (Op 9). Starting fresh session...");
        sessionId = null;
        sequence = null;
        try { ws.close(); } catch (e) {}
      }

      // Opcode 0: DISPATCH
      else if (data.op === 0) {
        if (data.t === "READY") {
          myUserId = String(data.d?.user?.id || "");
          myUsername = data.d?.user?.username || myUsername;
          sessionId = data.d?.session_id;
          resumeGatewayUrl = data.d?.resume_gateway_url;
          isConnected = true;
          rejoinAttempts = 0;
          console.log(`[VoiceDaemon] 🎉 Logged in as ${myUsername} (${myUserId})`);

          if (syncTimer) clearInterval(syncTimer);
          syncTimer = setInterval(syncWithCloudWorker, 2500);
          setTimeout(syncWithCloudWorker, 500);

          // If user desires to be in voice and not currently in voice, join
          if (wantedInVoice && !activeVoiceChannel) {
            setTimeout(() => {
              if (wantedInVoice && !activeVoiceChannel) {
                joinVoice(currentGuildId, targetChannelId);
              }
            }, 1000);
          }
        }

        else if (data.t === "RESUMED") {
          isConnected = true;
          console.log("[VoiceDaemon] ⚡ Session successfully RESUMED! Voice and presence intact.");
        }

        else if (data.t === "VOICE_STATE_UPDATE") {
          if (String(data.d?.user_id) === myUserId) {
            if (data.d?.session_id) {
              sessionId = data.d.session_id;
            }
            const chId = data.d?.channel_id;
            if (chId) {
              const prev = activeVoiceChannel;
              activeVoiceChannel = String(chId);
              targetChannelId = activeVoiceChannel;
              rejoinAttempts = 0;
              if (rejoinTimer) {
                clearTimeout(rejoinTimer);
                rejoinTimer = null;
              }

              if (prev && prev !== activeVoiceChannel) {
                console.log(`[VoiceDaemon] 👥 Moved to Voice Room: ${activeVoiceChannel}. Staying here!`);
              } else if (!prev) {
                console.log(`[VoiceDaemon] ✅ Active in Voice Room: ${activeVoiceChannel}`);
              }
              reportTelemetry(activeVoiceChannel, true);
            } else {
              // Disconnected / kicked
              if (activeVoiceChannel) {
                console.log(`[VoiceDaemon] ⚠️ Disconnected from Voice Room: ${activeVoiceChannel}`);
              }
              activeVoiceChannel = null;
              reportTelemetry(null, false);

              // Auto-rejoin if user desired to stay in voice
              if (wantedInVoice) {
                scheduleRejoin();
              }
            }
          }
        }
      }
    } catch (e) {}
  });

  ws.addEventListener("close", (e) => {
    isConnected = false;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (syncTimer) clearInterval(syncTimer);
    console.log(`[VoiceDaemon] Gateway closed (code: ${e.code}). Reconnecting in 4s...`);
    isReconnecting = true;
    setTimeout(() => {
      isReconnecting = false;
      connectGateway();
    }, 4000);
  });

  ws.addEventListener("error", (err) => {
    console.log("[VoiceDaemon] Gateway network error:", err.message || err);
  });
}

connectGateway();
