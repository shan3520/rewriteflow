"""Local post-processing nodes."""
import unittest

from engine.context import PipelineContext
from engine.nodes.cleanup import TextCleanupNode
from engine.nodes.formatting import MarkdownFormattingNode


def run(node, text):
    ctx = PipelineContext(text)
    node.run(ctx)
    return ctx.text, ctx.history[-1].metadata


class TestCleanupNode(unittest.TestCase):
    def test_tidies_spaces_and_repeats_but_keeps_paragraphs(self):
        text, meta = run(TextCleanupNode(), "This  is is the the plan .  \n\n\n\nNext   part , done")
        self.assertEqual(text, "This is the plan.\n\nNext part, done")
        self.assertEqual(meta["repeated_words_removed"], 2)


class TestMarkdownNode(unittest.TestCase):
    def test_headings_bullets_and_blank_lines(self):
        text, _ = run(MarkdownFormattingNode(), "#Title\n\n\n\n* one  \n+ two\n  * nested")
        self.assertEqual(text, "# Title\n\n- one\n- two\n  - nested\n")

    def test_leaves_code_fences_alone(self):
        src = "```\n#not a heading\n* not a bullet  \n```"
        text, _ = run(MarkdownFormattingNode(), src)
        self.assertEqual(text, src + "\n")


if __name__ == "__main__":
    unittest.main()
