import json
import time
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Any, Optional

START_TIME = time.time()
ACTIVE_WORKER: Optional[Any] = None

DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Discord Studio Pro — 24/7 Cloud Control Panel</title>
<style>
  :root {
    --bg: #0f1013;
    --surface: #181a1f;
    --input: #20232a;
    --border: #2a2d36;
    --blurple: #5865f2;
    --green: #23a55a;
    --text: #f2f3f5;
    --muted: #949ba4;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
  body { background: var(--bg); color: var(--text); min-height: 100vh; padding: 28px 16px; display: flex; justify-content: center; }
  .container { width: 100%; max-width: 720px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 22px; margin-bottom: 18px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .badge { background: rgba(35, 165, 90, 0.16); color: var(--green); border: 1px solid var(--green); padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  h1 { font-size: 20px; font-weight: 700; }
  h2 { font-size: 14px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; }
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
  .status-line { font-size: 13px; color: var(--muted); margin-top: 6px; }
  .toast { margin-top: 10px; font-size: 13px; color: var(--green); font-weight: 600; min-height: 20px; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="header">
      <div>
        <h1>Discord Studio Pro — 24/7 Cloud Worker</h1>
        <div class="status-line" id="telemetry">Loading live telemetry...</div>
      </div>
      <span class="badge">● 24/7 ONLINE</span>
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
    <h2>⚙️ Custom Activity Override</h2>
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
    <button class="apply-btn" onclick="applyCustom()">✨ Update 24/7 Discord Activity & Timer</button>
  </div>
</div>

<script>
async function refreshStatus() {
  try {
    const r = await fetch('/health');
    const d = await r.json();
    const act = d.activity || {};
    document.getElementById('telemetry').textContent =
      `Account: ${d.account || 'Connected'} • Activity: ${act.name || 'None'} (${act.details || ''}) • Uptime: ${d.uptime_seconds}s`;
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
    document.getElementById('presetToast').textContent = `✅ Switched 24/7 Activity to ${d.activity.name}!`;
    refreshStatus();
  }
}
async function setTimerPreset(hrs, mins) {
  document.getElementById('timerHours').value = hrs;
  document.getElementById('timerMins').value = mins;
  const r = await fetch('/api/activity', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({elapsed_hours: hrs, elapsed_minutes: mins, reset_timer: (hrs === 0 && mins === 0)})
  });
  await r.json();
  document.getElementById('presetToast').textContent =
    (hrs === 0 && mins === 0) ? '⏱️ Timer reset to Natural (00:00)!' : `⏱️ Timer set to ${hrs}h ${mins}m elapsed!`;
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
  document.getElementById('presetToast').textContent = `✅ Updated custom activity & timer: ${d.activity?.name || ''}`;
  refreshStatus();
}
refreshStatus();
setInterval(refreshStatus, 5000);
</script>
</body>
</html>
"""


class HealthHandler(BaseHTTPRequestHandler):
    def _build_status_dict(self):
        uptime_seconds = int(time.time() - START_TIME)
        act = ACTIVE_WORKER.activity_config if ACTIVE_WORKER else {}
        username = getattr(ACTIVE_WORKER, "username", "Connected") if ACTIVE_WORKER else "Offline"
        return {
            "status": "online",
            "service": "Discord 24/7 Voice AFK Worker",
            "account": username,
            "uptime_seconds": uptime_seconds,
            "activity": act,
            "message": "Worker is active and maintaining Discord voice connection."
        }

    def do_GET(self):
        accept = self.headers.get("Accept", "")
        if not self.path.startswith("/health") and ("text/html" in accept or self.path.startswith("/dashboard")):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(DASHBOARD_HTML.encode("utf-8"))
            return

        data = self._build_status_dict()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def do_POST(self):
        if self.path.startswith("/api/activity"):
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                body = json.loads(raw)
            except Exception:
                body = {}

            updated = {}
            if ACTIVE_WORKER and hasattr(ACTIVE_WORKER, "update_activity"):
                updated = ACTIVE_WORKER.update_activity(body)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True, "activity": updated}, indent=2).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        return


def start_keep_alive(port: int = 10000, worker: Optional[Any] = None):
    """Starts the lightweight HTTP server & Web Control Panel in a daemon thread."""
    global ACTIVE_WORKER
    ACTIVE_WORKER = worker
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, HealthHandler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    print(f"[KeepAlive] Web Control Panel & Health check listening on port {port}")
    return httpd
