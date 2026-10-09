import sys
import os

# Ensure local modules are accessible
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.config_manager import ConfigManager
from gui.main_window import MainWindow

def main():
    config_mgr = ConfigManager()
    app = MainWindow(config_mgr)
    try:
        app.mainloop()
    except KeyboardInterrupt:
        app._safe_exit()

if __name__ == "__main__":
    main()
