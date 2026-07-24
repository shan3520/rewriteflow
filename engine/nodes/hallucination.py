"""Hallucination Detector verification guard node."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

class HallucinationDetectorNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("HallucinationDetectorNode", config)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        orig_numbers = set(re.findall(r'\b\d+\b', context.original_text))
        curr_numbers = set(re.findall(r'\b\d+\b', text))
        invented_numbers = curr_numbers - orig_numbers
        return NodeResult(text, {
            "flagged_hallucinations": list(invented_numbers),
            "passed_guard": len(invented_numbers) == 0
        })
