"""Unit tests for background worker task processing."""
import unittest
from engine.worker.task_queue import TaskQueueConsumer

class TestWorker(unittest.TestCase):
    def test_process_job(self):
        consumer = TaskQueueConsumer()
        res = consumer.process_job({"text": "hello  world"})
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["output"], "Hello world")

if __name__ == "__main__":
    unittest.main()
