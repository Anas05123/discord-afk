import requests
from typing import List, Dict, Any, Optional

VERIFIED_PRESETS = [
    {
        "key": "gta6",
        "name": "Grand Theft Auto VI",
        "category": "Gaming and Open World",
        "client_id": "1445160676522856458",
        "details": "Exploring Vice City",
        "state": "Free Roam (Jason and Lucia)",
        "large_image": "",
        "large_text": "Grand Theft Auto VI",
        "small_image": "",
        "small_text": "Rockstar Games",
        "icon": "🌴"
    },
    {
        "key": "vscode",
        "name": "Visual Studio Code",
        "category": "Development",
        "client_id": "810516608442695700",
        "details": "Editing SyntaFlow",
        "state": "Working Editing SyntaFlow Integrations",
        "large_image": "vscode",
        "large_text": "Visual Studio Code",
        "small_image": "",
        "small_text": "",
        "icon": "💻"
    },
    {
        "key": "photoshop",
        "name": "Adobe Photoshop",
        "category": "Creative & Design",
        "client_id": "748586506888806460",
        "details": "Editing Creative_Artwork.psd",
        "state": "Workspace: Retouching & Layer Compositing",
        "large_image": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PHXS.png",
        "large_text": "Adobe Photoshop 2026",
        "small_image": "https://cdn-icons-png.flaticon.com/512/5968/5968520.png",
        "small_text": "Creative Cloud",
        "icon": "🎨"
    },
    {
        "key": "illustrator",
        "name": "Adobe Illustrator",
        "category": "Creative & Design",
        "client_id": "751430009716998144",
        "details": "Designing Brand_Identity.ai",
        "state": "Vector Artboards & Pen Tool",
        "large_image": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/ILST.png",
        "large_text": "Adobe Illustrator 2026",
        "small_image": "https://cdn-icons-png.flaticon.com/512/5968/5968472.png",
        "small_text": "Vector Engine",
        "icon": "✒️"
    },
    {
        "key": "aftereffects",
        "name": "Adobe After Effects",
        "category": "Creative & Design",
        "client_id": "748568089939148832",
        "details": "Compositing Motion_VFX.aep",
        "state": "Timeline: 3D Camera & Keyframes",
        "large_image": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/AEFT.png",
        "large_text": "Adobe After Effects 2026",
        "small_image": "",
        "small_text": "Motion Graphics",
        "icon": "✨"
    },
    {
        "key": "premiere",
        "name": "Adobe Premiere Pro",
        "category": "Creative & Design",
        "client_id": "748580494324662353",
        "details": "Editing Master_Timeline.prproj",
        "state": "Color Grading & Audio Mastering",
        "large_image": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PPRO.png",
        "large_text": "Adobe Premiere Pro 2026",
        "small_image": "",
        "small_text": "4K 60fps Timeline",
        "icon": "🎬"
    },
    {
        "key": "figma",
        "name": "Figma",
        "category": "Creative & Design",
        "client_id": "751430009716998144",
        "details": "Designing UI_Design_System.fig",
        "state": "Auto-Layout & Interactive Prototype",
        "large_image": "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
        "large_text": "Figma UI/UX",
        "small_image": "",
        "small_text": "UI/UX Studio",
        "icon": "📐"
    },
    {
        "key": "valorant",
        "name": "VALORANT",
        "category": "Gaming",
        "client_id": "700136079562375258",
        "details": "Competitive: Radiant Ranked",
        "state": "In Match: Haven (12 - 11)",
        "large_image": "https://cdn-icons-png.flaticon.com/512/686/686589.png",
        "large_text": "VALORANT",
        "small_image": "https://cdn-icons-png.flaticon.com/512/1055/1055672.png",
        "small_text": "Match Point",
        "icon": "🎯"
    },
    {
        "key": "fortnite",
        "name": "Fortnite",
        "category": "Gaming",
        "client_id": "432980957394370572",
        "details": "Battle Royale: Zero Build",
        "state": "Victory Royale! 👑",
        "large_image": "https://cdn-icons-png.flaticon.com/512/588/588395.png",
        "large_text": "Fortnite",
        "small_image": "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
        "small_text": "1st Place",
        "icon": "🪂"
    },
    {
        "key": "roblox",
        "name": "ROBLOX",
        "category": "Gaming",
        "client_id": "363445589247131668",
        "details": "Playing with friends",
        "state": "Server: Custom Realm",
        "large_image": "https://cdn-icons-png.flaticon.com/512/1055/1055666.png",
        "large_text": "ROBLOX",
        "small_image": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
        "small_text": "Online",
        "icon": "🧱"
    },
    {
        "key": "genshin",
        "name": "Genshin Impact",
        "category": "Gaming",
        "client_id": "762434991303950386",
        "details": "Exploring Teyvat",
        "state": "Spiral Abyss: Floor 12",
        "large_image": "https://cdn-icons-png.flaticon.com/512/3074/3074767.png",
        "large_text": "Genshin Impact",
        "small_image": "https://cdn-icons-png.flaticon.com/512/2997/2997295.png",
        "small_text": "Adventure Rank 60",
        "icon": "⚔️"
    },
    {
        "key": "overwatch",
        "name": "Overwatch",
        "category": "Gaming",
        "client_id": "356875221078245376",
        "details": "Role Queue: Grandmaster",
        "state": "Payload Escort",
        "large_image": "https://cdn-icons-png.flaticon.com/512/686/686589.png",
        "large_text": "Overwatch",
        "small_image": "https://cdn-icons-png.flaticon.com/512/1055/1055672.png",
        "small_text": "Competitive",
        "icon": "🛡️"
    },
    {
        "key": "chill",
        "name": "Lo-Fi Chill & Beats",
        "category": "Music & Chill",
        "client_id": "383226320970055681",
        "details": "Listening to Lo-Fi Vibes",
        "state": "Relaxing / AFK ☕",
        "large_image": "https://cdn-icons-png.flaticon.com/512/3074/3074767.png",
        "large_text": "Lo-Fi Coffee",
        "small_image": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
        "small_text": "Chill Session",
        "icon": "☕"
    },
    {
        "key": "studying",
        "name": "Deep Study & Focus",
        "category": "Productivity",
        "client_id": "383226320970055681",
        "details": "Preparing for Exams 📚",
        "state": "Do Not Disturb / Pomodoro",
        "large_image": "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
        "large_text": "Deep Study",
        "small_image": "https://cdn-icons-png.flaticon.com/512/2997/2997295.png",
        "small_text": "Pomodoro Focus",
        "icon": "📚"
    }
]

CURATED_GAMES: List[Dict[str, Any]] = [
    {
        "id": "1445160676522856458",
        "name": "Grand Theft Auto VI",
        "exe": "gta6.exe",
        "category": "Rockstar Games Next-Gen Open World",
        "icon": "https://cdn.discordapp.com/app-icons/1445160676522856458/251322eb2a778edc62ecce8d791e3701.png",
        "keywords": ["gta", "gta6", "gta vi", "grand theft auto", "grand theft auto vi", "vice city", "rockstar"]
    },
    {
        "id": "1470616226995765409",
        "name": "Neverness to Everness",
        "exe": "htgame.exe",
        "category": "Anime Open-World RPG",
        "icon": "https://cdn.discordapp.com/app-icons/1470616226995765409/e9a6d14e304637d878c04f35251eaf7d.png",
        "keywords": ["nte", "neverness to ever", "neverness to everness", "hotta", "htgame"]
    },
    {
        "id": "1428223713928810496",
        "name": "March of Giants",
        "exe": "thelineclient-win64-shipping.exe",
        "category": "Discord Game Database",
        "icon": "https://cdn.discordapp.com/app-icons/1428223713928810496/475baeffb337fe92410d00a2fd4e4d04.png",
        "keywords": ["giants", "march of giants", "thelineclient"]
    },
    {
        "id": "1552168352116641822",
        "name": "Clive Barker's Hellraiser: Revival",
        "exe": "hellraiser-win64-shipping.exe",
        "category": "Horror Survival",
        "icon": "https://cdn.discordapp.com/app-icons/1552168352116641822/303c6f901a9433229d09f940d9338bef.png",
        "keywords": ["hellraiser", "hellraiser: revival", "clive barker"]
    },
    {
        "id": "1198592398579482654",
        "name": "HELLDIVERS 2",
        "exe": "helldivers2.exe",
        "category": "Action Shooter",
        "icon": "https://cdn.discordapp.com/app-icons/1198592398579482654/53ca5932587033cb79e72aa5c093cf1a.png",
        "keywords": ["helldivers", "helldivers 2", "arrowhead"]
    },
    {
        "id": "748586506888806460",
        "name": "Adobe Photoshop",
        "exe": "Photoshop.exe",
        "category": "Creative & Design",
        "icon": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PHXS.png",
        "keywords": ["photoshop", "adobe photoshop", "ps", "psd", "design"]
    },
    {
        "id": "751430009716998144",
        "name": "Adobe Illustrator",
        "exe": "Illustrator.exe",
        "category": "Creative & Design",
        "icon": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/ILST.png",
        "keywords": ["illustrator", "adobe illustrator", "ai", "vector", "design"]
    },
    {
        "id": "748568089939148832",
        "name": "Adobe After Effects",
        "exe": "AfterFX.exe",
        "category": "Creative & Design",
        "icon": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/AEFT.png",
        "keywords": ["after effects", "adobe after effects", "ae", "afterfx", "motion"]
    },
    {
        "id": "748580494324662353",
        "name": "Adobe Premiere Pro",
        "exe": "Adobe Premiere Pro.exe",
        "category": "Creative & Design",
        "icon": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PPRO.png",
        "keywords": ["premiere", "premiere pro", "adobe premiere", "video editing"]
    },
    {
        "id": "751430009716998144",
        "name": "Figma",
        "exe": "Figma.exe",
        "category": "Creative & Design",
        "icon": "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
        "keywords": ["figma", "ui", "ux", "prototype", "design"]
    }
]

class GamesDatabase:
    _cache: Optional[List[Dict[str, Any]]] = None

    @classmethod
    def get_presets(cls) -> List[Dict[str, Any]]:
        return VERIFIED_PRESETS

    @classmethod
    def _extract_primary_exe(cls, game_obj: Dict[str, Any]) -> str:
        name = game_obj.get("name", "game")
        executables = game_obj.get("executables", [])
        win_exes = [e.get("name", "") for e in executables if e.get("os") in [None, "win32"]]
        candidates = win_exes if win_exes else [e.get("name", "") for e in executables]
        for c in candidates:
            if not c:
                continue
            cleaned = c.replace("\\", "/").split("/")[-1].strip()
            if cleaned.lower().endswith(".exe"):
                return cleaned
        clean_name = "".join(ch for ch in name.lower() if ch.isalnum())
        return f"{clean_name}.exe" if clean_name else "game.exe"

    @classmethod
    def search_discord_games(cls, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Searches Discord's official database of 24,000+ registered games with executable auto-detection."""
        query_str = query.strip().lower()
        if not query_str:
            return []

        matched: List[Dict[str, Any]] = []
        seen_names = set()
        seen_ids = set()

        # 1. Check curated user games & creative tools
        for cg in CURATED_GAMES:
            all_kw = cg.get("keywords", []) + [cg["name"].lower(), cg["exe"].lower()]
            if any(query_str in kw for kw in all_kw):
                matched.append({
                    "id": cg["id"],
                    "name": cg["name"],
                    "exe": cg["exe"],
                    "category": cg["category"],
                    "icon": cg.get("icon", "🎮")
                })
                seen_names.add(cg["name"].lower())
                seen_ids.add(cg["id"])

        # 2. Check local verified presets
        for p in VERIFIED_PRESETS:
            cid = p.get("client_id")
            p_name_lower = p["name"].lower()
            if p_name_lower not in seen_names and (
                query_str in p_name_lower
                or query_str in p.get("key", "").lower()
                or query_str in p.get("category", "").lower()
            ):
                matched.append({
                    "id": cid,
                    "name": p["name"],
                    "exe": f"{p['name'].lower().replace(' ', '')}.exe",
                    "category": p["category"],
                    "icon": p.get("icon", "🎮")
                })
                seen_names.add(p_name_lower)
                seen_ids.add(cid)

        # 3. Load Discord detectable cache
        if cls._cache is None:
            try:
                resp = requests.get("https://discord.com/api/v10/applications/detectable", timeout=5)
                if resp.status_code == 200:
                    cls._cache = resp.json()
                else:
                    cls._cache = []
            except Exception:
                cls._cache = []

        # 4. Search detectable cache by name and executables
        for g in cls._cache:
            cid = g.get("id")
            if cid in seen_ids:
                continue

            name = g.get("name", "")
            executables = [e.get("name", "").lower() for e in g.get("executables", [])]
            name_lower = name.lower()

            if query_str in name_lower or any(query_str in exe for exe in executables):
                primary_exe = cls._extract_primary_exe(g)
                icon_hash = g.get("icon_hash") or g.get("icon")
                icon_url = f"https://cdn.discordapp.com/app-icons/{cid}/{icon_hash}.png" if icon_hash else "🎮"
                matched.append({
                    "id": cid,
                    "name": name,
                    "exe": primary_exe,
                    "category": "Discord Catalog",
                    "icon": icon_url
                })
                seen_ids.add(cid)

            if len(matched) >= limit:
                break

        return matched

    @classmethod
    def resolve_game(cls, query_or_exe: str) -> Dict[str, Any]:
        """Resolves any game query or executable to a complete game profile (name, exe, client_id, icon)."""
        raw = query_or_exe.strip()
        if not raw:
            return {
                "id": "1000000000000000001",
                "name": "Custom Game",
                "exe": "game.exe",
                "category": "Custom",
                "icon": "🎮"
            }

        # Check search results
        results = cls.search_discord_games(raw, limit=1)
        if results:
            return results[0]

        # Fallback custom profile
        clean_exe = raw if raw.lower().endswith(".exe") else f"{raw.lower().replace(' ', '')}.exe"
        game_title = raw.replace(".exe", "").capitalize()
        return {
            "id": "1000000000000000001",
            "name": game_title,
            "exe": clean_exe,
            "category": "Custom Game",
            "icon": "🎮"
        }

