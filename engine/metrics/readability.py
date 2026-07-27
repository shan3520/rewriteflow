"""Readability calculator metrics."""
import re
from engine.utils import count_words, count_syllables, tokenize_sentences

class ReadabilityCalculator:
    @staticmethod
    def gunning_fog(text: str) -> float:
        sentences = max(1, len(tokenize_sentences(text)))
        words = max(1, count_words(text))
        complex_words = sum(1 for w in re.findall(r'\w+', text) if count_syllables(w) >= 3)
        return 0.4 * ((words / sentences) + 100 * (complex_words / words))

    @staticmethod
    def coleman_liau(text: str) -> float:
        letters = len(re.findall(r'[a-zA-Z]', text))
        words = max(1, count_words(text))
        sentences = max(1, len(tokenize_sentences(text)))
        L = (letters / words) * 100
        S = (sentences / words) * 100
        return 0.0588 * L - 0.296 * S - 15.8

def normalize_score(score: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    return max(min_val, min(max_val, score))
