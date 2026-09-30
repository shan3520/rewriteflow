"""Meaning check: Python port must match the shared fixtures used by the frontend."""
import unittest

from engine.context import PipelineContext
from engine.nodes.hallucination import HallucinationDetectorNode, check_meaning, extract_facts
from tests.helpers import fixture


class TestMeaningCheck(unittest.TestCase):
    def test_shared_fixtures(self):
        for case in fixture("meaning_check.json"):
            with self.subTest(case["name"]):
                self.assertEqual(check_meaning(case["original"], case["rewritten"]), case["expected"])

    def test_thousands_separator(self):
        self.assertEqual(check_meaning("We sold 1,000 units.", "We sold 1000 units.")["missing"], [])

    def test_pronoun_and_sentence_start_are_not_names(self):
        self.assertEqual(extract_facts("I think so. Yesterday I'm sure it rained."), [])

    def test_number_inside_larger_number(self):
        result = check_meaning("The fee is 5 dollars.", "The fee is 50 dollars.")
        self.assertEqual(result["missing"], [{"type": "number", "value": "5"}])
        self.assertEqual(result["added"], [{"type": "number", "value": "50"}])

    def test_node_records_result_without_changing_text(self):
        ctx = PipelineContext("Paid 12% to Acme Corp.")
        ctx.text = "Paid Acme Corp."
        HallucinationDetectorNode().run(ctx)
        self.assertEqual(ctx.text, "Paid Acme Corp.")
        meta = ctx.history[-1].metadata
        self.assertFalse(meta["passed_guard"])
        self.assertEqual(meta["meaning_check"]["missing"], [{"type": "number", "value": "12%"}])


if __name__ == "__main__":
    unittest.main()
