"""Runner: LLM rewrite per paragraph, post-processing and the report."""
import unittest

from engine.runner import build_pipeline, rewrite_document
from tests.helpers import FakeLLM


class TestRunner(unittest.TestCase):
    def test_rewrites_each_paragraph_with_the_system_prompt(self):
        llm = FakeLLM()
        progress = []
        result = rewrite_document("Sales grew.\n\n\nThe big day.", "SYS", llm, on_progress=lambda i, n: progress.append((i, n)))
        self.assertEqual(result["output"], "Sales increased.\n\nThe large day.")
        self.assertEqual([c[1] for c in llm.calls], ["Sales grew.", "The big day."])
        self.assertTrue(all(c[0] == "SYS" for c in llm.calls))
        self.assertEqual(progress, [(1, 2), (2, 2)])
        self.assertEqual(result["paragraphs"], 2)

    def test_report_flags_lost_details(self):
        result = rewrite_document("Revenue grew 12% at Acme Corp.", "SYS", FakeLLM(drop_percent=True))
        self.assertEqual(result["report"]["issues"], 1)
        self.assertEqual(result["report"]["meaning_check"]["missing"], [{"type": "number", "value": "12%"}])

    def test_post_nodes_run_after_the_rewrite(self):
        result = rewrite_document("#Title\n\n* item   one", "SYS", FakeLLM(), post=["tidy_markdown"])
        self.assertEqual(result["output"], "# Title\n\n- item   one\n")

    def test_unknown_post_node(self):
        with self.assertRaisesRegex(ValueError, "Unknown node"):
            build_pipeline("SYS", post=["nope"])

    def test_requires_llm(self):
        with self.assertRaisesRegex(RuntimeError, "No LLM"):
            build_pipeline("SYS").run("text")


if __name__ == "__main__":
    unittest.main()
