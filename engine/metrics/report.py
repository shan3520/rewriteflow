"""Before/after report for one rewrite."""
from typing import Dict

from engine.metrics.readability import analyze, ease_label
from engine.metrics.semantic import tfidf_cosine
from engine.nodes.hallucination import check_meaning


def build_report(original: str, rewritten: str) -> Dict:
    before, after = analyze(original), analyze(rewritten)
    meaning = check_meaning(original, rewritten)
    return {
        "readability": {"before": before, "after": after, "ease_before": ease_label(before["fleschReadingEase"]),
                        "ease_after": ease_label(after["fleschReadingEase"])},
        "content_overlap": tfidf_cosine(original, rewritten),
        "meaning_check": meaning,
        "issues": len(meaning["missing"]) + len(meaning["added"]),
    }


class QualityScoreAggregator:
    """Backwards-compatible wrapper: 0–100 content-overlap score."""

    @staticmethod
    def calculate_overall_score(original: str, rewritten: str) -> float:
        return round(tfidf_cosine(original, rewritten) * 100.0, 1)
