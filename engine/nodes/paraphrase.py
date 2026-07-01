"""Paraphrase transformation node."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

SYNONYMS = {
    "important": "crucial",
    "use": "utilize",
    "show": "demonstrate",
    "make": "create",
    "start": "initiate",
    "end": "terminate"
}

class ParaphraseNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("ParaphraseNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        res = text
        replacements_count = 0
        for orig, syn in SYNONYMS.items():
            if re.search(r'\b' + orig + r'\b', res, flags=re.IGNORECASE):
                res = re.sub(r'\b' + orig + r'\b', syn, res, flags=re.IGNORECASE)
                replacements_count += 1
        return NodeResult(res, {"synonyms_replaced": replacements_count})
