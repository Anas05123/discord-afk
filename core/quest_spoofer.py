import os
import sys
import time
import shutil
import subprocess
import threading
from typing import Dict, Any, List, Optional, Callable
try:
    import psutil
except ImportError:
    psutil = None

BIN_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "bin")
RUN_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "spoofer_runtime")
TEMPLATE_EXE = os.path.join(BIN_DIR, "template.exe")

QUEST_GAMES: List[Dict[str, Any]] = [
    {
        "id": "oncehuman",
        "name": "Once Human",
        "exe": "once human/once_human.exe",
        "client_id": "1260340082150346932",
        "emoji": "🧬",
        "desc": "Active Quest: 15m for 700 Orbs & in-game rewards",
        "icon": "https://cdn.discordapp.com/app-icons/1260340082150346932/cbce2f168fcfb297ee45f7881180bbab.png"
    },
    {
        "id": "fc27",
        "name": "EA SPORTS FC™ 27",
        "exe": "ea sports fc 27/fc27.exe",
        "client_id": "1531874756096295054",
        "emoji": "⚽",
        "desc": "Active Quest: 15m for 700 Orbs (Select PC on Quest card)",
        "icon": "https://cdn.discordapp.com/app-icons/1531874756096295054/0c17a8c3d7eef9876e5d8363595f9c66.png"
    },
    {
        "id": "marvelrivals",
        "name": "Marvel Rivals",
        "exe": "win64/marvel.exe",
        "client_id": "1314395942253756416",
        "emoji": "🦸",
        "desc": "6v6 Super Hero Team Shooter Discord Quest",
        "icon": "https://cdn.discordapp.com/app-icons/1314395942253756416/9ba7fbfeb0e10e12d1bbf90731a29f8c.png"
    },
    {
        "id": "deltaforce",
        "name": "Delta Force",
        "exe": "win64/deltaforceclient-win64-shipping.exe",
        "client_id": "1314682894106497096",
        "emoji": "🪖",
        "desc": "Tactical FPS Discord Quest rewards",
        "icon": "https://cdn.discordapp.com/app-icons/1314682894106497096/9c1a0170a442e979a40733d71ffba6e6.png"
    },
    {
        "id": "ror2",
        "name": "Risk of Rain 2",
        "exe": "risk of rain 2/risk of rain 2.exe",
        "client_id": "1402418087793528862",
        "emoji": "🌧️",
        "desc": "Roguelike Discord Quest 15m rewards",
        "icon": "https://cdn.discordapp.com/app-icons/1402418087793528862/5c3eb807b55cfca626f224b17bf4fe6e.png"
    },
    {
        "id": "wherewindsmeet",
        "name": "Where Winds Meet",
        "exe": "where winds meet/wherewindsmeet.exe",
        "client_id": "1437509662303059998",
        "emoji": "🌪️",
        "desc": "Wuxia Open-World Action RPG Quest",
        "icon": "https://cdn.discordapp.com/app-icons/1437509662303059998/1bc98fa85b542e88a08711ae77c2725e.png"
    },
    {
        "id": "genshin",
        "name": "Genshin Impact",
        "exe": "genshinimpact.exe",
        "client_id": "762434991303950386",
        "emoji": "⚔️",
        "desc": "Frequent 15-minute Discord Quest rewards"
    },
    {
        "id": "starrail",
        "name": "Honkai: Star Rail",
        "exe": "starrail.exe",
        "client_id": "1121201675240210523",
        "emoji": "🌠",
        "desc": "15-minute Quest rewards (Stellar Jades)"
    },
    {
        "id": "fortnite",
        "name": "Fortnite",
        "exe": "fortniteclient-win64-shipping.exe",
        "client_id": "432980957394370572",
        "emoji": "🪂",
        "desc": "Play or Stream 15m Quest for in-game cosmetics"
    },
    {
        "id": "nte",
        "name": "Neverness to Everness",
        "exe": "htgame.exe",
        "client_id": "1470616226995765409",
        "emoji": "🏙️",
        "desc": "Anime open-world RPG Discord Quest spoofer",
        "icon": "https://cdn.discordapp.com/app-icons/1470616226995765409/e9a6d14e304637d878c04f35251eaf7d.png"
    },
    {
        "id": "giants",
        "name": "March of Giants",
        "exe": "thelineclient-win64-shipping.exe",
        "client_id": "1428223713928810496",
        "emoji": "🗿",
        "desc": "Official Discord detectable partner game",
        "icon": "https://cdn.discordapp.com/app-icons/1428223713928810496/475baeffb337fe92410d00a2fd4e4d04.png"
    },
    {
        "id": "hellraiser",
        "name": "Clive Barker's Hellraiser: Revival",
        "exe": "hellraiser-win64-shipping.exe",
        "client_id": "1552168352116641822",
        "emoji": "⛓️",
        "desc": "Clive Barker's Hellraiser official executable",
        "icon": "https://cdn.discordapp.com/app-icons/1552168352116641822/303c6f901a9433229d09f940d9338bef.png"
    },
    {
        "id": "finals",
        "name": "THE FINALS",
        "exe": "discovery.exe",
        "client_id": "1182713227491147776",
        "emoji": "🏆",
        "desc": "Official Discord Quest partner game"
    },
    {
        "id": "zzz",
        "name": "Zenless Zone Zero",
        "exe": "zenlesszonezero.exe",
        "client_id": "1257819671114289184",
        "emoji": "⚡",
        "desc": "Hoyoverse Discord Quest rewards"
    },
    {
        "id": "dbd",
        "name": "Dead by Daylight",
        "exe": "deadbydaylight-win64-shipping.exe",
        "client_id": "357607133254254632",
        "emoji": "🪓",
        "desc": "Play 15m for exclusive Rift & Bloodpoints"
    },
    {
        "id": "valorant",
        "name": "VALORANT",
        "exe": "valorant-win64-shipping.exe",
        "client_id": "700136079562375258",
        "emoji": "🎯",
        "desc": "Riot Games Discord Quest support"
    },
    {
        "id": "apex",
        "name": "Apex Legends",
        "exe": "r5apex.exe",
        "client_id": "542075586886107149",
        "emoji": "🔫",
        "desc": "Battle pass / Apex coins Quests"
    },
    {
        "id": "roblox",
        "name": "ROBLOX",
        "exe": "robloxplayerbeta.exe",
        "client_id": "363445589247131668",
        "emoji": "🧱",
        "desc": "Roblox badge & quest promotions"
    },
    {
        "id": "overwatch",
        "name": "Overwatch 2",
        "exe": "overwatch.exe",
        "client_id": "356875221078245376",
        "emoji": "🛡️",
        "desc": "Battle pass and cosmetic drops"
    },
    {
        "id": "warframe",
        "name": "Warframe",
        "exe": "warframe.x64.exe",
        "client_id": "356877717460877312",
        "emoji": "⚔️",
        "desc": "Twitch & Discord Quest rewards"
    },
    {
        "id": "minecraft",
        "name": "Minecraft",
        "exe": "minecraft.exe",
        "client_id": "432980957394370572",
        "emoji": "⛏️",
        "desc": "15m Bedrock & Java cape quests"
    }
]

class QuestSpoofer:
    """
    Simulates game execution for Discord Quests with continuous Auto-Queue Playlist support.
    Spawns ultra-lightweight Windows processes matching Discord's registered
    detectable game executables, triggering Discord's native 15-minute Quest tracking.
    """
    def __init__(
        self,
        on_status_change: Optional[Callable[[str, bool, Optional[str]], None]] = None,
        on_tick: Optional[Callable[[int, int], None]] = None,
        on_game_switched: Optional[Callable[[Dict[str, Any]], None]] = None,
        on_queue_update: Optional[Callable[[List[Dict[str, Any]], int], None]] = None,
        on_queue_completed: Optional[Callable[[], None]] = None
    ):
        self.on_status_change = on_status_change
        self.on_tick = on_tick
        self.on_game_switched = on_game_switched
        self.on_queue_update = on_queue_update
        self.on_queue_completed = on_queue_completed

        self.current_process: Optional[subprocess.Popen] = None
        self.current_game: Optional[Dict[str, Any]] = None
        self.current_exe_path: Optional[str] = None
        self.start_time: float = 0.0
        self.is_running: bool = False
        self.target_seconds: int = 15 * 60  # Default: Standard 15m Discord Quest
        self.spawned_files: List[str] = []
        self.spawned_dirs: List[str] = []

        # Queue Playlist state
        self.queue: List[Dict[str, Any]] = []
        self.current_queue_index: int = -1
        self.is_queue_mode: bool = False

        self._monitor_thread: Optional[threading.Thread] = None
        self._tick_token: int = 0
        self._stop_event: threading.Event = threading.Event()

        os.makedirs(BIN_DIR, exist_ok=True)
        os.makedirs(RUN_DIR, exist_ok=True)
        self._ensure_template()

    def _ensure_template(self):
        """Compiles template.exe with a real Win32 game window so Discord's window scanner detects it."""
        if os.path.exists(TEMPLATE_EXE):
            return
        csc_path = r"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
        if not os.path.exists(csc_path):
            csc_path = r"C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"

        cs_code = (
            "using System; using System.Drawing; using System.Windows.Forms;\n"
            "class GameWindow : Form {\n"
            "    public GameWindow(string title, string exe) {\n"
            "        this.Text = title; this.Size = new Size(460, 240);\n"
            "        this.StartPosition = FormStartPosition.CenterScreen;\n"
            "        this.FormBorderStyle = FormBorderStyle.FixedDialog; this.MaximizeBox = false;\n"
            "        this.BackColor = Color.FromArgb(43, 45, 49); this.ForeColor = Color.White;\n"
            "        Label l1 = new Label { Text = \"🎮 \" + title, Font = new Font(\"Segoe UI\", 14, FontStyle.Bold), ForeColor = Color.FromArgb(88, 101, 242), Location = new Point(20, 20), AutoSize = true };\n"
            "        Label l2 = new Label { Text = \"🟢 Discord Game Process Active (\" + exe + \")\", Font = new Font(\"Segoe UI\", 10), ForeColor = Color.FromArgb(87, 242, 135), Location = new Point(22, 60), AutoSize = true };\n"
            "        Label l3 = new Label { Text = \"Keep this window open or minimized while completing your quest.\\nDiscord automatically detects this window as the running game.\", Font = new Font(\"Segoe UI\", 9), ForeColor = Color.FromArgb(181, 186, 193), Location = new Point(22, 95), Size = new Size(400, 40) };\n"
            "        Button b = new Button { Text = \"Minimize Window\", Font = new Font(\"Segoe UI\", 9, FontStyle.Bold), BackColor = Color.FromArgb(53, 55, 60), ForeColor = Color.White, FlatStyle = FlatStyle.Flat, Location = new Point(22, 145), Size = new Size(130, 32) };\n"
            "        b.FlatAppearance.BorderSize = 0; b.Click += (s, e) => { this.WindowState = FormWindowState.Minimized; };\n"
            "        this.Controls.Add(l1); this.Controls.Add(l2); this.Controls.Add(l3); this.Controls.Add(b);\n"
            "    }\n"
            "    [STAThread]\n"
            "    static void Main(string[] args) {\n"
            "        string t = args.Length > 0 ? args[0] : \"Game\";\n"
            "        string x = args.Length > 1 ? args[1] : System.AppDomain.CurrentDomain.FriendlyName;\n"
            "        Application.EnableVisualStyles(); Application.Run(new GameWindow(t, x));\n"
            "    }\n"
            "}\n"
        )
        temp_cs = os.path.join(BIN_DIR, "temp_prog.cs")
        try:
            with open(temp_cs, "w", encoding="utf-8") as f:
                f.write(cs_code)
            subprocess.run([
                csc_path, "/nologo", "/target:winexe",
                "/r:System.Windows.Forms.dll", "/r:System.Drawing.dll",
                f"/out:{TEMPLATE_EXE}", temp_cs
            ], capture_output=True, check=True)
            if os.path.exists(temp_cs):
                os.remove(temp_cs)
        except Exception as e:
            print(f"[QuestSpoofer] Error compiling template: {e}")

    # =========================================================================
    # QUEUE PLAYLIST MANAGEMENT
    # =========================================================================
    def set_target_duration(self, minutes: int):
        """Sets the quest duration per game in minutes."""
        self.target_seconds = max(10, int(minutes * 60))

    def add_to_queue(self, game_info: Dict[str, Any]) -> int:
        """Adds a game to the playlist queue. Returns current queue count."""
        item = {
            "game": game_info,
            "status": "pending",  # "pending", "running", "done"
            "added_at": time.time()
        }
        self.queue.append(item)
        if self.on_queue_update:
            try:
                self.on_queue_update(self.queue, self.current_queue_index)
            except Exception:
                pass
        return len(self.queue)

    def remove_from_queue(self, index: int) -> bool:
        """Removes a game from the queue by index."""
        if 0 <= index < len(self.queue):
            was_running = (index == self.current_queue_index and self.is_running)
            self.queue.pop(index)
            if self.current_queue_index >= len(self.queue):
                self.current_queue_index = len(self.queue) - 1
            if self.on_queue_update:
                try:
                    self.on_queue_update(self.queue, self.current_queue_index)
                except Exception:
                    pass
            if was_running:
                self.skip_to_next()
            return True
        return False

    def clear_queue(self):
        """Clears all games from the queue playlist."""
        if self.is_queue_mode and self.is_running:
            self.stop()
        self.queue.clear()
        self.current_queue_index = -1
        self.is_queue_mode = False
        if self.on_queue_update:
            try:
                self.on_queue_update(self.queue, -1)
            except Exception:
                pass

    def start_queue(self) -> bool:
        """Starts executing the queue playlist from the first pending game."""
        if not self.queue:
            return False

        # Find first non-done game
        start_idx = 0
        for i, item in enumerate(self.queue):
            if item["status"] != "done":
                start_idx = i
                break
        else:
            # If all are done, reset all to pending to restart
            for item in self.queue:
                item["status"] = "pending"
            start_idx = 0

        self.is_queue_mode = True
        self.current_queue_index = start_idx
        self.queue[start_idx]["status"] = "running"
        target_game = self.queue[start_idx]["game"]

        if self.on_queue_update:
            try:
                self.on_queue_update(self.queue, self.current_queue_index)
            except Exception:
                pass

        if self.on_game_switched:
            try:
                self.on_game_switched(target_game)
            except Exception:
                pass

        return self.start(target_game, from_queue=True)

    def skip_to_next(self):
        """Immediately skips the current game and advances to the next in queue."""
        if self.is_queue_mode and self.is_running:
            self._advance_queue()

    def _advance_queue(self):
        """Automatically called when a game's quest timer completes or when skipped."""
        # 1. Mark current as done
        if 0 <= self.current_queue_index < len(self.queue):
            self.queue[self.current_queue_index]["status"] = "done"

        # 2. Terminate current process and cleanup runtime file
        self._cleanup_process()

        # 3. Search for next pending game
        next_idx = self.current_queue_index + 1
        while next_idx < len(self.queue) and self.queue[next_idx]["status"] == "done":
            next_idx += 1

        if next_idx < len(self.queue):
            self.current_queue_index = next_idx
            self.queue[next_idx]["status"] = "running"
            next_game = self.queue[next_idx]["game"]

            if self.on_queue_update:
                try:
                    self.on_queue_update(self.queue, self.current_queue_index)
                except Exception:
                    pass

            # Notify UI to sync Discord Rich Presence (SET_ACTIVITY)
            if self.on_game_switched:
                try:
                    self.on_game_switched(next_game)
                except Exception:
                    pass

            # Launch next game
            self.start(next_game, from_queue=True)
        else:
            # All games in queue completed!
            self.is_queue_mode = False
            self.is_running = False
            self.current_queue_index = -1
            if self.on_queue_update:
                try:
                    self.on_queue_update(self.queue, -1)
                except Exception:
                    pass
            if self.on_queue_completed:
                try:
                    self.on_queue_completed()
                except Exception:
                    pass
            if self.on_status_change:
                self.on_status_change("🎉 All queued quests completed! Ready to claim rewards in Discord.", False, None)

    # =========================================================================
    # PROCESS LIFECYCLE
    # =========================================================================
    def start(self, game_info: Dict[str, Any], custom_exe_name: Optional[str] = None, from_queue: bool = False) -> bool:
        if self.is_running:
            self._cleanup_process()

        if not from_queue:
            self.is_queue_mode = False

        self._ensure_template()
        if not os.path.exists(TEMPLATE_EXE):
            if self.on_status_change:
                self.on_status_change("Error: Template executable missing.", False, None)
            return False

        # Support subdirectories (e.g. 'once human/once_human.exe', 'win64/marvel.exe')
        raw_exe = (custom_exe_name or game_info.get("exe", "game.exe")).strip().replace("\\", "/")
        if "/" in raw_exe:
            sub_dir, file_name = raw_exe.rsplit("/", 1)
        else:
            sub_dir, file_name = "", raw_exe

        if not file_name.lower().endswith(".exe"):
            file_name += ".exe"

        game_title = game_info.get("name", file_name)

        try:
            self.spawned_files = []
            self.spawned_dirs = []

            if sub_dir:
                target_dir = os.path.join(RUN_DIR, sub_dir.replace("/", os.sep))
                os.makedirs(target_dir, exist_ok=True)
                target_exe_path = os.path.join(target_dir, file_name)
                self.spawned_dirs.append(target_dir)

                # Also place flat copy in root RUN_DIR as fallback
                flat_copy = os.path.join(RUN_DIR, file_name)
                try:
                    shutil.copyfile(TEMPLATE_EXE, flat_copy)
                    self.spawned_files.append(flat_copy)
                except Exception:
                    pass
            else:
                target_dir = RUN_DIR
                target_exe_path = os.path.join(RUN_DIR, file_name)

            shutil.copyfile(TEMPLATE_EXE, target_exe_path)
            self.spawned_files.append(target_exe_path)

            # Spawn native Win32 game process with window for Discord process & window detection
            self.current_process = subprocess.Popen([target_exe_path, game_title, file_name], cwd=target_dir)
            self.current_game = game_info
            self.current_exe_path = target_exe_path
            self.start_time = time.time()
            self.is_running = True

            if self.on_status_change:
                prefix = f"[Queue {self.current_queue_index + 1}/{len(self.queue)}] " if self.is_queue_mode else ""
                disp_name = f"{sub_dir}/{file_name}" if sub_dir else file_name
                self.on_status_change(f"{prefix}Running '{game_title}' ({disp_name})", True, game_title)

            self._tick_token += 1
            if self._stop_event:
                self._stop_event.set()
            self._stop_event = threading.Event()
            token = self._tick_token

            # Start tick loop
            self._monitor_thread = threading.Thread(target=self._tick_loop, args=(token, self._stop_event), daemon=True)
            self._monitor_thread.start()
            return True
        except Exception as e:
            if self.on_status_change:
                self.on_status_change(f"Failed to launch game spoofer: {e}", False, None)
            return False

    def _cleanup_process(self):
        """Terminates the current dummy game process and removes the temporary executable and subdirectories."""
        self._tick_token += 1
        if self._stop_event:
            self._stop_event.set()

        if self.current_process:
            try:
                self.current_process.terminate()
                self.current_process.wait(timeout=1.0)
            except Exception:
                try:
                    self.current_process.kill()
                except Exception:
                    pass
            self.current_process = None

        time.sleep(0.2)
        for f_path in list(self.spawned_files):
            if f_path and os.path.exists(f_path):
                try:
                    os.remove(f_path)
                except Exception:
                    pass
        self.spawned_files.clear()
        self.current_exe_path = None

        for d_path in list(self.spawned_dirs):
            if d_path and os.path.exists(d_path) and os.path.abspath(d_path) != os.path.abspath(RUN_DIR):
                try:
                    os.rmdir(d_path)
                except Exception:
                    pass
        self.spawned_dirs.clear()

    def stop(self):
        """Halts the spoofer and resets queue status."""
        self.is_running = False
        self.is_queue_mode = False
        if 0 <= self.current_queue_index < len(self.queue):
            if self.queue[self.current_queue_index]["status"] == "running":
                self.queue[self.current_queue_index]["status"] = "pending"
        self._cleanup_process()
        self.current_game = None
        if self.on_queue_update:
            try:
                self.on_queue_update(self.queue, self.current_queue_index)
            except Exception:
                pass
        if self.on_status_change:
            self.on_status_change("Quest Game Stopped.", False, None)

    def _tick_loop(self, token: int, stop_event: threading.Event):
        while self.is_running and self.current_process and self._tick_token == token:
            if self.current_process.poll() is not None:
                # Process died unexpectedly
                break

            elapsed = int(time.time() - self.start_time)
            if self.on_tick:
                try:
                    self.on_tick(elapsed, self.target_seconds)
                except Exception:
                    pass

            # Duration reached!
            if elapsed >= self.target_seconds:
                if self.is_queue_mode:
                    # Auto-advance to the next game in the queue!
                    self._advance_queue()
                    return
                else:
                    # Single game finished
                    if self.on_status_change:
                        self.on_status_change(
                            f"✅ {int(self.target_seconds/60)}m Quest Complete for '{self.current_game.get('name', 'Game')}'! Claim reward in Discord.",
                            True,
                            self.current_game.get("name")
                        )
                    break

            if stop_event.wait(1.0):
                break

        if self.is_running and not self.is_queue_mode and self._tick_token == token:
            self.stop()
