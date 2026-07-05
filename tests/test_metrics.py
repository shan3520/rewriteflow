"""Unit tests for similarity and readability metrics."""
import unittest
from engine.metrics.similarity import levenshtein_distance, jaccard_similarity
from engine.metrics.readability import ReadabilityCalculator

class TestMetrics(unittest.TestCase):
    def test_levenshtein(self):
        self.assertEqual(levenshtein_distance("kitten", "sitting"), 3)

    def test_jaccard(self):
        sim = jaccard_similarity("hello world", "hello there world")
        self.assertAlmostEqual(sim, 0.6666, places=2)

    def test_readability(self):
        fog = ReadabilityCalculator.gunning_fog("This is a simple sentence.")
        self.assertGreater(fog, 0)

if __name__ == "__main__":
    unittest.main()
