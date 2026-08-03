"""Text utilities with Unicode normalization."""
import unicodedata
import re
from typing import List

def normalize_text(text: str) -> str:
    return unicodedata.normalize('NFC', text)

def tokenize_sentences(text: str) -> List[str]:
    text = normalize_text(text)
    return [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]

def clean_whitespace(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()

def count_words(text: str) -> int:
    return len(re.findall(r'\w+', text))

def count_syllables(word: str) -> int:
    word = word.lower()
    count = len(re.findall(r'[aeiouy]+', word))
    return max(1, count)
