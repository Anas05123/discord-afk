import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cfgPath = path.resolve(__dirname, "..", "config.json");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));

const TOKEN = (process.env.DISCORD_TOKEN || cfg.discord_token || "").trim();
const WORKER_URL = "https://discord-afk-keepalive.anas05123.workers.dev";

let ws = null;
let myUserId = null;
let sequence = null;
let heartbeatTimer = null;
let syncTimer = null;
let isConnected = false;

let localGuildId = "1442511921898192917";
let localChannelId = "1484570674659070063";
let localActiveChannelId = null;
let localInVoice = false;
let lastActivityKey = "";
let lastVoiceKey = "";

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
    const targetChan = remote.channel_id || "1484570674659070063";
    const voiceKey = `${shouldBeInVoice}_${localGuildId}_${targetChan}`;

    if (shouldBeInVoice) {
      if (!localInVoice || voiceKey !== lastVoiceKey) {
        console.log(`[VoiceDaemon] 🔊 Cloud requested Join Room: ${targetChan} (guild: ${localGuildId})`);
        ws.send(JSON.stringify({
          op: 4,
          d: {
            guild_id: String(localGuildId),
            channel_id: String(targetChan),
            self_mute: true,
            self_deaf: true
          }
        }));
        localChannelId = targetChan;
        lastVoiceKey = voiceKey;
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
        lastVoiceKey = voiceKey;
      }
    }

    // 3. Sync Activity Presence
    const act = remote.activity || {};
    const actKey = `${act.name || ""}_${act.details || ""}_${act.state || ""}_${act.client_id || ""}_${remote.startTimestampMs || 0}`;
    if (actKey !== lastActivityKey) {
      console.log(`[VoiceDaemon] ✨ Cloud requested Activity: "${act.name || 'Cleared'}" - "${act.details || ''}"`);
      const presencePayload = buildPresence(act, remote.startTimestampMs);
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
  console.log("[VoiceDaemon] Connecting to Discord Gateway...");
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

        // Immediate first sync
        setTimeout(syncWithCloudWorker, 500);
      } else if (data.op === 0 && data.t === "VOICE_STATE_UPDATE") {
        if (String(data.d?.user_id) === myUserId) {
          if (data.d?.channel_id) {
            localActiveChannelId = String(data.d.channel_id);
            localInVoice = true;
            console.log(`[VoiceDaemon] ✅ Active in Voice Room: ${localActiveChannelId}`);
            reportTelemetryToCloud(localActiveChannelId, true);
          } else {
            console.log("[VoiceDaemon] Disconnected from Voice channel");
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
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (syncTimer) clearInterval(syncTimer);
    console.log(`[VoiceDaemon] Gateway closed (code: ${e.code}). Reconnecting in 4s...`);
    setTimeout(connectGateway, 4000);
  });

  ws.addEventListener("error", (err) => {
    console.log(`[VoiceDaemon] WebSocket error: ${err.message || err}`);
    try { ws.close(); } catch (e) {}
  });
}

connectGateway();
