"""Vocabulary Enhancer transformation node."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

ELEVATED_VOCAB = {
    "good": "exemplary",
    "bad": "detrimental",
    "big": "substantial",
    "small": "diminutive",
    "fast": "expeditious"
}

class VocabularyEnhancerNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("VocabularyEnhancerNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        res = text
        enhanced_count = 0
        for simple, elevated in ELEVATED_VOCAB.items():
            if re.search(r'\b' + simple + r'\b', res, flags=re.IGNORECASE):
                res = re.sub(r'\b' + simple + r'\b', elevated, res, flags=re.IGNORECASE)
                enhanced_count += 1
        return NodeResult(res, {"words_enhanced": enhanced_count})
