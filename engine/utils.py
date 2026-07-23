"""Text processing utility helpers."""
import re
from typing import List

def tokenize_sentences(text: str) -> List[str]:
    return [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]

def clean_whitespace(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()

def count_words(text: str) -> int:
    return len(re.findall(r'\w+', text))

def count_syllables(word: str) -> int:
    word = word.lower()
    count = len(re.findall(r'[aeiouy]+', word))
    return max(1, count)

def sanitize_utf8(text: str) -> str:
    return text.encode('utf-8', errors='ignore').decode('utf-8')
