"""GrammarFixNode with precompiled regex patterns."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

MULTIPLE_SPACES = re.compile(r'\s+')
PUNCTUATION_SPACES = re.compile(r'\s+([,.!?:;])')
REPEATED_WORDS = re.compile(r'\b(\w+)\s+\1\b', flags=re.IGNORECASE)
CAPITALIZATION = re.compile(r'(^[a-z]|[.!?]\s+[a-z])')

class GrammarFixNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("GrammarFixNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        res = text
        res = MULTIPLE_SPACES.sub(' ', res)
        res = PUNCTUATION_SPACES.sub(r'\1', res)
        res = REPEATED_WORDS.sub(r'\1', res)
        res = CAPITALIZATION.sub(lambda m: m.group(0).upper(), res)
        return NodeResult(res.strip(), {"optimized": True})
