"""Style Transfer transformation node."""
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

PERSONA_PREFIXES = {
    "hemingway": "Short and direct: ",
    "corporate": "Per our previous discussion: ",
    "academic": "Empirical evidence suggests: "
}

class StyleTransferNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("StyleTransferNode", config)
        self.persona = self.get_option("persona", "hemingway")

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        prefix = PERSONA_PREFIXES.get(self.persona, "")
        return NodeResult(prefix + text, {"persona": self.persona})
