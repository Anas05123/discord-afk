import os
import unittest
import tempfile
import json
from core.config_manager import ConfigManager, DEFAULT_PRESETS

class TestConfigManager(unittest.TestCase):
    def setUp(self):
        self.temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".json")
        self.temp_file.close()

    def tearDown(self):
        if os.path.exists(self.temp_file.name):
            os.remove(self.temp_file.name)

    def test_default_config_creation(self):
        mgr = ConfigManager(config_path=self.temp_file.name)
        self.assertIn("active_preset", mgr.config)
        self.assertIn("vscode", mgr.config.get("presets", {}))
        self.assertTrue(mgr.get("auto_detect_enabled"))

    def test_get_preset(self):
        mgr = ConfigManager(config_path=self.temp_file.name)
        preset = mgr.get_preset("vscode")
        self.assertEqual(preset.get("name"), "Visual Studio Code")
        self.assertEqual(preset.get("client_id"), "810516608442695700")

    def test_save_and_reload(self):
        mgr = ConfigManager(config_path=self.temp_file.name)
        mgr.set("custom_test_key", 12345)
        
        mgr2 = ConfigManager(config_path=self.temp_file.name)
        self.assertEqual(mgr2.get("custom_test_key"), 12345)

if __name__ == "__main__":
    unittest.main()
