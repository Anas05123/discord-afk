import json
import os
from typing import Dict, Any

DEFAULT_CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config.json")

# Default presets with verified Discord Application IDs and image assets
DEFAULT_PRESETS: Dict[str, Dict[str, Any]] = {
    "vscode": {
        "name": "Visual Studio Code",
        "client_id": "810516608442695700",  # Verified VS Code App ID with official icon
        "details": "Editing SyntaFlow",
        "state": "Working Editing SyntaFlow Integrations",
        "large_image": "vscode",
        "large_text": "Visual Studio Code",
        "small_image": "",
        "small_text": "",
        "show_timer": True,
        "buttons": [
            {"label": "SyntaFlow Project", "url": "https://github.com"}
        ]
    },
    "photoshop": {
        "name": "Adobe Photoshop",
        "client_id": "748586506888806460",
        "details": "Editing Creative_Artwork.psd",
        "state": "Workspace: Retouching & Layer Compositing",
        "large_image": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PHXS.png",
        "large_text": "Adobe Photoshop 2026",
        "small_image": "https://cdn-icons-png.flaticon.com/512/5968/5968520.png",
        "small_text": "Creative Cloud",
        "show_timer": True,
        "buttons": []
    },
    "illustrator": {
        "name": "Adobe Illustrator",
        "client_id": "751430009716998144",
        "details": "Designing Brand_Identity.ai",
        "state": "Vector Artboards & Pen Tool",
        "large_image": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/ILST.png",
        "large_text": "Adobe Illustrator 2026",
        "small_image": "https://cdn-icons-png.flaticon.com/512/5968/5968472.png",
        "small_text": "Vector Engine",
        "show_timer": True,
        "buttons": []
    },
    "aftereffects": {
        "name": "Adobe After Effects",
        "client_id": "748568089939148832",
        "details": "Compositing Motion_VFX.aep",
        "state": "Timeline: 3D Camera & Keyframes",
        "large_image": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/AEFT.png",
        "large_text": "Adobe After Effects 2026",
        "small_image": "",
        "small_text": "Motion Graphics",
        "show_timer": True,
        "buttons": []
    },
    "premiere": {
        "name": "Adobe Premiere Pro",
        "client_id": "748580494324662353",
        "details": "Editing Master_Timeline.prproj",
        "state": "Color Grading & Audio Mastering",
        "large_image": "https://raw.githubusercontent.com/teeteeteeteetee/adobe-discord-rpc/master/src/assets/PPRO.png",
        "large_text": "Adobe Premiere Pro 2026",
        "small_image": "",
        "small_text": "4K 60fps Timeline",
        "show_timer": True,
        "buttons": []
    },
    "figma": {
        "name": "Figma",
        "client_id": "751430009716998144",
        "details": "Designing UI_Design_System.fig",
        "state": "Auto-Layout & Interactive Prototype",
        "large_image": "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
        "large_text": "Figma UI/UX",
        "small_image": "",
        "small_text": "UI/UX Studio",
        "show_timer": True,
        "buttons": []
    },
    "coding": {
        "name": "Programming & Development",
        "client_id": "383226320970055681",
        "details": "Building Next-Gen Software",
        "state": "In the Zone 💻",
        "large_image": "https://raw.githubusercontent.com/github/explore/main/topics/visual-studio-code/visual-studio-code.png",
        "large_text": "Coding Session",
        "small_image": "https://raw.githubusercontent.com/github/explore/main/topics/git/git.png",
        "small_text": "Git Master",
        "show_timer": True,
        "buttons": []
    },
    "gaming": {
        "name": "Gaming",
        "client_id": "383226320970055681",
        "details": "Competitive Ranked Match",
        "state": "Victory in Sight 🏆",
        "large_image": "https://cdn-icons-png.flaticon.com/512/686/686589.png",
        "large_text": "Gaming Mode",
        "small_image": "https://cdn-icons-png.flaticon.com/512/1055/1055672.png",
        "small_text": "Level 99",
        "show_timer": True,
        "buttons": []
    },
    "chill": {
        "name": "Chilling & Music",
        "client_id": "383226320970055681",
        "details": "Listening to Lo-Fi Beats",
        "state": "Relaxing / AFK ☕",
        "large_image": "https://cdn-icons-png.flaticon.com/512/3074/3074767.png",
        "large_text": "Lo-Fi Coffee",
        "small_image": "https://cdn-icons-png.flaticon.com/512/727/727245.png",
        "small_text": "Chill Vibes",
        "show_timer": True,
        "buttons": []
    },
    "studying": {
        "name": "Study / Deep Focus",
        "client_id": "383226320970055681",
        "details": "Preparing for Exams",
        "state": "Do Not Disturb 📚",
        "large_image": "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
        "large_text": "Deep Focus",
        "small_image": "https://cdn-icons-png.flaticon.com/512/2997/2997295.png",
        "small_text": "Pomodoro",
        "show_timer": True,
        "buttons": []
    }
}

DEFAULT_CONFIG: Dict[str, Any] = {
    "active_preset": "vscode",
    "auto_detect_enabled": True,
    "detect_rules": [
        {"process": "Photoshop.exe", "preset": "photoshop", "label": "Adobe Photoshop"},
        {"process": "Illustrator.exe", "preset": "illustrator", "label": "Adobe Illustrator"},
        {"process": "AfterFX.exe", "preset": "aftereffects", "label": "Adobe After Effects"},
        {"process": "Adobe Premiere Pro.exe", "preset": "premiere", "label": "Adobe Premiere Pro"},
        {"process": "Figma.exe", "preset": "figma", "label": "Figma"},
        {"process": "Code.exe", "preset": "vscode", "label": "Visual Studio Code"},
        {"process": "devenv.exe", "preset": "coding", "label": "Visual Studio"},
        {"process": "pycharm64.exe", "preset": "coding", "label": "PyCharm"}
    ],
    "current_activity": {
        "client_id": "810516608442695700",
        "details": "Editing SyntaFlow",
        "state": "Working Editing SyntaFlow Integrations",
        "large_image": "vscode",
        "large_text": "Visual Studio Code",
        "small_image": "",
        "small_text": "",
        "show_timer": True,
        "button1_label": "SyntaFlow Project",
        "button1_url": "https://github.com",
        "button2_label": "",
        "button2_url": ""
    },
    "presets": DEFAULT_PRESETS
}

class ConfigManager:
    def __init__(self, config_path: str = DEFAULT_CONFIG_PATH):
        self.config_path = config_path
        self.config = self.load_config()

    def load_config(self) -> Dict[str, Any]:
        if not os.path.exists(self.config_path):
            self.save_config(DEFAULT_CONFIG)
            return DEFAULT_CONFIG.copy()
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Ensure all default keys exist
                for k, v in DEFAULT_CONFIG.items():
                    if k not in data:
                        data[k] = v
                return data
        except Exception:
            return DEFAULT_CONFIG.copy()

    def save_config(self, config_data: Dict[str, Any] = None) -> None:
        if config_data is not None:
            self.config = config_data
        try:
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump(self.config, f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving config: {e}")

    def get(self, key: str, default: Any = None) -> Any:
        return self.config.get(key, default)

    def set(self, key: str, value: Any) -> None:
        self.config[key] = value
        self.save_config()

    def get_preset(self, preset_key: str) -> Dict[str, Any]:
        return self.config.get("presets", {}).get(preset_key, DEFAULT_PRESETS.get(preset_key, {}))
