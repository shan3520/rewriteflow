"""Sequential pipeline execution runner."""
from typing import List, Dict, Any
from engine.context import PipelineContext
from engine.nodes.base import BaseNode

class PipelineRunner:
    def __init__(self, nodes: List[BaseNode]):
        self.nodes = nodes

    def run(self, initial_text: str, variables: Dict[str, Any] = None) -> PipelineContext:
        context = PipelineContext(initial_text, variables)
        for node in self.nodes:
            node.run(context)
        return context
