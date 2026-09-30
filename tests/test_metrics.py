"""Readability: Python port must match the shared fixtures used by the frontend."""
import unittest

from engine.metrics.readability import analyze, coleman_liau, count_syllables, ease_label, gunning_fog, round1, split_sentences
from tests.helpers import fixture


class TestReadability(unittest.TestCase):
    def test_shared_fixtures(self):
        for case in fixture("readability.json"):
            with self.subTest(case["text"]):
                self.assertEqual(analyze(case["text"]), case["expected"])

    def test_syllables(self):
        self.assertEqual(count_syllables("cat"), 1)
        self.assertEqual(count_syllables("table"), 2)
        self.assertEqual(count_syllables("wonderful"), 3)
        self.assertEqual(count_syllables("2024"), 1)

    def test_sentence_split(self):
        self.assertEqual(len(split_sentences('One. "Two!" Three?\nFour')), 4)

    def test_round_half_up_like_javascript(self):
        self.assertEqual(round1(0.25), 0.3)
        self.assertEqual(round1(-2.25), -2.2)

    def test_labels_and_extra_indexes(self):
        self.assertEqual(ease_label(85), "Very easy")
        self.assertEqual(ease_label(10), "Very hard")
        text = "The committee deliberated extensively. Consensus was eventually reached."
        self.assertGreater(gunning_fog(text), 10)
        self.assertGreater(coleman_liau(text), 10)
        self.assertEqual(gunning_fog(""), 0.0)


if __name__ == "__main__":
    unittest.main()
