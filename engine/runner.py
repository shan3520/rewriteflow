"""Runs a document through the pipeline: LLM rewrite, then local post-processing."""
import time
from typing import Callable, Dict, Iterable, List, Optional

from engine.context import PipelineContext
from engine.metrics.report import build_report
from engine.nodes.base import BaseNode
from engine.nodes.rewrite import LLMRewriteNode
from engine.registry import NodeRegistry


class PipelineRunner:
    def __init__(self, nodes: List[BaseNode]):
        self.nodes = nodes

    def run(self, initial_text: str, variables: Dict = None, llm=None,
            on_progress: Optional[Callable[[int, int], None]] = None) -> PipelineContext:
        context = PipelineContext(initial_text, variables, llm=llm, on_progress=on_progress)
        for node in self.nodes:
            node.run(context)
        return context


def build_pipeline(system: str, post: Iterable[str] = ()) -> PipelineRunner:
    return PipelineRunner([LLMRewriteNode({"system": system}), *(NodeRegistry.create(name) for name in post)])


def rewrite_document(text: str, system: str, llm, post: Iterable[str] = (),
                     on_progress: Optional[Callable[[int, int], None]] = None) -> Dict:
    """Returns {"output", "report", "paragraphs", "seconds"} for one document."""
    start = time.time()
    context = build_pipeline(system, post).run(text, llm=llm, on_progress=on_progress)
    return {
        "output": context.text,
        "report": build_report(text, context.text),
        "paragraphs": context.history[0].metadata.get("paragraphs", 0),
        "seconds": round(time.time() - start, 2),
    }
