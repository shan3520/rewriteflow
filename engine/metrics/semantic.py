"""Semantic similarity evaluation engine."""
from engine.metrics.similarity import jaccard_similarity

class SemanticSimilarityCalculator:
    @staticmethod
    def compute_similarity(text1: str, text2: str) -> float:
        # Mock vector cosine similarity based on Jaccard & length ratio
        jaccard = jaccard_similarity(text1, text2)
        len_ratio = min(len(text1), len(text2)) / max(1, max(len(text1), len(text2)))
        return round(0.7 * jaccard + 0.3 * len_ratio, 3)
