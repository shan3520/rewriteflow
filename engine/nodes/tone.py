"""Tone shift transformation node."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

FORMAL_REPLACEMENTS = {
    r"\bcan't\b": "cannot",
    r"\bdon't\b": "do not",
    r"\bwon't\b": "will not",
    r"\bgonna\b": "going to",
    r"\bwanna\b": "want to",
    r"\bkids\b": "children",
    r"\bbuy\b": "purchase",
    r"\bhelp\b": "assist",
}

CASUAL_REPLACEMENTS = {
    r"\bcannot\b": "can't",
    r"\bdo not\b": "don't",
    r"\bwill not\b": "won't",
    r"\bassist\b": "help",
    r"\bpurchase\b": "buy",
}

class ToneShiftNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("ToneShiftNode", config)
        self.target_tone = self.config.get("target_tone", "formal")

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        res = text
        replacements = FORMAL_REPLACEMENTS if self.target_tone == "formal" else CASUAL_REPLACEMENTS
        for pattern, replacement in replacements.items():
            res = re.sub(pattern, replacement, res, flags=re.IGNORECASE)
        return NodeResult(res, {"target_tone": self.target_tone})
