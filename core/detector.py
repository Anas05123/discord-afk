import time
import threading
from typing import Callable, Optional, Dict, Any, List
import psutil

class ProcessDetector:
    """
    Monitors running processes (e.g., Code.exe for Visual Studio Code)
    and triggers callbacks when matching applications start or stop.
    """
    def __init__(
        self,
        detect_rules: List[Dict[str, Any]],
        on_state_change: Callable[[Optional[Dict[str, Any]], bool, Dict[str, Any]], None],
        check_interval: float = 3.0
    ):
        self.detect_rules = detect_rules
        self.on_state_change = on_state_change
        self.check_interval = check_interval
        self._is_running = False
        self._thread: Optional[threading.Thread] = None
        self._current_detected_rule: Optional[Dict[str, Any]] = None
        self._enabled = True

    def set_rules(self, rules: List[Dict[str, Any]]) -> None:
        self.detect_rules = rules

    def set_enabled(self, enabled: bool) -> None:
        self._enabled = enabled
        if not enabled and self._current_detected_rule:
            self._current_detected_rule = None
            self.on_state_change(None, False, {})

    def is_enabled(self) -> bool:
        return self._enabled

    def start(self) -> None:
        if self._is_running:
            return
        self._is_running = True
        self._thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._is_running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=1.0)
        self._thread = None

    def _inspect_vscode_details(self, proc: psutil.Process) -> Dict[str, Any]:
        """Attempts to extract workspace, open file, and language from VS Code process."""
        metadata = {"workspace": "SyntaFlow Integrations", "file": "SyntaFlow", "detected_lang": "none"}
        ext_map = {
            ".tsx": "react", ".jsx": "react",
            ".ts": "typescript", ".js": "javascript",
            ".py": "python", ".rs": "rust",
            ".cpp": "cpp", ".c": "cpp", ".h": "cpp",
            ".cs": "csharp", ".go": "go",
            ".java": "java", ".vue": "vue",
            ".html": "html_css", ".css": "html_css"
        }
        try:
            cmdline = proc.cmdline()
            for arg in cmdline:
                if "\\" in arg or "/" in arg:
                    parts = arg.replace("\\", "/").rstrip("/").split("/")
                    if len(parts) > 1 and not parts[-1].endswith(".exe") and not parts[-1].startswith("--"):
                        candidate = parts[-1]
                        if "." in candidate and not candidate.startswith("."):
                            metadata["file"] = candidate
                            ext = "." + candidate.split(".")[-1].lower()
                            if ext in ext_map:
                                metadata["detected_lang"] = ext_map[ext]
                        else:
                            metadata["workspace"] = candidate
        except (psutil.AccessDenied, psutil.NoSuchProcess, Exception):
            pass
        return metadata

    def _inspect_design_details(self, proc: psutil.Process, preset_key: str) -> Dict[str, Any]:
        """Extracts active design project file (.psd, .ai, .aep, .prproj, .fig) from creative process."""
        defaults = {
            "photoshop": {"file": "Creative_Artwork.psd", "workspace": "Retouching & Layer Compositing", "detected_lang": "photoshop"},
            "illustrator": {"file": "Brand_Identity.ai", "workspace": "Vector Artboards & Pen Tool", "detected_lang": "illustrator"},
            "aftereffects": {"file": "Motion_VFX.aep", "workspace": "3D Camera & Keyframes", "detected_lang": "aftereffects"},
            "premiere": {"file": "Master_Timeline.prproj", "workspace": "Color Grading & Audio Mastering", "detected_lang": "premiere"},
            "figma": {"file": "UI_Design_System.fig", "workspace": "Auto-Layout & Interactive Prototype", "detected_lang": "figma"},
        }
        metadata = defaults.get(preset_key, {"file": "Design_Project", "workspace": "Creative Studio", "detected_lang": preset_key}).copy()
        design_exts = (".psd", ".psb", ".ai", ".eps", ".svg", ".aep", ".prproj", ".fig", ".png", ".jpg")
        try:
            for arg in proc.cmdline()[1:]:
                cleaned = arg.strip('"').replace("\\", "/")
                if cleaned.lower().endswith(design_exts):
                    metadata["file"] = cleaned.split("/")[-1]
                    break
        except (psutil.AccessDenied, psutil.NoSuchProcess, Exception):
            pass
        return metadata

    def _monitor_loop(self) -> None:
        while self._is_running:
            if not self._enabled:
                time.sleep(self.check_interval)
                continue

            detected_rule = None
            matched_metadata = {}

            try:
                for proc in psutil.process_iter(['name', 'exe']):
                    try:
                        p_name = proc.info.get('name')
                        if not p_name:
                            continue

                        p_name_lower = p_name.lower()
                        for rule in self.detect_rules:
                            target_proc = rule.get("process", "").lower()
                            if target_proc and (target_proc == p_name_lower or target_proc in p_name_lower):
                                detected_rule = rule
                                preset_key = rule.get("preset", "")
                                if "code.exe" in p_name_lower:
                                    matched_metadata = self._inspect_vscode_details(proc)
                                elif preset_key in ("photoshop", "illustrator", "aftereffects", "premiere", "figma"):
                                    matched_metadata = self._inspect_design_details(proc, preset_key)
                                break
                        if detected_rule:
                            break
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        continue
            except Exception:
                pass

            # Detect state transition
            if detected_rule and (self._current_detected_rule != detected_rule):
                self._current_detected_rule = detected_rule
                self.on_state_change(detected_rule, True, matched_metadata)
            elif not detected_rule and (self._current_detected_rule is not None):
                self._current_detected_rule = None
                self.on_state_change(None, False, {})

            time.sleep(self.check_interval)
