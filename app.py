import os
import json
import time
import asyncio
import threading
import logging
import urllib.request
import gradio as gr
import websockets

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("DiscordGradio")

TOKEN = os.environ.get("DISCORD_TOKEN", "").strip()
if not TOKEN:
    # Try reading local config if available
    try:
        with open("config.json", "r", encoding="utf-8") as f:
            cfg = json.load(f)
            TOKEN = cfg.get("discord_token", "").strip()
    except Exception:
        pass

WORKER_URL = os.environ.get("WORKER_URL", "https://discord-afk-keepalive.anas05123.workers.dev").rstrip("/")
DEFAULT_GUILD = os.environ.get("GUILD_ID", "1442511921898192917")
DEFAULT_CHANNEL = os.environ.get("CHANNEL_ID", "1484570674659070063")

# Shared state for Gradio UI
app_state = {
    "connected": False,
    "username": "Connecting...",
    "user_id": "",
    "active_channel": None,
    "in_voice": False,
    "activity_name": "None",
    "logs": []
}

def add_log(msg: str):
    logger.info(msg)
    ts = time.strftime("%H:%M:%S")
    app_state["logs"].append(f"[{ts}] {msg}")
    if len(app_state["logs"]) > 100:
        app_state["logs"].pop(0)

def build_presence(act: dict, start_ms: int = 0):
    activities = []
    if act and act.get("name"):
        entry = {
            "name": act["name"],
            "type": int(act.get("type", 0)),
            "timestamps": {"start": start_ms or int(time.time() * 1000)}
        }
        if act.get("details"):
            entry["details"] = act["details"]
        if act.get("state"):
            entry["state"] = act["state"]
        cid = act.get("client_id") or act.get("application_id")
        if cid:
            entry["application_id"] = str(cid)
        activities.append(entry)
    return {
        "status": act.get("status", "online") if act else "online",
        "since": 0,
        "activities": activities,
        "afk": True
    }

async def gateway_worker():
    global TOKEN
    while True:
        if not TOKEN:
            add_log("⚠️ Waiting for DISCORD_TOKEN... Please add DISCORD_TOKEN in Space Secrets or UI.")
            await asyncio.sleep(5)
            TOKEN = os.environ.get("DISCORD_TOKEN", "").strip()
            continue

        add_log("🚀 Connecting to Discord Gateway...")
        try:
            async with websockets.connect("wss://gateway.discord.gg/?v=10&encoding=json") as ws:
                heartbeat_task = None
                sync_task = None
                my_user_id = None
                seq = None
                local_guild = DEFAULT_GUILD
                local_channel = DEFAULT_CHANNEL
                local_active_channel = None
                local_in_voice = False
                last_voice_key = ""
                last_act_key = ""

                async def heartbeat_loop(interval_ms):
                    nonlocal seq
                    interval_sec = interval_ms / 1000.0
                    try:
                        while True:
                            await asyncio.sleep(interval_sec)
                            await ws.send(json.dumps({"op": 1, "d": seq}))
                    except Exception:
                        pass

                async def sync_loop():
                    nonlocal local_guild, local_channel, local_active_channel, local_in_voice, last_voice_key, last_act_key
                    while True:
                        await asyncio.sleep(2.5)
                        try:
                            req = urllib.request.Request(f"{WORKER_URL}/health", headers={"User-Agent": "Mozilla/5.0"})
                            with urllib.request.urlopen(req, timeout=3) as resp:
                                if resp.status == 200:
                                    remote = json.loads(resp.read().decode("utf-8"))

                                    if remote.get("guild_id"):
                                        local_guild = remote["guild_id"]

                                    should_voice = remote.get("in_voice") is not False
                                    target_chan = remote.get("channel_id") or DEFAULT_CHANNEL
                                    self_deaf = bool(remote.get("self_deaf", False))
                                    self_mute = bool(remote.get("self_mute", True))
                                    v_key = f"{should_voice}_{local_guild}_{target_chan}_{self_mute}_{self_deaf}"

                                    if should_voice:
                                        if not local_in_voice or v_key != last_voice_key:
                                            add_log(f"🔊 Cloud requested Join Room: {target_chan}")
                                            await ws.send(json.dumps({
                                                "op": 4,
                                                "d": {
                                                    "guild_id": str(local_guild),
                                                    "channel_id": str(target_chan),
                                                    "self_mute": self_mute,
                                                    "self_deaf": self_deaf
                                                }
                                            }))
                                            local_channel = target_chan
                                            last_voice_key = v_key
                                    else:
                                        if local_in_voice:
                                            add_log("⚪ Cloud requested Leave Voice Room")
                                            await ws.send(json.dumps({
                                                "op": 4,
                                                "d": {
                                                    "guild_id": str(local_guild),
                                                    "channel_id": None,
                                                    "self_mute": True,
                                                    "self_deaf": True
                                                }
                                            }))
                                            local_in_voice = False
                                            local_active_channel = None
                                            last_voice_key = v_key

                                    act = remote.get("activity") or {}
                                    act_key = f"{act.get('name')}_{act.get('details')}_{act.get('state')}_{remote.get('startTimestampMs')}"
                                    if act_key != last_act_key:
                                        add_log(f"✨ Cloud requested Activity: {act.get('name')}")
                                        payload = build_presence(act, remote.get("startTimestampMs", 0))
                                        await ws.send(json.dumps({"op": 3, "d": payload}))
                                        last_act_key = act_key
                                        app_state["activity_name"] = act.get("name", "None")
                        except Exception:
                            pass

                async for msg in ws:
                    data = json.loads(msg)
                    op = data.get("op")
                    t = data.get("t")
                    d = data.get("d")
                    if data.get("s") is not None:
                        seq = data["s"]

                    if op == 10:
                        interval = d.get("heartbeat_interval", 41250)
                        if heartbeat_task:
                            heartbeat_task.cancel()
                        heartbeat_task = asyncio.create_task(heartbeat_loop(interval))

                        # Op 2 Identify
                        await ws.send(json.dumps({
                            "op": 2,
                            "d": {
                                "token": TOKEN,
                                "properties": {"os": "Windows", "browser": "Chrome", "device": ""}
                            }
                        }))

                    elif op == 0 and t == "READY":
                        my_user_id = str(d.get("user", {}).get("id", ""))
                        username = d.get("user", {}).get("username", "Unknown")
                        app_state["connected"] = True
                        app_state["username"] = username
                        app_state["user_id"] = my_user_id
                        add_log(f"🎉 Logged in as {username} ({my_user_id})")

                        if sync_task:
                            sync_task.cancel()
                        sync_task = asyncio.create_task(sync_loop())

                    elif op == 0 and t == "VOICE_STATE_UPDATE":
                        if str(d.get("user_id")) == my_user_id:
                            cid = d.get("channel_id")
                            if cid:
                                local_active_channel = str(cid)
                                local_in_voice = True
                                local_channel = local_active_channel
                                last_voice_key = f"{local_in_voice}_{local_guild}_{local_active_channel}_True_False"
                                app_state["in_voice"] = True
                                app_state["active_channel"] = local_active_channel
                                add_log(f"✅ Active in Voice Room: {local_active_channel}")
                            else:
                                add_log("⚪ Left Voice channel")
                                local_active_channel = None
                                local_in_voice = False
                                app_state["in_voice"] = False
                                app_state["active_channel"] = None

                    elif op == 1:
                        await ws.send(json.dumps({"op": 1, "d": seq}))

                    elif op in (7, 9):
                        add_log(f"Gateway reconnect requested (op {op}). Reconnecting...")
                        break

        except Exception as e:
            add_log(f"Gateway error: {e}. Reconnecting in 5s...")
            app_state["connected"] = False
        await asyncio.sleep(5)

def run_async_loop():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(gateway_worker())

# Start background Discord connection thread
threading.Thread(target=run_async_loop, daemon=True).start()

# Build Gradio UI
def get_status():
    status_icon = "🟢 Online" if app_state["connected"] else "🔴 Disconnected"
    voice_status = f"🔊 In Voice ({app_state['active_channel']})" if app_state["in_voice"] else "⚪ Not in Voice"
    log_text = "\n".join(app_state["logs"][-20:])
    return status_icon, app_state["username"], voice_status, app_state["activity_name"], log_text

with gr.Blocks(title="Discord Studio PRO 24/7", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🎙️ Discord Studio PRO — 24/7 Cloud Engine")
    gr.Markdown(f"Running 24/7 on Hugging Face Spaces! Control from your phone anytime at: **[{WORKER_URL}/dashboard]({WORKER_URL}/dashboard)**")

    with gr.Row():
        status_box = gr.Textbox(label="Status", value="Connecting...", interactive=False)
        account_box = gr.Textbox(label="Account", value="Loading...", interactive=False)
        voice_box = gr.Textbox(label="Voice Room", value="Checking...", interactive=False)
        activity_box = gr.Textbox(label="Activity", value="None", interactive=False)

    log_box = gr.Textbox(label="Live Cloud Logs", lines=12, interactive=False)
    refresh_btn = gr.Button("🔄 Refresh Status")

    refresh_btn.click(
        fn=get_status,
        outputs=[status_box, account_box, voice_box, activity_box, log_box]
    )

    demo.load(
        fn=get_status,
        outputs=[status_box, account_box, voice_box, activity_box, log_box]
    )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
