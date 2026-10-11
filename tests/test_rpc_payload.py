import unittest
from core.rpc_manager import RPCManager

class TestRPCPayload(unittest.TestCase):
    def test_rpc_manager_initial_state(self):
        rpc = RPCManager()
        self.assertFalse(rpc.is_connected)
        self.assertIsNone(rpc.current_client_id)

    def test_connect_empty_id(self):
        rpc = RPCManager()
        res = rpc.connect("")
        self.assertFalse(res)

    def test_status_callback(self):
        statuses = []
        def callback(msg, active):
            statuses.append((msg, active))

        rpc = RPCManager(status_callback=callback)
        rpc.connect("   ")
        self.assertTrue(len(statuses) > 0)
        self.assertFalse(statuses[0][1])

    def test_custom_and_natural_timer(self):
        import time
        rpc = RPCManager()
        # Set 2 hours and 30 minutes elapsed (9000 seconds)
        rpc.set_elapsed_time(hours=2, minutes=30)
        elapsed = time.time() - rpc.start_time
        self.assertAlmostEqual(elapsed, 9000, delta=2)

        # Reset back to natural (00:00)
        rpc.reset_timer()
        elapsed_after_reset = time.time() - rpc.start_time
        self.assertAlmostEqual(elapsed_after_reset, 0, delta=2)

if __name__ == "__main__":
    unittest.main()

