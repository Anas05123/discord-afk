import threading
from typing import Callable, Optional
from PIL import Image, ImageDraw
import pystray

def create_default_icon_image() -> Image.Image:
    """Generates a stylish 64x64 Discord Blurple tray icon."""
    size = (64, 64)
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    # Discord blurple background circle
    draw.ellipse((4, 4, 60, 60), fill=(88, 101, 242))
    # Inner white circle/gamepad accent
    draw.ellipse((18, 18, 46, 46), fill=(255, 255, 255))
    # Status green dot in corner
    draw.ellipse((42, 42, 60, 60), fill=(35, 165, 90))
    return image

class SystemTrayManager:
    """
    Manages the Windows System Tray icon using pystray.
    Runs asynchronously and dispatches actions back to the main UI.
    """
    def __init__(
        self,
        on_show: Callable[[], None],
        on_toggle_auto: Callable[[], bool],
        on_clear: Callable[[], None],
        on_exit: Callable[[], None]
    ):
        self.on_show = on_show
        self.on_toggle_auto = on_toggle_auto
        self.on_clear = on_clear
        self.on_exit = on_exit
        self.icon: Optional[pystray.Icon] = None
        self._auto_detect_state = True

    def update_auto_detect_state(self, state: bool) -> None:
        self._auto_detect_state = state
        if self.icon:
            self.icon.update_menu()

    def start(self) -> None:
        icon_image = create_default_icon_image()
        
        def _get_auto_text(item):
            return f"Auto-Detect: {'[ON]' if self._auto_detect_state else '[OFF]'}"

        def _action_show(icon, item):
            self.on_show()

        def _action_toggle(icon, item):
            new_state = self.on_toggle_auto()
            self._auto_detect_state = new_state
            icon.update_menu()

        def _action_clear(icon, item):
            self.on_clear()

        def _action_exit(icon, item):
            icon.stop()
            self.on_exit()

        menu = pystray.Menu(
            pystray.MenuItem("Open Dashboard", _action_show, default=True),
            pystray.MenuItem(_get_auto_text, _action_toggle),
            pystray.MenuItem("Clear Activity", _action_clear),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Exit", _action_exit)
        )

        self.icon = pystray.Icon("DiscordActivityApp", icon_image, "Discord Activity Manager", menu)
        self.icon.run_detached()

    def stop(self) -> None:
        if self.icon:
            try:
                self.icon.stop()
            except Exception:
                pass
            self.icon = None
