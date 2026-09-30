"""Meaning check: finds details a rewrite must not lose or invent.

Numbers, names, URLs, emails, citations and direct quotes are extracted from
both texts; anything missing from the rewrite, or new in it, is reported.
Python port of frontend/src/lib/meaningCheck.js; both are checked against
shared/fixtures/meaning_check.json.
"""
import re
from typing import Dict, List

from engine.context import PipelineContext
from engine.nodes.base import BaseNode, NodeResult

URL_RE = re.compile(r"\bhttps?://[^\s<>\"'()\[\]]+")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+")
PAREN_CITATION_RE = re.compile(r"\([^()]*\b(?:1[5-9]|20)[0-9]{2}[a-z]?\b[^()]*\)")
BRACKET_CITATION_RE = re.compile(r"\[[0-9]+(?:\s*[,–-]\s*[0-9]+)*\]")
QUOTE_RE = re.compile(r"[\"“]([^\"“”\n]{3,300})[\"”]")
NUMBER_RE = re.compile(r"(?<![A-Za-z0-9_.,])(?<![A-Za-z]-)[0-9]+(?:[.,][0-9]+)*(?:\s?%)?")
NAME_RE = re.compile(r"[A-Z][A-Za-z0-9'’&-]*(?:[ \t]+[A-Z][A-Za-z0-9'’&-]*)*")
SENTENCE_START_CHAR_RE = re.compile(r"[.!?:;\"“”'‘’(\[•*#>\-–—]")
PRONOUN_I_RE = re.compile(r"^I(?:['’][a-z]+)?$")

FACT_LABELS = {"number": "Number", "name": "Name", "url": "Link", "email": "Email", "citation": "Citation", "quote": "Quote"}

Fact = Dict[str, str]


def _collapse(s: str) -> str:
    return " ".join(s.split())


def _straight_quotes(s: str) -> str:
    return s.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")


def _normalize_number(value: str) -> str:
    return re.sub(r"\s", "", re.sub(r"([0-9]),(?=[0-9]{3}\b)", r"\1", value))


def _at_sentence_start(text: str, index: int) -> bool:
    m = re.search(r"(\S?)(\s*)\Z", text[:index])
    return not m.group(1) or bool(SENTENCE_START_CHAR_RE.match(m.group(1))) or "\n" in m.group(2)


def _take(text: str, pattern, mapper=lambda m: m.group(0)):
    values: List[str] = []

    def replace(m):
        values.append(mapper(m))
        return " "

    return values, pattern.sub(replace, text)


def extract_facts(text: str) -> List[Fact]:
    facts: List[Fact] = []
    urls, rest = _take(text, URL_RE, lambda m: re.sub(r"[.,;:!?]+$", "", m.group(0)))
    emails, rest = _take(rest, EMAIL_RE)
    cites, rest = _take(rest, PAREN_CITATION_RE, lambda m: _collapse(m.group(0)))
    brackets, rest = _take(rest, BRACKET_CITATION_RE, lambda m: _collapse(m.group(0)))
    quotes, rest = _take(rest, QUOTE_RE, lambda m: _collapse(_straight_quotes(m.group(1))))

    facts += [{"type": "url", "value": v} for v in urls]
    facts += [{"type": "email", "value": v} for v in emails]
    facts += [{"type": "citation", "value": v} for v in cites + brackets]
    facts += [{"type": "quote", "value": v} for v in quotes]
    facts += [{"type": "number", "value": _normalize_number(m.group(0))} for m in NUMBER_RE.finditer(rest)]

    for m in NAME_RE.finditer(rest):
        words = re.split(r"[ \t]+", m.group(0))
        if _at_sentence_start(rest, m.start()):
            words = words[1:]
        words = [re.sub(r"[-']+$", "", re.sub(r"['’]s$", "", w)) for w in words]
        name = " ".join(words)
        if len(name) < 2 or PRONOUN_I_RE.match(name):
            continue
        facts.append({"type": "name", "value": name})

    seen = set()
    unique = []
    for f in facts:
        key = (f["type"], f["value"])
        if key not in seen:
            seen.add(key)
            unique.append(f)
    return unique


def _prepare(text: str):
    facts = extract_facts(text)
    flat = _collapse(text)
    return {
        "facts": facts,
        "flat": flat,
        "flat_straight": _straight_quotes(flat),
        "numbers": {f["value"] for f in facts if f["type"] == "number"},
    }


def _present_in(fact: Fact, other) -> bool:
    if fact["type"] == "number":
        return fact["value"] in other["numbers"]
    if fact["type"] == "name":
        return re.search(r"(?<![A-Za-z0-9])" + re.escape(fact["value"]) + r"(?![A-Za-z0-9])", other["flat"]) is not None
    if fact["type"] == "quote":
        return fact["value"] in other["flat_straight"]
    return fact["value"] in other["flat"]


def check_meaning(original: str, rewritten: str) -> Dict:
    a, b = _prepare(original), _prepare(rewritten)
    return {
        "checked": len(a["facts"]),
        "missing": [f for f in a["facts"] if not _present_in(f, b)],
        "added": [f for f in b["facts"] if not _present_in(f, a)],
    }


class HallucinationDetectorNode(BaseNode):
    """Leaves the text unchanged and records the meaning check in metadata."""

    def __init__(self, config=None):
        super().__init__("HallucinationDetectorNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        result = check_meaning(context.original_text, text)
        return NodeResult(text, {"meaning_check": result, "passed_guard": not (result["missing"] or result["added"])})
