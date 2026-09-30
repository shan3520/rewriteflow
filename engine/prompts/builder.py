"""Builds system prompts exactly as the web backend does (backend/src/lib/prompts.js)."""
from typing import Any, Dict, List, Optional

from engine.library import load_library
from engine.prompts.template import fill_params


def _option_lines(library, options: Optional[Dict[str, str]]) -> List[str]:
    options = options or {}
    lines = []
    for name, choices in library["options"].items():
        line = choices.get(options.get(name, ""), "")
        if line:
            lines.append(line)
    return lines


def _finish(library, parts: List[str], options) -> str:
    pieces = parts + _option_lines(library, options) + [library["preserveRule"], library["outputRule"]]
    return "\n\n".join(p for p in pieces if p)


def build_mode_prompt(mode: str, options: Optional[Dict[str, str]] = None, library=None) -> str:
    library = library or load_library()
    if mode not in library["modes"]:
        raise ValueError(f"Unknown mode '{mode}'. Modes: {', '.join(library['modes'])}")
    return _finish(library, [library["modes"][mode]["prompt"]], options)


def build_workflow_prompt(workflow: Dict[str, Any], options: Optional[Dict[str, str]] = None, library=None) -> str:
    library = library or load_library()
    parts = ["You are a careful editor."]
    steps = workflow.get("steps") or []
    if steps:
        lines = []
        for i, step in enumerate(steps, 1):
            definition = library["steps_by_id"].get(step["id"])
            if not definition:
                raise ValueError(f"Unknown step '{step['id']}'")
            lines.append(f"{i}. {fill_params(definition['instruction'], definition.get('params'), step.get('params'))}")
        parts.append("Apply the following edits to the text, in order:\n" + "\n".join(lines))
    instruction = (workflow.get("custom_instruction") or "").strip()
    if instruction:
        parts.append(f"Additional instructions from the user:\n{instruction}")
    return _finish(library, parts, options)
