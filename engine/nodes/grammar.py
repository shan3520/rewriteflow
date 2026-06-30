"""Grammar and spelling correction transformation node."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

class GrammarFixNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("GrammarFixNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        res = text
        res = re.sub(r'\s+', ' ', res)  # Multiple spaces
        res = re.sub(r'\s+([,.!?:;])', r'\1', res)  # Space before punctuation
        res = re.sub(r'\b(\w+)\s+\1\b', r'\1', res, flags=re.IGNORECASE)  # Repeated words
        res = re.sub(r'(^[a-z]|[.!?]\s+[a-z])', lambda m: m.group(0).upper(), res)  # Capitalization
        fixes_applied = len(text) - len(res)
        return NodeResult(res.strip(), {"fixes_applied_approx": abs(fixes_applied)})
