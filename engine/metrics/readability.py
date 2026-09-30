"""Readability statistics.

Same algorithm as frontend/src/lib/readability.js; both are checked against
shared/fixtures/readability.json.
"""
import math
import re
from typing import Dict, List

WORD_RE = re.compile(r"[A-Za-z]+(?:['’][A-Za-z]+)*|[0-9]+(?:[.,][0-9]+)*")
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])[\"'”’)\]]*\s+|\n+")
WORDS_PER_MINUTE = 238


def round1(x: float) -> float:
    """Round half up to one decimal, like JavaScript's Math.round."""
    return math.floor(x * 10 + 0.5) / 10


def split_sentences(text: str) -> List[str]:
    return [s for s in SENTENCE_SPLIT_RE.split(text) if re.search(r"[A-Za-z0-9]", s)]


def count_syllables(word: str) -> int:
    w = re.sub(r"[^a-z]", "", word.lower())
    if len(w) <= 3:
        return 1
    w = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)\Z", "", w, count=1)
    w = re.sub(r"^y", "", w)
    return max(1, len(re.findall(r"[aeiouy]{1,2}", w)))


def analyze(text: str) -> Dict[str, float]:
    words = WORD_RE.findall(text)
    sentences = len(split_sentences(text))
    if not words or not sentences:
        return {"words": 0, "sentences": 0, "syllables": 0, "avgSentenceLength": 0, "fleschReadingEase": 0,
                "fleschKincaidGrade": 0, "readingMinutes": 0}
    syllables = sum(count_syllables(w) for w in words)
    wps = len(words) / sentences
    spw = syllables / len(words)
    return {
        "words": len(words),
        "sentences": sentences,
        "syllables": syllables,
        "avgSentenceLength": round1(wps),
        "fleschReadingEase": round1(206.835 - 1.015 * wps - 84.6 * spw),
        "fleschKincaidGrade": round1(0.39 * wps + 11.8 * spw - 15.59),
        "readingMinutes": round1(len(words) / WORDS_PER_MINUTE),
    }


def ease_label(score: float) -> str:
    if score >= 80:
        return "Very easy"
    if score >= 60:
        return "Plain"
    if score >= 50:
        return "Fairly hard"
    if score >= 30:
        return "Hard"
    return "Very hard"


def gunning_fog(text: str) -> float:
    """Gunning fog index: years of schooling needed on a first reading."""
    words = WORD_RE.findall(text)
    sentences = len(split_sentences(text))
    if not words or not sentences:
        return 0.0
    complex_words = sum(1 for w in words if count_syllables(w) >= 3)
    return round1(0.4 * (len(words) / sentences + 100 * complex_words / len(words)))


def coleman_liau(text: str) -> float:
    """Coleman–Liau index, based on letters per word rather than syllables."""
    words = WORD_RE.findall(text)
    sentences = len(split_sentences(text))
    if not words or not sentences:
        return 0.0
    letters = sum(1 for ch in text if ch.isascii() and ch.isalpha())
    L = letters / len(words) * 100
    S = sentences / len(words) * 100
    return round1(0.0588 * L - 0.296 * S - 15.8)
