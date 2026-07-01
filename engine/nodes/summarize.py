"""Summarize transformation node."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

class SummarizeNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("SummarizeNode", config)
        self.max_sentences = self.get_option("max_sentences", 2)

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
        if not sentences:
            return NodeResult(text, {"summary_sentence_count": 0})
        
        # Simple extraction based on length and position
        summary_sentences = sentences[:self.max_sentences]
        summary_text = ". ".join(summary_sentences) + "."
        return NodeResult(summary_text, {
            "original_sentences": len(sentences),
            "summary_sentences": len(summary_sentences)
        })
