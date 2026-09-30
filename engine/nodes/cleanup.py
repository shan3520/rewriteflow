"""Whitespace tidy-up that keeps paragraph breaks."""
import re

from engine.context import PipelineContext
from engine.nodes.base import BaseNode, NodeResult

SPACES = re.compile(r"[ \t]+")
SPACE_BEFORE_PUNCT = re.compile(r"[ \t]+([,.!?:;])")
TRAILING = re.compile(r"[ \t]+$", re.MULTILINE)
BLANK_LINES = re.compile(r"\n{3,}")
REPEATED_WORD = re.compile(r"\b(\w+)([ \t]+\1\b)+", re.IGNORECASE)


class TextCleanupNode(BaseNode):
    """Collapses runs of spaces, drops space before punctuation and doubled
    words ("the the"), and limits blank lines to one. Never touches newlines
    between paragraphs or the wording itself."""

    def __init__(self, config=None):
        super().__init__("TextCleanupNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        res = SPACES.sub(" ", text)
        res = SPACE_BEFORE_PUNCT.sub(r"\1", res)
        res = TRAILING.sub("", res)
        res, repeats = REPEATED_WORD.subn(r"\1", res)
        res = BLANK_LINES.sub("\n\n", res).strip()
        return NodeResult(res, {"repeated_words_removed": repeats})
