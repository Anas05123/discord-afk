import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cfgPath = path.resolve(__dirname, "..", "config.json");
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));

const TOKEN = (process.env.DISCORD_TOKEN || cfg.discord_token || "").trim();
const GUILD_ID = process.env.GUILD_ID || cfg.saved_guild_id || "1442511921898192917";
let requestedChannelId = process.env.CHANNEL_ID || cfg.saved_channel_id || "1484570674659070063";
if (requestedChannelId === "1557661172990480487" || requestedChannelId === "1559013974500966420") {
  requestedChannelId = "1484570674659070063";
}

let activeChannelId = null;
let myUserId = null;
let sequence = null;
let heartbeatTimer = null;

async function resolveValidChannel() {
  try {
    const r = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
      headers: { Authorization: TOKEN, "User-Agent": "Mozilla/5.0" }
    });
    if (!r.ok) return activeChannelId || requestedChannelId;
    const channels = await r.json();
    const vcs = channels.filter(c => c.type === 2 || c.type === 13);
    if (!vcs.length) return requestedChannelId;

    if (activeChannelId && vcs.some(c => String(c.id) === String(activeChannelId))) {
      return activeChannelId;
    }
    activeChannelId = null;

    if (vcs.some(c => String(c.id) === String(requestedChannelId))) {
      return requestedChannelId;
    }

    const jtc = vcs.find(c => (c.name || "").toUpperCase().includes("JOIN TO CREATE")) || vcs[0];
    requestedChannelId = String(jtc.id);
    return requestedChannelId;
  } catch (e) {
    return activeChannelId || requestedChannelId;
  }
}

function connectGateway() {
  console.log("[VoiceDaemon] Connecting to Discord Gateway...");
  const ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");

  ws.addEventListener("message", async (event) => {
    try {
      const data = JSON.parse(typeof event.data === "string" ? event.data : event.data.toString());
      if (data.s !== null && data.s !== undefined) sequence = data.s;

      if (data.op === 10) {
        const interval = data.d?.heartbeat_interval || 41250;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          try {
            ws.send(JSON.stringify({ op: 1, d: sequence }));
          } catch (e) {}
        }, interval);

        ws.send(
          JSON.stringify({
            op: 2,
            d: {
              token: TOKEN,
              capabilities: 30717,
              properties: { os: "Windows", browser: "Chrome", device: "", system_locale: "en-US" },
              presence: {
                status: "online",
                since: 0,
                activities: [
                  {
                    name: "Adobe Illustrator",
                    application_id: "751430009716998144",
                    type: 0,
                    details: "Designing Brand_Identity.ai",
                    state: "Vector Artboards & Pen Tool",
                    timestamps: { start: Date.now() }
                  }
                ],
                afk: true
              },
              compress: false,
              client_state: { guild_versions: {} }
            }
          })
        );
      } else if (data.op === 0 && data.t === "READY") {
        myUserId = String(data.d?.user?.id || "");
        console.log(`[VoiceDaemon] Logged in as ${data.d?.user?.username} (${myUserId})`);
        const targetChan = await resolveValidChannel();
        setTimeout(() => {
          try {
            ws.send(
              JSON.stringify({
                op: 4,
                d: {
                  guild_id: String(GUILD_ID),
                  channel_id: String(targetChan),
                  self_mute: true,
                  self_deaf: true
                }
              })
            );
            console.log(`[VoiceDaemon] Sent op:4 join request for channel ${targetChan}`);
          } catch (e) {}
        }, 600);
      } else if (data.op === 0 && data.t === "VOICE_STATE_UPDATE") {
        if (String(data.d?.user_id) === myUserId) {
          if (data.d?.channel_id) {
            activeChannelId = String(data.d.channel_id);
            console.log(`[VoiceDaemon] ✅ Active in Voice Room: ${activeChannelId}`);
          } else {
            // Re-join if disconnected/kicked
            console.log("[VoiceDaemon] Voice state became null, re-joining in 3s...");
            activeChannelId = null;
            setTimeout(async () => {
              const targetChan = await resolveValidChannel();
              try {
                ws.send(
                  JSON.stringify({
                    op: 4,
                    d: {
                      guild_id: String(GUILD_ID),
                      channel_id: String(targetChan),
                      self_mute: true,
                      self_deaf: true
                    }
                  })
                );
              } catch (e) {}
            }, 3000);
          }
        }
      } else if (data.op === 1) {
        ws.send(JSON.stringify({ op: 1, d: sequence }));
      } else if (data.op === 7 || data.op === 9) {
        try { ws.close(); } catch (e) {}
      }
    } catch (e) {}
  });

  ws.addEventListener("close", () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    console.log("[VoiceDaemon] Connection closed. Reconnecting in 4s...");
    setTimeout(connectGateway, 4000);
  });

  ws.addEventListener("error", () => {
    try { ws.close(); } catch (e) {}
  });
}

connectGateway();
