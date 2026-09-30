"""Workflow files: load, normalize and validate.

A workflow is YAML or JSON:

    name: Email Polish
    description: optional
    steps:            # ids from shared/steps.json, run in order
      - grammar
      - id: translate
        params: {lang: French}
    custom_instruction: optional free text
    post:             # optional local post-processing nodes
      - tidy_markdown
"""
import json
import os
from typing import Any, Dict, List

import yaml

from engine.library import PRESETS_DIR, load_library

MAX_STEPS = 10
MAX_INSTRUCTION = 1000


class WorkflowError(ValueError):
    pass


def normalize_steps(steps: List[Any]) -> List[Dict[str, Any]]:
    out = []
    for s in steps:
        if isinstance(s, str):
            out.append({"id": s})
        elif isinstance(s, dict) and "id" in s:
            step = {"id": s["id"]}
            if s.get("params"):
                step["params"] = {k: str(v) for k, v in s["params"].items()}
            out.append(step)
        else:
            raise WorkflowError(f"Invalid step: {s!r}")
    return out


def validate_workflow(data: Any, library=None) -> Dict[str, Any]:
    """Returns a normalized workflow dict or raises WorkflowError."""
    library = library or load_library()
    if not isinstance(data, dict):
        raise WorkflowError("A workflow must be a mapping with at least a name and steps")
    name = str(data.get("name") or "").strip()
    if not name:
        raise WorkflowError("Workflow is missing a name")

    steps = normalize_steps(data.get("steps") or [])
    if len(steps) > MAX_STEPS:
        raise WorkflowError(f"A workflow can have at most {MAX_STEPS} steps")
    for step in steps:
        definition = library["steps_by_id"].get(step["id"])
        if not definition:
            known = ", ".join(sorted(library["steps_by_id"]))
            raise WorkflowError(f"Unknown step '{step['id']}'. Known steps: {known}")
        for key in step.get("params", {}):
            if key not in (definition.get("params") or {}):
                raise WorkflowError(f"Unknown param '{key}' for step '{step['id']}'")

    instruction = str(data.get("custom_instruction") or "").strip()
    if len(instruction) > MAX_INSTRUCTION:
        raise WorkflowError(f"custom_instruction must be at most {MAX_INSTRUCTION} characters")
    if not steps and not instruction:
        raise WorkflowError("Add at least one step or a custom_instruction")

    post = data.get("post") or []
    if not isinstance(post, list) or not all(isinstance(p, str) for p in post):
        raise WorkflowError("post must be a list of node names")

    return {
        "name": name,
        "description": str(data.get("description") or "").strip(),
        "steps": steps,
        "custom_instruction": instruction,
        "post": post,
    }


def list_presets(presets_dir: str = PRESETS_DIR) -> Dict[str, str]:
    """Maps preset name (file stem) to its path."""
    return {
        os.path.splitext(f)[0]: os.path.join(presets_dir, f)
        for f in sorted(os.listdir(presets_dir))
        if f.endswith((".yaml", ".yml"))
    }


def load_workflow(ref: str, presets_dir: str = PRESETS_DIR) -> Dict[str, Any]:
    """Loads a workflow from a preset name (e.g. "email_polish") or a file path."""
    presets = list_presets(presets_dir)
    path = presets.get(ref, ref)
    if not os.path.isfile(path):
        raise WorkflowError(f"No preset or file named '{ref}'. Presets: {', '.join(presets)}")
    with open(path, encoding="utf-8") as f:
        raw = f.read()
    try:
        data = json.loads(raw) if path.endswith(".json") else yaml.safe_load(raw)
    except (ValueError, yaml.YAMLError) as err:
        raise WorkflowError(f"Could not parse {path}: {err}") from err
    return validate_workflow(data)


class WorkflowParser:
    """Backwards-compatible entry points."""

    @staticmethod
    def parse_dict(data: dict) -> Dict[str, Any]:
        return validate_workflow(data)

    @staticmethod
    def parse_json(json_str: str) -> Dict[str, Any]:
        return validate_workflow(json.loads(json_str))
