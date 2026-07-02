"""SEO Optimizer transformation node."""
import re
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

class SEOOptimizerNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("SEOOptimizerNode", config)
        self.keywords = self.get_option("keywords", ["text rewrite", "ai workflow"])

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        res = text
        keyword_str = ", ".join(self.keywords)
        meta_title = f"{res[:45]}... | Keywords: {keyword_str}"
        return NodeResult(res, {
            "meta_title": meta_title,
            "target_keywords": self.keywords
        })
