"""Edge case tests for engine transforms."""
import unittest
from engine.nodes.grammar import GrammarFixNode
from engine.context import PipelineContext

class TestEdgeCases(unittest.TestCase):
    def test_empty_string(self):
        node = GrammarFixNode()
        ctx = PipelineContext("")
        out = node.run(ctx)
        self.assertEqual(out, "")

    def test_unicode_text(self):
        node = GrammarFixNode()
        ctx = PipelineContext("Café   au lait .")
        out = node.run(ctx)
        self.assertIn("Café", out)

if __name__ == "__main__":
    unittest.main()
