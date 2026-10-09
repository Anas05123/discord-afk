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

if __name__ == "__main__":
    unittest.main()
