"""Quality score aggregator."""
from engine.metrics.semantic import SemanticSimilarityCalculator

class QualityScoreAggregator:
    @staticmethod
    def calculate_overall_score(original: str, rewritten: str) -> float:
        sim = SemanticSimilarityCalculator.compute_similarity(original, rewritten)
        # Score scale 0 to 100
        return round(sim * 100.0, 1)
