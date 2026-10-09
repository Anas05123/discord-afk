import os
import sys

# Ensure script directory is on sys.path so keep_alive is importable regardless of working directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import json
import time
import asyncio
import logging
from typing import Optional, Dict, Any, List

try:
    import websockets
except ImportError:
    print("[Error] 'websockets' library is required. Run: pip install websockets")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    env_in_script_dir = os.path.join(SCRIPT_DIR, ".env")
    if os.path.exists(env_in_script_dir):
        load_dotenv(env_in_script_dir)
    else:
        load_dotenv()
except ImportError:
    pass

from keep_alive import start_keep_alive

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("AFKWorker")

GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json"

class DiscordAFKWorker:
    def __init__(
        self,
        token: str,
        guild_id: str,
        channel_id: str,
        self_mute: bool = True,
        self_deaf: bool = True,
        activity_config: Optional[Dict[str, Any]] = None
    ):
        self.token = token.strip()
        self.guild_id = str(guild_id).strip()
        self.channel_id = str(channel_id).strip()
        self.self_mute = self_mute
        self.self_deaf = self_deaf
        self.activity_config = activity_config or {}
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self.sequence: Optional[int] = None
        self.session_id: Optional[str] = None
        self.resume_gateway_url: Optional[str] = None
        self.heartbeat_task: Optional[asyncio.Task] = None
        self.is_running = True

    def _build_presence_payload(self) -> Dict[str, Any]:
        """Builds presence payload including custom activities (Playing, Streaming, Listening, Watching)."""
        status = self.activity_config.get("status", "online")
        act_name = self.activity_config.get("name", "").strip()
        
        activities: List[Dict[str, Any]] = []
        if act_name:
            act_type = int(self.activity_config.get("type", 0))  # 0=Playing, 1=Streaming, 2=Listening, 3=Watching
            act_entry: Dict[str, Any] = {
                "name": act_name,
                "type": act_type
            }
            if self.activity_config.get("details"):
                act_entry["details"] = self.activity_config["details"]
            if self.activity_config.get("state"):
                act_entry["state"] = self.activity_config["state"]
            if act_type == 1:
                act_entry["url"] = self.activity_config.get("stream_url", "https://twitch.tv/discord")
            
            if self.activity_config.get("show_timer", True):
                act_entry["timestamps"] = {"start": int(time.time() * 1000)}

            activities.append(act_entry)

        return {
            "status": status,
            "since": 0,
            "activities": activities,
            "afk": True
        }

    async def _send_heartbeat(self, interval_ms: float):
        interval_sec = interval_ms / 1000.0
        try:
            while self.is_running and self.ws:
                payload = {
                    "op": 1,
                    "d": self.sequence
                }
                await self.ws.send(json.dumps(payload))
                logger.debug(f"Heartbeat sent (sequence: {self.sequence})")
                await asyncio.sleep(interval_sec)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.warning(f"Heartbeat loop terminated: {e}")

    async def _identify(self):
        presence_data = self._build_presence_payload()
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
                    "referrer_current": "",
                    "referring_domain_current": "",
                    "release_channel": "stable",
                    "client_build_number": 272840,
                    "client_event_source": None
                },
                "presence": presence_data,
                "compress": False,
                "client_state": {
                    "guild_versions": {}
                }
            }
        }
        await self.ws.send(json.dumps(payload))
        act_info = self.activity_config.get("name") or "None"
        logger.info(f"Sent Identify payload (Status: {presence_data['status']}, Activity: {act_info})")

    async def _join_voice_channel(self):
        payload = {
            "op": 4,
            "d": {
                "guild_id": self.guild_id,
                "channel_id": self.channel_id,
                "self_mute": self.self_mute,
                "self_deaf": self.self_deaf
            }
        }
        await self.ws.send(json.dumps(payload))
        logger.info(
            f"Joined Voice Channel {self.channel_id} in Guild {self.guild_id} "
            f"(Muted: {self.self_mute}, Deafened: {self.self_deaf})"
        )

    async def run(self):
        backoff = 3
        while self.is_running:
            try:
                logger.info(f"Connecting to Discord Gateway ({GATEWAY_URL})...")
                async with websockets.connect(
                    GATEWAY_URL,
                    ping_interval=None,
                    max_size=10_000_000
                ) as ws:
                    self.ws = ws
                    backoff = 3

                    async for message in ws:
                        data = json.loads(message)
                        op = data.get("op")
                        event_type = data.get("t")
                        seq = data.get("s")
                        event_data = data.get("d")

                        if seq is not None:
                            self.sequence = seq

                        # Opcode 10: HELLO
                        if op == 10:
                            interval = event_data.get("heartbeat_interval", 41250)
                            logger.info(f"Received HELLO. Heartbeat interval: {interval}ms")
                            if self.heartbeat_task:
                                self.heartbeat_task.cancel()
                            self.heartbeat_task = asyncio.create_task(self._send_heartbeat(interval))
                            await self._identify()

                        # Opcode 0: DISPATCH
                        elif op == 0:
                            if event_type == "READY":
                                user_info = event_data.get("user", {})
                                username = user_info.get("username", "Unknown")
                                self.session_id = event_data.get("session_id")
                                self.resume_gateway_url = event_data.get("resume_gateway_url")
                                logger.info(f"Successfully logged in as: {username} (ID: {user_info.get('id')})")
                                await asyncio.sleep(1.5)
                                await self._join_voice_channel()

                            elif event_type == "VOICE_STATE_UPDATE":
                                user_id = event_data.get("user_id")
                                ch_id = event_data.get("channel_id")
                                if ch_id == self.channel_id:
                                    logger.info(f"Voice state active for target channel ({ch_id}).")

                        # Opcode 1: Heartbeat requested by server
                        elif op == 1:
                            await ws.send(json.dumps({"op": 1, "d": self.sequence}))

                        # Opcode 7: Reconnect
                        elif op == 7:
                            logger.warning("Received Reconnect (Opcode 7). Reconnecting...")
                            break

                        # Opcode 9: Invalid Session
                        elif op == 9:
                            logger.warning("Received Invalid Session (Opcode 9). Re-identifying...")
                            await asyncio.sleep(2)
                            await self._identify()

            except (websockets.ConnectionClosedError, websockets.ConnectionClosedOK, Exception) as e:
                logger.error(f"Gateway connection lost: {e}")
            finally:
                if self.heartbeat_task:
                    self.heartbeat_task.cancel()
                self.ws = None

            if self.is_running:
                logger.info(f"Waiting {backoff}s before reconnecting to keep your voice room connection alive...")
                await asyncio.sleep(backoff)
                backoff = min(backoff * 2, 60)

def main():
    token = os.getenv("DISCORD_TOKEN")
    guild_id = os.getenv("GUILD_ID")
    channel_id = os.getenv("CHANNEL_ID")

    # Fallback to local config.json if environment variables are not set
    if not (token and guild_id and channel_id):
        for candidate in [
            os.path.join(SCRIPT_DIR, "config.json"),
            os.path.join(os.path.dirname(SCRIPT_DIR), "config.json")
        ]:
            if os.path.exists(candidate):
                try:
                    with open(candidate, "r", encoding="utf-8") as f:
                        cdata = json.load(f)
                        token = token or cdata.get("discord_token")
                        guild_id = guild_id or cdata.get("saved_guild_id")
                        channel_id = channel_id or cdata.get("saved_channel_id")
                except Exception:
                    pass

    self_mute = os.getenv("SELF_MUTE", "true").lower() in ("true", "1", "yes")
    self_deaf = os.getenv("SELF_DEAF", "true").lower() in ("true", "1", "yes")
    port = int(os.getenv("PORT", "10000"))

    # Optional 24/7 Custom Activity while offline
    act_config = {
        "status": os.getenv("ACTIVITY_STATUS", "online"),  # online, idle, dnd
        "name": os.getenv("ACTIVITY_NAME", "Visual Studio Code"),  # Any game or app name
        "type": int(os.getenv("ACTIVITY_TYPE", "0")),  # 0=Playing, 1=Streaming, 2=Listening, 3=Watching
        "details": os.getenv("ACTIVITY_DETAILS", "Coding 24/7"),
        "state": os.getenv("ACTIVITY_STATE", "In Voice Channel"),
        "stream_url": os.getenv("STREAM_URL", "https://twitch.tv/discord"),
        "show_timer": os.getenv("SHOW_TIMER", "true").lower() in ("true", "1", "yes")
    }

    start_keep_alive(port=port)

    if not token or not guild_id or not channel_id:
        logger.error("=" * 60)
        logger.error("MISSING ENVIRONMENT VARIABLES!")
        logger.error("Please set DISCORD_TOKEN, GUILD_ID, and CHANNEL_ID in .env or cloud settings.")
        logger.error("=" * 60)
        while True:
            time.sleep(3600)

    logger.info("=" * 60)
    logger.info("Starting Discord 24/7 Voice AFK Worker (PC Offline Mode)")
    logger.info(f"Target Guild ID:   {guild_id}")
    logger.info(f"Target Channel ID: {channel_id}")
    logger.info(f"Self-Mute:         {self_mute}")
    logger.info(f"Self-Deafen:       {self_deaf}")
    if act_config.get("name"):
        logger.info(f"24/7 Activity:     {act_config['name']} (Details: {act_config['details']})")
    logger.info("=" * 60)

    worker = DiscordAFKWorker(
        token=token,
        guild_id=guild_id,
        channel_id=channel_id,
        self_mute=self_mute,
        self_deaf=self_deaf,
        activity_config=act_config
    )

    try:
        asyncio.run(worker.run())
    except KeyboardInterrupt:
        logger.info("Worker stopped by user.")

if __name__ == "__main__":
    main()
