import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config_manager import ConfigManager
from gui.main_window import MainWindow

def test_ui():
    cm = ConfigManager()
    app = MainWindow(cm)
    app.update_idletasks()
    print("SUCCESS: UI loaded with pages:", list(app.pages.keys()))
    app._safe_exit()

if __name__ == "__main__":
    test_ui()
