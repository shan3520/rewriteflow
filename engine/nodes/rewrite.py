"""LLM rewrite node: sends each paragraph to the model with one system prompt."""
from engine.context import PipelineContext
from engine.nodes.base import BaseNode, NodeResult
from engine.text import split_paragraphs


class LLMRewriteNode(BaseNode):
    """config: {"system": str}. Needs context.llm, an object with complete(system, text)."""

    def __init__(self, config=None):
        super().__init__("LLMRewriteNode", config)
        self.system = self.get_option("system")
        if not self.system:
            raise ValueError("LLMRewriteNode needs a 'system' prompt")

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        if context.llm is None:
            raise RuntimeError("No LLM client configured")
        paragraphs = split_paragraphs(text)
        out = []
        for i, paragraph in enumerate(paragraphs, 1):
            if context.on_progress:
                context.on_progress(i, len(paragraphs))
            out.append(context.llm.complete(self.system, paragraph))
        return NodeResult("\n\n".join(out), {"paragraphs": len(paragraphs)})
