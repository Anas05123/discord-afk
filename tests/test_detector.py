import unittest
from core.detector import ProcessDetector

class TestProcessDetector(unittest.TestCase):
    def test_detector_rules(self):
        rules = [
            {"process": "Code.exe", "preset": "vscode", "label": "Visual Studio Code"},
            {"process": "devenv.exe", "preset": "coding", "label": "Visual Studio"}
        ]
        called = []
        def on_change(rule, state, meta):
            called.append((rule, state))

        detector = ProcessDetector(detect_rules=rules, on_state_change=on_change)
        self.assertTrue(detector.is_enabled())
        self.assertEqual(len(detector.detect_rules), 2)

        detector.set_enabled(False)
        self.assertFalse(detector.is_enabled())

if __name__ == "__main__":
    unittest.main()
