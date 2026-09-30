"""Fills {param} placeholders in step instructions."""
import re
from typing import Any, Dict, Optional


def fill_params(template: str, param_defs: Optional[Dict[str, Any]] = None, params: Optional[Dict[str, str]] = None) -> str:
    """Replaces {key} with params[key], else the param's default, else ''."""
    param_defs = param_defs or {}
    params = params or {}

    def value(match):
        key = match.group(1)
        if params.get(key) is not None:
            return str(params[key]).strip()
        return str(param_defs.get(key, {}).get("default", "")).strip()

    return re.sub(r"\{(\w+)\}", value, template)


class PromptTemplate:
    """A template with {{ variable }} placeholders."""

    def __init__(self, template_str: str):
        self.template_str = template_str

    def render(self, variables: Dict[str, Any]) -> str:
        return re.sub(
            r"\{\{\s*(\w+)\s*\}\}",
            lambda m: str(variables.get(m.group(1), m.group(0))).strip(),
            self.template_str,
        )
