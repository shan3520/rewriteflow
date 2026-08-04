"""End-to-End integration test."""
import unittest
from engine.runner import PipelineRunner
from engine.nodes.grammar import GrammarFixNode
from engine.nodes.tone import ToneShiftNode

class TestEndToEnd(unittest.TestCase):
    def test_full_pipeline(self):
        runner = PipelineRunner([
            GrammarFixNode(),
            ToneShiftNode({"target_tone": "formal"})
        ])
        ctx = runner.run("i can't help you .")
        self.assertIn("cannot", ctx.text)

if __name__ == "__main__":
    unittest.main()
