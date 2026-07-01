"""Simplifier transformation node."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

COMPLEX_WORDS = {
    "utilize": "use",
    "demonstrate": "show",
    "subsequently": "then",
    "notwithstanding": "despite",
    "implementation": "setup"
}

class SimplifierNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("SimplifierNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        res = text
        for complex_w, simple_w in COMPLEX_WORDS.items():
            res = re.sub(r'\b' + complex_w + r'\b', simple_w, res, flags=re.IGNORECASE)
        
        words = len(re.findall(r'\w+', res))
        sentences = max(1, len(re.split(r'[.!?]+', res)) - 1)
        approx_fk_grade = round(0.39 * (words / sentences) + 11.8 * (1.5) - 15.59, 1)

        return NodeResult(res, {"fk_grade_level": approx_fk_grade})
