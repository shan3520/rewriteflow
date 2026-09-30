"""Similarity measures and the combined report."""
import unittest

from engine.metrics.report import QualityScoreAggregator, build_report
from engine.metrics.semantic import tfidf_cosine
from engine.metrics.similarity import jaccard_similarity, levenshtein_distance


class TestSimilarity(unittest.TestCase):
    def test_levenshtein(self):
        self.assertEqual(levenshtein_distance("kitten", "sitting"), 3)
        self.assertEqual(levenshtein_distance("", "abc"), 3)

    def test_jaccard(self):
        self.assertEqual(jaccard_similarity("a b c", "a b d"), 0.5)
        self.assertEqual(jaccard_similarity("", ""), 1.0)

    def test_tfidf_cosine(self):
        self.assertEqual(tfidf_cosine("the cat sat", "the cat sat"), 1.0)
        self.assertEqual(tfidf_cosine("alpha beta", "gamma delta"), 0.0)
        partial = tfidf_cosine("the cat sat on the mat", "the dog sat on the rug")
        self.assertTrue(0 < partial < 1)
        self.assertEqual(tfidf_cosine("", ""), 1.0)

    def test_report(self):
        report = build_report("Revenue grew 12%.", "Revenue rose.")
        self.assertEqual(report["issues"], 1)
        self.assertEqual(report["readability"]["before"]["words"], 3)
        self.assertEqual(QualityScoreAggregator.calculate_overall_score("same words", "same words"), 100.0)


if __name__ == "__main__":
    unittest.main()
