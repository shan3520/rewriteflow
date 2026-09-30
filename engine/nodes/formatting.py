"""Deterministic Markdown tidy-up."""
import re

from engine.context import PipelineContext
from engine.nodes.base import BaseNode, NodeResult


class MarkdownFormattingNode(BaseNode):
    """Normalizes headings ("#Title" → "# Title"), list bullets (* and + → -),
    trailing spaces and runs of blank lines. Code fences are left untouched."""

    def __init__(self, config=None):
        super().__init__("MarkdownFormattingNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        out, in_fence = [], False
        for line in text.split("\n"):
            if line.lstrip().startswith("```"):
                in_fence = not in_fence
                out.append(line.rstrip())
                continue
            if not in_fence:
                line = re.sub(r"^(#{1,6})([^#\s])", r"\1 \2", line)
                line = re.sub(r"^(\s*)[*+](\s+)", r"\1-\2", line)
                line = line.rstrip()
            out.append(line)
        res = re.sub(r"\n{3,}", "\n\n", "\n".join(out)).strip() + "\n"
        return NodeResult(res, {"markdown_formatted": True})
