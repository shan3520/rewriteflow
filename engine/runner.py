"""Sequential pipeline execution runner with automatic metric logging."""
from typing import List, Dict, Any
from engine.context import PipelineContext
from engine.nodes.base import BaseNode
from engine.metrics.similarity import jaccard_similarity

class PipelineRunner:
    def __init__(self, nodes: List[BaseNode]):
        self.nodes = nodes

    def run(self, initial_text: str, variables: Dict[str, Any] = None) -> PipelineContext:
        context = PipelineContext(initial_text, variables)
        for node in self.nodes:
            node.run(context)
        
        sim = jaccard_similarity(context.original_text, context.text)
        context.add_log(f"Overall text similarity score: {sim:.2f}")
        return context
