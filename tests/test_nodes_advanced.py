"""Unit tests for advanced transformation nodes."""
import unittest
from engine.context import PipelineContext
from engine.nodes.code_commenter import CodeCommenterNode
from engine.nodes.translate import MultiLanguageTranslateNode
from engine.nodes.formatting import MarkdownFormattingNode

class TestAdvancedNodes(unittest.TestCase):
    def test_code_commenter(self):
        node = CodeCommenterNode()
        ctx = PipelineContext("def process_data():\n    pass")
        out = node.run(ctx)
        self.assertIn("Docstring for process_data", out)

    def test_translation(self):
        node = MultiLanguageTranslateNode({"target_lang": "es"})
        ctx = PipelineContext("hello world")
        out = node.run(ctx)
        self.assertEqual(out, "hola mundo")

    def test_markdown_formatting(self):
        node = MarkdownFormattingNode()
        ctx = PipelineContext("#Title")
        out = node.run(ctx)
        self.assertEqual(out, "# Title")

if __name__ == "__main__":
    unittest.main()
