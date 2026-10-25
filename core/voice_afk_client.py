import json
import time
import asyncio
import threading
import urllib.request
from typing import Optional, Callable, Dict, Any, List
import websockets

GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json"

class VoiceAFKClient:
    """
    In-App Discord Voice Room AFK Engine (Modern Anti-Glitch).
    Runs asynchronously in a background worker thread.
    Includes rate-limiting, JTC dynamic room stickiness, circuit breaker,
    and Emergency Killswitch with automatic glitch loop execution.
    """
    def __init__(
        self,
        on_status: Optional[Callable[[str, bool], None]] = None,
        on_ready: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_latency: Optional[Callable[[float], None]] = None,
        on_log: Optional[Callable[[str], None]] = None
    ):
        self.on_status = on_status
        self.on_ready = on_ready
        self.on_latency = on_latency
        self.on_log = on_log

        self.token: str = ""
        self.guild_id: str = ""
        self.channel_id: str = ""
        self.active_channel_id: Optional[str] = None
        self.dynamic_channel_id: Optional[str] = None
        self.user_id: str = ""
        self.self_mute: bool = True
        self.self_deaf: bool = True
        self.activity_name: str = ""

        self.is_connected: bool = False
        self.is_running: bool = False
        self.start_time: float = 0.0

        # Anti-glitch & Emergency safeguards
        self.last_opcode4_ms: float = 0.0
        self.recent_joins: List[float] = []
        self.cooldown_until: float = 0.0
        self.is_jtc_pending: bool = False
        self.is_emergency_locked: bool = False
        self.consecutive_rapid_drops: int = 0
        self.last_connected_time: float = 0.0

        self._thread: Optional[threading.Thread] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._ws: Optional[websockets.WebSocketClientProtocol] = None
        self._sequence: Optional[int] = None
        self._heartbeat_task: Optional[asyncio.Task] = None
        self._last_heartbeat_sent: float = 0.0

    def log(self, msg: str):
        t_str = time.strftime("%H:%M:%S")
        formatted = f"[{t_str}] {msg}"
        if self.on_log:
            try:
                self.on_log(formatted)
            except Exception:
                pass

    def _notify_status(self, msg: str, connected: bool):
        if self.on_status:
            try:
                self.on_status(msg, connected)
            except Exception:
                pass

    def _notify_ready(self, user: Dict[str, Any]):
        if self.on_ready:
            try:
                self.on_ready(user)
            except Exception:
                pass

    def _notify_latency(self, latency_ms: float):
        if self.on_latency:
            try:
                self.on_latency(latency_ms)
            except Exception:
                pass

    def emergency_killswitch(self, reason: str = "Manual User Trigger"):
        """
        Forcefully leaves voice immediately and engages a strict lockout
        that prevents any automatic reconnects or room joins.
        """
        self.is_emergency_locked = True
        self.is_running = False
        self.is_connected = False
        self.active_channel_id = None
        self.dynamic_channel_id = None
        self.log(f"⛔ EMERGENCY KILLSWITCH ENGAGED! Reason: {reason}")
        self.log("⛔ Voice connection forcefully severed. Room join is locked to prevent spam loops.")
        if self._loop and self._loop.is_running():
            asyncio.run_coroutine_threadsafe(self._cleanup(), self._loop)
        self._notify_status(f"⛔ EMERGENCY LOCKED: {reason}", False)

    def unlock_emergency(self):
        """Resets the emergency lockout and allows normal voice connection."""
        self.is_emergency_locked = False
        self.consecutive_rapid_drops = 0
        self.log("🔓 Emergency lock reset. Safe to reconnect.")
        self._notify_status("Emergency lockout reset. Ready to join voice.", False)

    def start(self, token: str, guild_id: str, channel_id: str, self_mute: bool = True, self_deaf: bool = True, activity_name: str = ""):
        if self.is_emergency_locked:
            self.log("❌ Cannot join: Emergency Lockout is currently ACTIVE! Please click 'Reset Emergency Lock' first.")
            self._notify_status("⛔ Cannot join: Emergency lockout is active. Click 'Reset Emergency Lock' to proceed.", False)
            return False

        if self.is_running:
            self.stop()

        self.token = token.strip()
        self.guild_id = str(guild_id).strip()
        self.channel_id = str(channel_id).strip()
        self.active_channel_id = None
        self.dynamic_channel_id = None
        self.self_mute = self_mute
        self.self_deaf = self_deaf
        self.activity_name = activity_name.strip()
        self.cooldown_until = 0.0
        self.recent_joins = []
        self.is_jtc_pending = False

        if not self.token or not self.guild_id or not self.channel_id:
            self.log("❌ Error: Token, Server ID, and Channel ID are all required.")
            self._notify_status("Error: Token, Server ID, and Channel ID are all required.", False)
            return False

        self.is_running = True
        self.start_time = time.time()
        self.log(f"● Starting Voice AFK Engine (Server: {self.guild_id}, Target: {self.channel_id})...")
        self._thread = threading.Thread(target=self._run_async_thread, daemon=True)
        self._thread.start()
        return True

    def stop(self):
        self.is_running = False
        if self._loop and self._loop.is_running():
            asyncio.run_coroutine_threadsafe(self._cleanup(), self._loop)
        self.is_connected = False
        self.active_channel_id = None
        self.dynamic_channel_id = None
        self.log("○ Stopped Voice AFK Engine. Disconnected from Voice.")
        self._notify_status("Disconnected from Voice Channel", False)

    def _run_async_thread(self):
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)
        try:
            self._loop.run_until_complete(self._main_loop())
        finally:
            self._loop.close()
            self._loop = None

    async def _cleanup(self):
        if self._ws:
            try:
                leave_payload = {
                    "op": 4,
                    "d": {
                        "guild_id": self.guild_id,
                        "channel_id": None,
                        "self_mute": True,
                        "self_deaf": True
                    }
                }
                await self._ws.send(json.dumps(leave_payload))
                await asyncio.sleep(0.3)
                await self._ws.close()
            except Exception:
                pass
            self._ws = None
        if self._heartbeat_task:
            self._heartbeat_task.cancel()

    async def _send_heartbeats(self, interval_ms: float):
        interval_sec = interval_ms / 1000.0
        try:
            while self.is_running and self._ws:
                self._last_heartbeat_sent = time.time()
                payload = {"op": 1, "d": self._sequence}
                await self._ws.send(json.dumps(payload))
                await asyncio.sleep(interval_sec)
        except asyncio.CancelledError:
            pass
        except Exception:
            pass

    async def _main_loop(self):
        backoff = 4
        while self.is_running and not self.is_emergency_locked:
            try:
                self.log("● Connecting to Discord Gateway (v=10)...")
                self._notify_status("Connecting to Discord Gateway...", False)
                async with websockets.connect(GATEWAY_URL, ping_interval=None, max_size=10_000_000) as ws:
                    self._ws = ws
                    backoff = 4

                    async for message in ws:
                        if not self.is_running or self.is_emergency_locked:
                            break

                        data = json.loads(message)
                        op = data.get("op")
                        event_type = data.get("t")
                        seq = data.get("s")
                        d = data.get("d")

                        if seq is not None:
                            self._sequence = seq

                        # Opcode 10: HELLO
                        if op == 10:
                            interval = d.get("heartbeat_interval", 41250)
                            if self._heartbeat_task:
                                self._heartbeat_task.cancel()
                            self._heartbeat_task = asyncio.create_task(self._send_heartbeats(interval))
                            await self._identify()

                        # Opcode 11: Heartbeat ACK
                        elif op == 11:
                            if self._last_heartbeat_sent > 0:
                                lat = (time.time() - self._last_heartbeat_sent) * 1000.0
                                self._notify_latency(round(lat, 1))

                        # Opcode 0: DISPATCH
                        elif op == 0:
                            if event_type == "READY":
                                user = d.get("user", {})
                                self.user_id = str(user.get("id", ""))
                                self.log(f"● Gateway logged in as {user.get('username')} (ID: {self.user_id})")
                                self._notify_ready(user)
                                await asyncio.sleep(0.8)
                                await self._join_voice()

                            elif event_type == "VOICE_STATE_UPDATE":
                                uid = str(d.get("user_id", ""))
                                if self.user_id and uid == self.user_id:
                                    ch_id = d.get("channel_id")
                                    if ch_id:
                                        self.active_channel_id = str(ch_id)
                                        self.is_connected = True
                                        self.last_connected_time = time.time()
                                        self.consecutive_rapid_drops = 0
                                        self.is_jtc_pending = False

                                        # If dynamic room
                                        if str(ch_id) != self.channel_id:
                                            self.dynamic_channel_id = str(ch_id)
                                            self.log(f"● In Dynamic Room: {ch_id} (Sticky lock active)")
                                        else:
                                            self.log(f"● In Lobby: {ch_id} (Awaiting dynamic room)")

                                        self._notify_status(f"Active in Voice Room: {ch_id}", True)
                                    else:
                                        # Disconnected
                                        stay_sec = (time.time() - self.last_connected_time) if self.last_connected_time > 0 else 999
                                        self.is_connected = False
                                        self.active_channel_id = None
                                        self.dynamic_channel_id = None
                                        self.log(f"○ Voice disconnected (stayed: {stay_sec:.1f}s)")

                                        # AUTO-EXECUTE EMERGENCY KILLSWITCH:
                                        if stay_sec < 15.0:
                                            self.consecutive_rapid_drops += 1
                                            self.log(f"⚠️ Rapid room drop ({self.consecutive_rapid_drops}/2) in <15s!")
                                            if self.consecutive_rapid_drops >= 2:
                                                self.log("⛔ AUTO-TRIGGER: 2 rapid room drops! Engaging Emergency Killswitch to prevent server timeout!")
                                                self.emergency_killswitch("Auto-Triggered: Detected room loop/glitch")
                                                break
                                        else:
                                            self.consecutive_rapid_drops = 0

                                        self._notify_status("Voice disconnected. Circuit breaker cooldown...", False)

                        # Opcode 1: Heartbeat requested
                        elif op == 1:
                            await ws.send(json.dumps({"op": 1, "d": self._sequence}))

                        # Opcode 7 or 9: Reconnect / Invalid Session
                        elif op in (7, 9):
                            self.log(f"⚠️ Gateway session reset (op {op}). Reconnecting...")
                            self._notify_status("Gateway session reset. Reconnecting...", False)
                            await asyncio.sleep(2)
                            break

            except (websockets.ConnectionClosedError, Exception) as e:
                err_str = str(e)
                if "4004" in err_str:
                    self.log("❌ Authentication failed: Invalid Discord Token (4004)!")
                    self._notify_status("Authentication failed: Invalid Discord Token!", False)
                    self.is_running = False
                    return
                self.log(f"⚠️ Connection dropped: {err_str}")
                self._notify_status(f"Connection dropped: {err_str}", False)
            finally:
                if self._heartbeat_task:
                    self._heartbeat_task.cancel()
                self._ws = None

            if self.is_running and not self.is_emergency_locked:
                # Countdown backoff to prevent reconnect loops
                for sec in range(backoff, 0, -1):
                    if not self.is_running or self.is_emergency_locked:
                        break
                    self._notify_status(f"Rate-limit cooldown: Resuming in {sec}s...", False)
                    await asyncio.sleep(1)
                backoff = min(backoff * 2, 60)

    async def _identify(self):
        activities = []
        if self.activity_name:
            activities.append({
                "name": self.activity_name,
                "type": 0,
                "timestamps": {"start": int(time.time() * 1000)}
            })

        payload = {
            "op": 2,
            "d": {
                "token": self.token,
                "capabilities": 30717,
                "properties": {
                    "os": "Windows",
                    "browser": "Chrome",
                    "device": "",
                    "system_locale": "en-US",
                    "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "browser_version": "122.0.0.0",
                    "os_version": "10",
                    "referrer": "",
                    "referring_domain": "",
                    "release_channel": "stable",
                    "client_build_number": 272840
                },
                "presence": {
                    "status": "online",
                    "since": 0,
                    "activities": activities,
                    "afk": True
                },
                "compress": False
            }
        }
        await self._ws.send(json.dumps(payload))

    def _resolve_valid_channel_sync(self) -> str:
        try:
            req = urllib.request.Request(
                f"https://discord.com/api/v10/guilds/{self.guild_id}/channels",
                headers={"Authorization": self.token, "User-Agent": "Mozilla/5.0"}
            )
            with urllib.request.urlopen(req, timeout=5) as r:
                channels = json.loads(r.read().decode("utf-8"))
                vcs = [c for c in channels if c.get("type") in (2, 13)]
                if not vcs:
                    return self.channel_id
                if self.dynamic_channel_id and any(str(c.get("id")) == str(self.dynamic_channel_id) for c in vcs):
                    return str(self.dynamic_channel_id)
                if self.active_channel_id and any(str(c.get("id")) == str(self.active_channel_id) for c in vcs):
                    return str(self.active_channel_id)
                if any(str(c.get("id")) == str(self.channel_id) for c in vcs):
                    return str(self.channel_id)
                jtc = next((c for c in vcs if "JOIN TO CREATE" in (c.get("name") or "").upper()), vcs[0])
                self.channel_id = str(jtc["id"])
                return self.channel_id
        except Exception:
            return self.dynamic_channel_id or self.active_channel_id or self.channel_id

    async def _join_voice(self):
        if self.is_emergency_locked:
            self.log("⛔ Join aborted: Emergency lockout engaged.")
            return

        now = time.time() * 1000.0
        # Rate limit: minimum 6 seconds between Opcode 4 sends
        if (now - self.last_opcode4_ms) < 6000:
            return

        # Check circuit breaker: max 2 joins in 60s
        self.recent_joins = [t for t in self.recent_joins if (now - t) < 60000]
        if len(self.recent_joins) >= 2:
            self.log("⚠️ Circuit breaker triggered: 2 joins in <60s! Auto-cooling down for 30s...")
            self._notify_status("Circuit breaker active: rate limit protection cooldown (30s)...", False)
            await asyncio.sleep(30)
            self.recent_joins.clear()

        target_chan = await asyncio.to_thread(self._resolve_valid_channel_sync)

        self.last_opcode4_ms = time.time() * 1000.0
        self.recent_joins.append(self.last_opcode4_ms)
        self.is_jtc_pending = (target_chan == self.channel_id)

        self.log(f"● Sending Opcode 4 voice join packet to channel: {target_chan}")
        payload = {
            "op": 4,
            "d": {
                "guild_id": self.guild_id,
                "channel_id": target_chan,
                "self_mute": self.self_mute,
                "self_deaf": self.self_deaf
            }
        }
        await self._ws.send(json.dumps(payload))
