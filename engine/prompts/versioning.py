"""Prompt semantic version manager."""
from typing import Dict

class PromptVersionManager:
    def __init__(self):
        self.versions: Dict[str, str] = {}

    def register_version(self, name: str, version: str, template: str):
        key = f"{name}:{version}"
        self.versions[key] = template

    def get_template(self, name: str, version: str = "v1") -> str:
        key = f"{name}:{version}"
        if key not in self.versions:
            raise KeyError(f"Template version {key} not found.")
        return self.versions[key]
