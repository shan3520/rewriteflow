"""Unit tests for Quality score aggregator."""
import unittest
from engine.metrics.quality import QualityScoreAggregator

class TestQualityMetrics(unittest.TestCase):
    def test_overall_score(self):
        score = QualityScoreAggregator.calculate_overall_score("hello world", "hello world!")
        self.assertGreater(score, 80.0)

if __name__ == "__main__":
    unittest.main()
