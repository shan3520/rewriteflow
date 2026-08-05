"""Markdown formatting transformation node."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

class MarkdownFormattingNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("MarkdownFormattingNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        res = text
        # Normalize header spaces: "#Header" -> "# Header"
        res = re.sub(r'^(#+)([^#\s])', r'\g<1> \g<2>', res, flags=re.MULTILINE)
        return NodeResult(res, {"markdown_formatted": True})
