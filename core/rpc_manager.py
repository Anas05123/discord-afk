import time
from typing import Optional, List, Dict, Any, Callable
from pypresence import Presence, DiscordNotFound, DiscordError, PipeClosed

class RPCManager:
    """
    Manages Discord Rich Presence via official IPC socket using pypresence.
    Handles connecting, updating activity, switching application IDs, and graceful disconnection.
    """
    def __init__(self, status_callback: Optional[Callable[[str, bool], None]] = None):
        self.rpc: Optional[Presence] = None
        self.current_client_id: Optional[str] = None
        self.is_connected: bool = False
        self.start_time: float = time.time()
        self.status_callback = status_callback
        self.last_payload: Dict[str, Any] = {}

    def _notify_status(self, message: str, is_active: bool):
        if self.status_callback:
            try:
                self.status_callback(message, is_active)
            except Exception:
                pass

    def connect(self, client_id: str) -> bool:
        """Connects or switches to the specified Discord Client ID."""
        client_id = str(client_id).strip()
        if not client_id:
            self._notify_status("Error: Client ID is empty", False)
            return False

        # If already connected with same client_id, keep it
        if self.is_connected and self.rpc and self.current_client_id == client_id:
            return True

        # Close existing connection if switching IDs
        self.disconnect()

        try:
            self.rpc = Presence(client_id)
            self.rpc.connect()
            self.current_client_id = client_id
            self.is_connected = True
            self._notify_status(f"Connected to Discord (App: {client_id})", True)
            return True
        except DiscordNotFound:
            self.is_connected = False
            self.rpc = None
            self._notify_status("Discord is not running. Please open Discord first.", False)
            return False
        except (DiscordError, PipeClosed, Exception) as e:
            self.is_connected = False
            self.rpc = None
            err_msg = str(e)
            if "4000" in err_msg or "Invalid" in err_msg:
                self._notify_status("Error: Client ID is invalid on Discord. Click 'VS Code' or enter a valid App ID.", False)
            else:
                self._notify_status(f"Connection error: {err_msg}", False)
            return False

    def update_presence(
        self,
        client_id: str,
        details: Optional[str] = None,
        state: Optional[str] = None,
        large_image: Optional[str] = None,
        large_text: Optional[str] = None,
        small_image: Optional[str] = None,
        small_text: Optional[str] = None,
        show_timer: bool = True,
        buttons: Optional[List[Dict[str, str]]] = None
    ) -> bool:
        """Updates the active Rich Presence in Discord."""
        if not self.connect(client_id):
            return False

        payload: Dict[str, Any] = {}

        if details and len(details.strip()) >= 2:
            payload["details"] = details.strip()[:128]

        if state and len(state.strip()) >= 2:
            payload["state"] = state.strip()[:128]

        if large_image and large_image.strip():
            payload["large_image"] = large_image.strip()
            if large_text and large_text.strip():
                payload["large_text"] = large_text.strip()[:128]

        if small_image and small_image.strip():
            payload["small_image"] = small_image.strip()
            if small_text and small_text.strip():
                payload["small_text"] = small_text.strip()[:128]

        if show_timer:
            payload["start"] = int(self.start_time)

        # Validate and format buttons
        valid_buttons = []
        if buttons:
            for b in buttons:
                label = b.get("label", "").strip()[:32]
                url = b.get("url", "").strip()
                if label and url.startswith(("http://", "https://")):
                    valid_buttons.append({"label": label, "url": url})
                if len(valid_buttons) == 2:
                    break
        if valid_buttons:
            payload["buttons"] = valid_buttons

        self.last_payload = payload

        try:
            self.rpc.update(**payload)
            self._notify_status("Rich Presence active & updated!", True)
            return True
        except (PipeClosed, DiscordError) as e:
            self.is_connected = False
            self.rpc = None
            self.current_client_id = None
            self._notify_status(f"Lost connection to Discord: {e}", False)
            return False
        except Exception as e:
            self._notify_status(f"Failed to update presence: {e}", False)
            return False

    def clear(self) -> None:
        """Clears the active presence without closing the pipe."""
        if self.is_connected and self.rpc:
            try:
                self.rpc.clear()
                self._notify_status("Presence cleared", False)
            except Exception:
                pass

    def disconnect(self) -> None:
        """Safely disconnects from Discord IPC."""
        if self.rpc:
            try:
                self.rpc.close()
            except Exception:
                pass
        self.rpc = None
        self.is_connected = False
        self.current_client_id = None
        self._notify_status("Disconnected from Discord", False)

    def reset_timer(self) -> None:
        """Resets timer to natural mode (starting right now at 00:00)."""
        self.start_time = time.time()

    def set_elapsed_time(self, hours: float = 0, minutes: float = 0, seconds: float = 0) -> None:
        """Sets the timer so Discord displays the chosen time already elapsed and continues counting naturally."""
        total_offset = max(0.0, (float(hours) * 3600.0) + (float(minutes) * 60.0) + float(seconds))
        self.start_time = time.time() - total_offset

