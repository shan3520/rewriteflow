"""Multi-language translation transformation node."""
from engine.nodes.base import BaseNode, NodeResult
from engine.context import PipelineContext

TRANSLATIONS = {
    "es": {"hello": "hola", "world": "mundo", "thank you": "gracias"},
    "fr": {"hello": "bonjour", "world": "monde", "thank you": "merci"}
}

class MultiLanguageTranslateNode(BaseNode):
    def __init__(self, config=None):
        super().__init__("MultiLanguageTranslateNode", config)
        self.target_lang = self.get_option("target_lang", "es")

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        res = text.lower()
        dict_map = TRANSLATIONS.get(self.target_lang, {})
        for en, tr in dict_map.items():
            res = res.replace(en, tr)
        return NodeResult(res, {"target_lang": self.target_lang})
