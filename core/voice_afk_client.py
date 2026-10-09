import json
import time
import asyncio
import threading
from typing import Optional, Callable, Dict, Any
import websockets

GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json"

class VoiceAFKClient:
    """
    In-App Discord Voice Room AFK Engine.
    Runs asynchronously in a background worker thread.
    Allows user to join and leave voice rooms with self-mute and self-deafen,
    reporting live status, username, latency, and session uptime back to the GUI.
    """
    def __init__(
        self,
        on_status: Optional[Callable[[str, bool], None]] = None,
        on_ready: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_latency: Optional[Callable[[float], None]] = None
    ):
        self.on_status = on_status
        self.on_ready = on_ready
        self.on_latency = on_latency

        self.token: str = ""
        self.guild_id: str = ""
        self.channel_id: str = ""
        self.self_mute: bool = True
        self.self_deaf: bool = True
        self.activity_name: str = ""

        self.is_connected: bool = False
        self.is_running: bool = False
        self.start_time: float = 0.0

        self._thread: Optional[threading.Thread] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._ws: Optional[websockets.WebSocketClientProtocol] = None
        self._sequence: Optional[int] = None
        self._heartbeat_task: Optional[asyncio.Task] = None
        self._last_heartbeat_sent: float = 0.0

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

    def start(self, token: str, guild_id: str, channel_id: str, self_mute: bool = True, self_deaf: bool = True, activity_name: str = ""):
        if self.is_running:
            self.stop()

        self.token = token.strip()
        self.guild_id = str(guild_id).strip()
        self.channel_id = str(channel_id).strip()
        self.self_mute = self_mute
        self.self_deaf = self_deaf
        self.activity_name = activity_name.strip()

        if not self.token or not self.guild_id or not self.channel_id:
            self._notify_status("Error: Token, Server ID, and Channel ID are all required.", False)
            return False

        self.is_running = True
        self.start_time = time.time()
        self._thread = threading.Thread(target=self._run_async_thread, daemon=True)
        self._thread.start()
        return True

    def stop(self):
        self.is_running = False
        if self._loop and self._loop.is_running():
            asyncio.run_coroutine_threadsafe(self._cleanup(), self._loop)
        self.is_connected = False
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
                # Send voice state update with null channel to cleanly leave
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
        backoff = 3
        while self.is_running:
            try:
                self._notify_status("Connecting to Discord Gateway...", False)
                async with websockets.connect(GATEWAY_URL, ping_interval=None, max_size=10_000_000) as ws:
                    self._ws = ws
                    backoff = 3

                    async for message in ws:
                        if not self.is_running:
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
                                self._notify_ready(user)
                                await asyncio.sleep(1.0)
                                await self._join_voice()

                            elif event_type == "VOICE_STATE_UPDATE":
                                if d.get("channel_id") == self.channel_id:
                                    self.is_connected = True
                                    self._notify_status(f"Connected in Room: {self.channel_id}", True)

                        # Opcode 1: Heartbeat requested
                        elif op == 1:
                            await ws.send(json.dumps({"op": 1, "d": self._sequence}))

                        # Opcode 7 or 9: Reconnect / Invalid Session
                        elif op in (7, 9):
                            self._notify_status("Session reset by Discord. Re-identifying...", False)
                            await asyncio.sleep(2)
                            break

            except (websockets.ConnectionClosedError, Exception) as e:
                err_str = str(e)
                if "4004" in err_str:
                    self._notify_status("Authentication failed: Invalid Discord Token!", False)
                    self.is_running = False
                    return
                self._notify_status(f"Gateway connection dropped: {err_str}", False)
            finally:
                if self._heartbeat_task:
                    self._heartbeat_task.cancel()
                self._ws = None

            if self.is_running:
                self._notify_status(f"Auto-reconnecting in {backoff}s to keep voice room alive...", False)
                await asyncio.sleep(backoff)
                backoff = min(backoff * 2, 30)

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

    async def _join_voice(self):
        payload = {
            "op": 4,
            "d": {
                "guild_id": self.guild_id,
                "channel_id": self.channel_id,
                "self_mute": self.self_mute,
                "self_deaf": self.self_deaf
            }
        }
        await self._ws.send(json.dumps(payload))
