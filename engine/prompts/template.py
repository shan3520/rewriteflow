"""Prompt template engine."""
import re
from typing import Dict, Any

class PromptTemplate:
    def __init__(self, template_str: str):
        self.template_str = template_str

    def render(self, variables: Dict[str, Any]) -> str:
        res = self.template_str
        for key, val in variables.items():
            res = re.sub(r'\{\{\s*' + key + r'\s*\}\}', str(val), res)
        return res
