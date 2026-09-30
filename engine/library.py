"""Loads the shared step library (shared/steps.json)."""
import json
import os
from functools import lru_cache
from typing import Any, Dict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHARED_DIR = os.path.join(ROOT, "shared")
PRESETS_DIR = os.path.join(ROOT, "presets")


@lru_cache(maxsize=None)
def load_library(path: str = os.path.join(SHARED_DIR, "steps.json")) -> Dict[str, Any]:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    data["steps_by_id"] = {s["id"]: s for s in data["steps"]}
    return data
