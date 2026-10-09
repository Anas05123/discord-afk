import unittest
import time
import os
import psutil
from core.quest_spoofer import QuestSpoofer, QUEST_GAMES

class TestQuestSpoofer(unittest.TestCase):
    def test_quest_games_catalog(self):
        self.assertGreater(len(QUEST_GAMES), 5)
        game_ids = [g["id"] for g in QUEST_GAMES]
        self.assertIn("nte", game_ids)
        self.assertIn("giants", game_ids)
        self.assertIn("hellraiser", game_ids)
        for game in QUEST_GAMES:
            self.assertIn("name", game)
            self.assertIn("exe", game)
            self.assertTrue(game["exe"].endswith(".exe"))
            self.assertIn("client_id", game)

    def test_game_database_search_and_resolve(self):
        from core.games_db import GamesDatabase
        
        # Test searching for NTE
        nte_res = GamesDatabase.search_discord_games("nte")
        self.assertGreater(len(nte_res), 0)
        self.assertIn("htgame.exe", nte_res[0]["exe"].lower())

        # Test searching for Giants
        giants_res = GamesDatabase.search_discord_games("giants")
        self.assertGreater(len(giants_res), 0)
        self.assertTrue(any("giants" in g["name"].lower() for g in giants_res))

        # Test searching for Hellraiser
        hell_res = GamesDatabase.search_discord_games("hellraiser")
        self.assertGreater(len(hell_res), 0)
        self.assertIn("hellraiser", hell_res[0]["exe"].lower())

        # Test resolve_game helper
        resolved = GamesDatabase.resolve_game("nte")
        self.assertEqual(resolved["exe"], "htgame.exe")


    def test_quest_spoofer_lifecycle(self):
        statuses = []
        ticks = []

        def on_status(msg, running, name):
            statuses.append((msg, running, name))

        def on_tick(elapsed, target):
            ticks.append((elapsed, target))

        spoofer = QuestSpoofer(on_status_change=on_status, on_tick=on_tick)
        
        # Test launching a test spoof game
        test_game = {
            "name": "Test Quest Game",
            "exe": "testquestgame.exe",
            "client_id": "123456789"
        }
        started = spoofer.start(test_game)
        self.assertTrue(started)
        self.assertTrue(spoofer.is_running)
        self.assertIsNotNone(spoofer.current_process)

        # Verify process is actually registered in Windows process table
        pid = spoofer.current_process.pid
        self.assertTrue(psutil.pid_exists(pid))
        p = psutil.Process(pid)
        self.assertEqual(p.name().lower(), "testquestgame.exe")

        # Let it tick once
        time.sleep(1.2)
        self.assertGreaterEqual(len(ticks), 1)

        # Stop
        spoofer.stop()
        self.assertFalse(spoofer.is_running)
        time.sleep(0.5)

        # Verify process terminated
        self.assertFalse(psutil.pid_exists(pid))

    def test_quest_queue_lifecycle(self):
        switched_games = []
        queue_updates = []
        queue_completed = []

        def on_switch(g):
            switched_games.append(g)

        def on_qupdate(q, idx):
            queue_updates.append((len(q), idx))

        def on_done():
            queue_completed.append(True)

        spoofer = QuestSpoofer(
            on_game_switched=on_switch,
            on_queue_update=on_qupdate,
            on_queue_completed=on_done
        )

        game1 = {"name": "Test Game 1", "exe": "testgame1.exe", "client_id": "111"}
        game2 = {"name": "Test Game 2", "exe": "testgame2.exe", "client_id": "222"}

        # 1. Add games to queue
        spoofer.add_to_queue(game1)
        spoofer.add_to_queue(game2)
        self.assertEqual(len(spoofer.queue), 2)
        self.assertEqual(spoofer.queue[0]["status"], "pending")
        self.assertEqual(spoofer.queue[1]["status"], "pending")

        # 2. Duration setting
        spoofer.set_target_duration(5)
        self.assertEqual(spoofer.target_seconds, 300)

        # 3. Start queue
        started = spoofer.start_queue()
        self.assertTrue(started)
        self.assertTrue(spoofer.is_running)
        self.assertTrue(spoofer.is_queue_mode)
        self.assertEqual(spoofer.current_queue_index, 0)
        self.assertEqual(spoofer.queue[0]["status"], "running")
        self.assertEqual(len(switched_games), 1)
        self.assertEqual(switched_games[0]["name"], "Test Game 1")

        pid1 = spoofer.current_process.pid
        self.assertTrue(psutil.pid_exists(pid1))

        # 4. Skip to next game
        time.sleep(0.5)
        spoofer.skip_to_next()
        time.sleep(0.5)

        self.assertEqual(spoofer.queue[0]["status"], "done")
        self.assertEqual(spoofer.queue[1]["status"], "running")
        self.assertEqual(spoofer.current_queue_index, 1)
        self.assertEqual(len(switched_games), 2)
        self.assertEqual(switched_games[1]["name"], "Test Game 2")

        # Verify old process terminated and new process running
        self.assertFalse(psutil.pid_exists(pid1))
        pid2 = spoofer.current_process.pid
        self.assertTrue(psutil.pid_exists(pid2))

        # 5. Skip again (finish queue)
        spoofer.skip_to_next()
        time.sleep(0.5)

        self.assertFalse(spoofer.is_running)
        self.assertFalse(spoofer.is_queue_mode)
        self.assertEqual(spoofer.queue[1]["status"], "done")
        self.assertEqual(len(queue_completed), 1)
        self.assertFalse(psutil.pid_exists(pid2))

        # 6. Clear queue
        spoofer.clear_queue()
        self.assertEqual(len(spoofer.queue), 0)

if __name__ == "__main__":
    unittest.main()
