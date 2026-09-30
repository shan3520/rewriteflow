"""Pipeline context and runner bookkeeping."""
import unittest

from engine.context import PipelineContext
from engine.nodes.cleanup import TextCleanupNode
from engine.runner import PipelineRunner


class TestContext(unittest.TestCase):
    def test_history_records_each_step(self):
        ctx = PipelineRunner([TextCleanupNode(), TextCleanupNode()]).run("a  b")
        self.assertEqual(ctx.text, "a b")
        self.assertEqual(ctx.original_text, "a  b")
        self.assertEqual([s.node_name for s in ctx.history], ["TextCleanupNode", "TextCleanupNode"])
        self.assertEqual(ctx.history[0].input_text, "a  b")
        self.assertGreaterEqual(ctx.history[0].duration_ms, 0)
        self.assertEqual(len(ctx.logs), 4)

    def test_logs(self):
        ctx = PipelineContext("x")
        ctx.add_log("hello")
        self.assertTrue(ctx.logs[0].endswith("hello"))
        ctx.clear_logs()
        self.assertEqual(ctx.logs, [])


if __name__ == "__main__":
    unittest.main()
