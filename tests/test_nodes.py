"""Unit tests for core transformation nodes."""
import unittest
from engine.context import PipelineContext
from engine.nodes.grammar import GrammarFixNode
from engine.nodes.tone import ToneShiftNode

class TestTransformNodes(unittest.TestCase):
    def test_grammar_fix_node(self):
        node = GrammarFixNode()
        ctx = PipelineContext("this is  a test . sentence sentence")
        out = node.run(ctx)
        self.assertEqual(out, "This is a test. Sentence")

    def test_tone_shift_formal(self):
        node = ToneShiftNode({"target_tone": "formal"})
        ctx = PipelineContext("I can't help the kids buy toys.")
        out = node.run(ctx)
        self.assertIn("cannot", out)
        self.assertIn("assist", out)
        self.assertIn("children", out)

if __name__ == "__main__":
    unittest.main()

from engine.nodes.paraphrase import ParaphraseNode
from engine.nodes.summarize import SummarizeNode
from engine.nodes.simplifier import SimplifierNode

class TestAdvancedNodes(unittest.TestCase):
    def test_paraphrase(self):
        node = ParaphraseNode()
        ctx = PipelineContext("It is important to start now.")
        out = node.run(ctx)
        self.assertIn("crucial", out)
        self.assertIn("initiate", out)

    def test_summarize(self):
        node = SummarizeNode({"max_sentences": 1})
        ctx = PipelineContext("First sentence here. Second sentence here. Third sentence here.")
        out = node.run(ctx)
        self.assertEqual(out, "First sentence here.")

    def test_simplifier(self):
        node = SimplifierNode()
        ctx = PipelineContext("We will utilize this implementation subsequently.")
        out = node.run(ctx)
        self.assertIn("use", out)
        self.assertIn("setup", out)
