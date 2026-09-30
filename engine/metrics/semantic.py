"""Content-overlap similarity (TF-IDF cosine over the two texts' words)."""
import math
import re
from collections import Counter

TOKEN_RE = re.compile(r"[a-z0-9]+(?:'[a-z]+)?")


def _tokens(text: str):
    return TOKEN_RE.findall(text.lower().replace("’", "'"))


def tfidf_cosine(a: str, b: str) -> float:
    """Cosine similarity of smoothed TF-IDF vectors, 0 (nothing shared) to 1 (same words).

    It measures shared vocabulary, not meaning: a faithful paraphrase can score
    low and a garbled one high. Useful as a rough "how much was reworded" signal.
    """
    ta, tb = Counter(_tokens(a)), Counter(_tokens(b))
    if not ta or not tb:
        return 1.0 if not ta and not tb else 0.0
    vocab = set(ta) | set(tb)
    # Smoothed IDF over the two documents: shared words weigh 1, unique ones log(3/2)+1.
    idf = {t: math.log(3 / (1 + (t in ta) + (t in tb))) + 1 for t in vocab}
    va = {t: ta[t] * idf[t] for t in ta}
    vb = {t: tb[t] * idf[t] for t in tb}
    dot = sum(va[t] * vb.get(t, 0.0) for t in va)
    norm = math.sqrt(sum(v * v for v in va.values())) * math.sqrt(sum(v * v for v in vb.values()))
    return round(dot / norm, 3)


class SemanticSimilarityCalculator:
    @staticmethod
    def compute_similarity(text1: str, text2: str) -> float:
        return tfidf_cosine(text1, text2)
