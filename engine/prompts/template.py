"""Prompt template engine with input sanitization."""
import re
from typing import Dict, Any

class PromptTemplate:
    def __init__(self, template_str: str):
        self.template_str = template_str

    @staticmethod
    def sanitize(val: str) -> str:
        val = str(val)
        val = re.sub(r'`{3}', "---", val)
        return val.strip()

    def render(self, variables: Dict[str, Any]) -> str:
        res = self.template_str
        for key, val in variables.items():
            clean_val = self.sanitize(val)
            res = re.sub(r'\{\{\s*' + key + r'\s*\}\}', clean_val, res)
        return res
