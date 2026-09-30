"""Small text helpers shared by the engine."""
import re
import unicodedata
from typing import List


def normalize_text(text: str) -> str:
    """NFC-normalize and use \\n line endings."""
    return unicodedata.normalize("NFC", text).replace("\r\n", "\n").replace("\r", "\n")


def split_paragraphs(text: str) -> List[str]:
    """Paragraphs separated by blank lines, trimmed, empties dropped (same rule as the backend)."""
    return [p.strip() for p in re.split(r"\n\n+", text) if p.strip()]


def collapse_whitespace(text: str) -> str:
    return " ".join(text.split())


def count_words(text: str) -> int:
    return len(text.split())
