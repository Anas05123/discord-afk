import unittest
import requests
import time
from cloud_afk.keep_alive import start_keep_alive

class TestKeepAlive(unittest.TestCase):
    def test_health_server(self):
        # Start server on high test port
        test_port = 18888
        server = start_keep_alive(port=test_port)
        time.sleep(0.5)

        try:
            resp = requests.get(f"http://127.0.0.1:{test_port}/", timeout=2)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data.get("status"), "online")
            self.assertIn("uptime_seconds", data)
        finally:
            server.shutdown()

if __name__ == "__main__":
    unittest.main()
