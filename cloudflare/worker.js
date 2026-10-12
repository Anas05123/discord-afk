/**
 * Cloudflare 24/7 Discord Voice AFK + Creative Studio Worker (Durable Object Edition)
 * Runs 100% in Cloudflare's Edge Cloud — keeps your Discord account inside your Voice Channel 24/7
 * with Adobe Photoshop, Adobe Illustrator, After Effects, Premiere Pro, Figma, or VS Code Rich Presence,
 * plus an interactive Web Control Panel & Elapsed Timer Chooser!
 */

const PRESETS = {
  photoshop: {
    name: "Adobe Photoshop",
    application_id: "748586506888806460",
    type: 0,
    details: "Editing Creative_Artwork.psd",
    state: "Workspace: Retouching & Layer Compositing",
    status: "online"
  },
  illustrator: {
    name: "Adobe Illustrator",
    application_id: "751430009716998144",
    type: 0,
    details: "Designing Brand_Identity.ai",
    state: "Vector Artboards & Pen Tool",
    status: "online"
  },
  aftereffects: {
    name: "Adobe After Effects",
    application_id: "748568089939148832",
    type: 0,
    details: "Compositing Motion_VFX.aep",
    state: "Timeline: 3D Camera & Keyframes",
    status: "online"
  },
  premiere: {
    name: "Adobe Premiere Pro",
    application_id: "748580494324662353",
    type: 0,
    details: "Editing Master_Timeline.prproj",
    state: "Color Grading & Audio Mastering",
    status: "online"
  },
  figma: {
    name: "Figma",
    application_id: "751430009716998144",
    type: 0,
    details: "Designing UI_Design_System.fig",
    state: "Auto-Layout & Interactive Prototype",
    status: "online"
  },
  vscode: {
    name: "Visual Studio Code",
    application_id: "810516608442695700",
    type: 0,
    details: "Editing SyntaFlow",
    state: "Working Editing SyntaFlow Integrations",
    status: "online"
  }
};

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Discord Studio Pro — 24/7 Cloudflare Cloud Control Panel</title>
<style>
  :root {
    --bg: #0f1013; --surface: #181a1f; --input: #20232a;
    --border: #2a2d36; --blurple: #5865f2; --green: #23a55a;
    --text: #f2f3f5; --muted: #949ba4;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
  body { background: var(--bg); color: var(--text); min-height: 100vh; padding: 28px 16px; display: flex; justify-content: center; }
  .container { width: 100%; max-width: 720px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 22px; margin-bottom: 18px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; }
  .badge { background: rgba(35, 165, 90, 0.16); color: var(--green); border: 1px solid var(--green); padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  h1 { font-size: 20px; font-weight: 700; }
  h2 { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; }
  .presets { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 10px; }
  button.preset-btn {
    background: var(--input); color: var(--text); border: 1px solid var(--border);
    padding: 12px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;
    text-align: left; transition: all 0.15s ease;
  }
  button.preset-btn:hover { border-color: var(--blurple); background: rgba(88, 101, 242, 0.15); }
  .field { margin-bottom: 12px; }
  label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 4px; font-weight: 600; }
  input {
    width: 100%; background: var(--input); border: 1px solid var(--border); color: var(--text);
    padding: 10px 12px; border-radius: 8px; font-size: 13px;
  }
  button.apply-btn {
    width: 100%; background: var(--blurple); color: #fff; border: none; padding: 12px;
    border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 6px;
  }
  button.apply-btn:hover { background: #4752c4; }
  .status-line { font-size: 13px; color: var(--muted); margin-top: 6px; line-height: 1.5; }
  .toast { margin-top: 10px; font-size: 13px; color: var(--green); font-weight: 600; min-height: 20px; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="header">
      <div>
        <h1>☁️ Discord Studio Pro — 24/7 Cloudflare Edge Host</h1>
        <div class="status-line" id="telemetry">Connecting to Cloudflare Durable Object...</div>
      </div>
      <span class="badge" id="statusBadge">● 24/7 CLOUD ACTIVE</span>
    </div>
  </div>

  <div class="card">
    <h2>⚡ 1-Click Creative & Coding Activity Presets</h2>
    <div class="presets">
      <button class="preset-btn" onclick="setPreset('photoshop')">🎨 Adobe Photoshop</button>
      <button class="preset-btn" onclick="setPreset('illustrator')">✒️ Adobe Illustrator</button>
      <button class="preset-btn" onclick="setPreset('aftereffects')">✨ After Effects</button>
      <button class="preset-btn" onclick="setPreset('premiere')">🎬 Premiere Pro</button>
      <button class="preset-btn" onclick="setPreset('figma')">📐 Figma UI/UX</button>
      <button class="preset-btn" onclick="setPreset('vscode')">💻 VS Code</button>
    </div>
    <div class="toast" id="presetToast"></div>
  </div>

  <div class="card">
    <h2>⏱️ Elapsed Timer Mode (Natural or Custom Time)</h2>
    <div class="presets" style="margin-bottom: 12px;">
      <button class="preset-btn" onclick="setTimerPreset(0, 0)">🔄 Natural (Starts 00:00)</button>
      <button class="preset-btn" onclick="setTimerPreset(0, 30)">⚡ 30m Elapsed</button>
      <button class="preset-btn" onclick="setTimerPreset(2, 0)">🔥 2h Elapsed</button>
      <button class="preset-btn" onclick="setTimerPreset(5, 0)">💻 5h Elapsed</button>
      <button class="preset-btn" onclick="setTimerPreset(12, 0)">🌙 12h Elapsed</button>
      <button class="preset-btn" onclick="setTimerPreset(24, 0)">👑 24h Elapsed</button>
    </div>
    <div style="display: flex; gap: 10px;">
      <div class="field" style="flex: 1;">
        <label>Custom Hours Elapsed</label>
        <input id="timerHours" type="number" min="0" value="0">
      </div>
      <div class="field" style="flex: 1;">
        <label>Custom Minutes Elapsed</label>
        <input id="timerMins" type="number" min="0" value="0">
      </div>
    </div>
  </div>

  <div class="card">
    <h2>⚙️ Custom Activity & Voice Room Override</h2>
    <div class="field">
      <label>Application / Activity Name</label>
      <input id="actName" placeholder="e.g. Adobe Illustrator, Adobe Photoshop, Visual Studio Code">
    </div>
    <div class="field">
      <label>Details (Line 1)</label>
      <input id="actDetails" placeholder="e.g. Designing Brand_Identity.ai">
    </div>
    <div class="field">
      <label>Workspace / State (Line 2)</label>
      <input id="actState" placeholder="e.g. Vector Artboards & Pen Tool">
    </div>
    <button class="apply-btn" onclick="applyCustom()">✨ Update 24/7 Cloud Activity & Timer</button>
  </div>
</div>

<script>
async function refreshStatus() {
  try {
    const r = await fetch('/health');
    const d = await r.json();
    const act = d.activity || {};
    document.getElementById('telemetry').textContent =
      \`Account: \${d.account || 'Connecting...'} • Room: \${d.channel_id || '-'} (Muted & Deafened) • Activity: \${act.name || 'None'} (\${act.details || ''})\`;
    if (!document.getElementById('actName').value && act.name) {
      document.getElementById('actName').value = act.name || '';
      document.getElementById('actDetails').value = act.details || '';
      document.getElementById('actState').value = act.state || '';
    }
  } catch (e) {}
}
async function setPreset(preset) {
  const hrs = parseFloat(document.getElementById('timerHours').value || '0');
  const mins = parseFloat(document.getElementById('timerMins').value || '0');
  const r = await fetch('/api/activity', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({preset, elapsed_hours: hrs, elapsed_minutes: mins})
  });
  const d = await r.json();
  if (d.activity) {
    document.getElementById('actName').value = d.activity.name || '';
    document.getElementById('actDetails').value = d.activity.details || '';
    document.getElementById('actState').value = d.activity.state || '';
    document.getElementById('presetToast').textContent = \`✅ Switched 24/7 Cloud Activity to \${d.activity.name}!\`;
    refreshStatus();
  }
}
async function setTimerPreset(hrs, mins) {
  document.getElementById('timerHours').value = hrs;
  document.getElementById('timerMins').value = mins;
  await fetch('/api/activity', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({elapsed_hours: hrs, elapsed_minutes: mins, reset_timer: (hrs === 0 && mins === 0)})
  });
  document.getElementById('presetToast').textContent =
    (hrs === 0 && mins === 0) ? '⏱️ Timer reset to Natural (00:00)!' : \`⏱️ Timer set to \${hrs}h \${mins}m elapsed!\`;
  refreshStatus();
}
async function applyCustom() {
  const payload = {
    name: document.getElementById('actName').value,
    details: document.getElementById('actDetails').value,
    state: document.getElementById('actState').value,
    elapsed_hours: parseFloat(document.getElementById('timerHours').value || '0'),
    elapsed_minutes: parseFloat(document.getElementById('timerMins').value || '0')
  };
  const r = await fetch('/api/activity', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  const d = await r.json();
  document.getElementById('presetToast').textContent = \`✅ Updated custom activity: \${d.activity?.name || ''}\`;
  refreshStatus();
}
refreshStatus();
setInterval(refreshStatus, 5000);
</script>
</body>
</html>`;

export class DiscordAFKSession {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.ws = null;
    this.sequence = null;
    this.username = "Connecting...";
    this.connected = false;
    this.lastHeartbeat = 0;
    this.activity = { ...PRESETS.illustrator };
    this.startTimestampMs = Date.now();
  }

  async initState() {
    const savedAct = await this.ctx.storage.get("activity");
    const savedStart = await this.ctx.storage.get("startTimestampMs");
    if (savedAct) this.activity = savedAct;
    if (savedStart) this.startTimestampMs = savedStart;
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
      if (act.application_id) entry.application_id = String(act.application_id);
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

  async ensureConnected() {
    await this.initState();
    const token = this.env.DISCORD_TOKEN;
    const guildId = this.env.GUILD_ID;
    const channelId = this.env.CHANNEL_ID;
    if (!token || !guildId || !channelId) {
      return { error: "Missing DISCORD_TOKEN, GUILD_ID, or CHANNEL_ID in Worker secrets" };
    }

    if (this.ws && this.connected) {
      try {
        this.ws.send(JSON.stringify({ op: 1, d: this.sequence }));
        this.lastHeartbeat = Date.now();
        await this.ctx.storage.setAlarm(Date.now() + 25000);
        return { status: "already_connected", account: this.username };
      } catch (e) {
        this.connected = false;
        this.ws = null;
      }
    }

    try {
      const resp = await fetch("https://gateway.discord.gg/?v=10&encoding=json", {
        headers: { Upgrade: "websocket" }
      });
      const ws = resp.webSocket;
      if (!ws) {
        return { error: "Failed to upgrade Discord Gateway WebSocket" };
      }
      ws.accept();
      this.ws = ws;
      this.connected = true;

      ws.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.s !== null && data.s !== undefined) {
            this.sequence = data.s;
          }
          if (data.op === 10) {
            // Identify
            ws.send(JSON.stringify({
              op: 2,
              d: {
                token: token.trim(),
                capabilities: 30717,
                properties: {
                  os: "Windows",
                  browser: "Chrome",
                  device: "",
                  system_locale: "en-US"
                },
                presence: this.buildPresencePayload(),
                compress: false,
                client_state: { guild_versions: {} }
              }
            }));
          } else if (data.op === 0 && data.t === "READY") {
            this.username = data.d?.user?.username || "Connected";
            // Join Voice Channel (op 4)
            ws.send(JSON.stringify({
              op: 4,
              d: {
                guild_id: String(guildId).trim(),
                channel_id: String(channelId).trim(),
                self_mute: true,
                self_deaf: true
              }
            }));
          } else if (data.op === 1) {
            ws.send(JSON.stringify({ op: 1, d: this.sequence }));
          } else if (data.op === 7 || data.op === 9) {
            this.connected = false;
            try { ws.close(); } catch (e) {}
          }
        } catch (err) {}
      });

      ws.addEventListener("close", () => {
        this.connected = false;
        this.ws = null;
      });

      ws.addEventListener("error", () => {
        this.connected = false;
        this.ws = null;
      });

      await this.ctx.storage.setAlarm(Date.now() + 25000);
      return { status: "connecting", account: this.username };
    } catch (err) {
      this.connected = false;
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
    await this.ensureConnected();

    if (request.method === "POST" && url.pathname.startsWith("/api/activity")) {
      const body = await request.json().catch(() => ({}));
      if (body.preset && PRESETS[body.preset]) {
        this.activity = { ...PRESETS[body.preset] };
      }
      for (const k of ["name", "details", "state", "status", "application_id"]) {
        if (body[k] !== undefined && body[k] !== "") {
          this.activity[k] = body[k];
        }
      }
      if (body.reset_timer) {
        this.startTimestampMs = Date.now();
      } else if (body.elapsed_hours !== undefined || body.elapsed_minutes !== undefined) {
        const hrs = Number(body.elapsed_hours || 0);
        const mins = Number(body.elapsed_minutes || 0);
        const offsetMs = Math.max(0, (hrs * 3600 + mins * 60) * 1000);
        this.startTimestampMs = Date.now() - offsetMs;
      }
      await this.ctx.storage.put("activity", this.activity);
      await this.ctx.storage.put("startTimestampMs", this.startTimestampMs);

      if (this.ws && this.connected) {
        try {
          this.ws.send(JSON.stringify({
            op: 3,
            d: this.buildPresencePayload()
          }));
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
      service: "Cloudflare 24/7 Discord Voice AFK Durable Object",
      account: this.username,
      guild_id: this.env.GUILD_ID,
      channel_id: this.env.CHANNEL_ID,
      activity: this.activity
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
  },
  async scheduled(event, env, ctx) {
    const id = env.DISCORD_AFK_SESSION.idFromName("global-24-7-afk");
    const stub = env.DISCORD_AFK_SESSION.get(id);
    ctx.waitUntil(stub.fetch("https://internal/health"));
  }
};
