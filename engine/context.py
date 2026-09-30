"""Pipeline execution context."""
import time
from typing import Any, Callable, Dict, List, Optional


class StepResult:
    def __init__(self, node_name: str, input_text: str, output_text: str, duration_ms: float, metadata: Optional[Dict[str, Any]] = None):
        self.node_name = node_name
        self.input_text = input_text
        self.output_text = output_text
        self.duration_ms = duration_ms
        self.metadata = metadata or {}


class PipelineContext:
    """Carries the text through the nodes, plus the LLM client and a history of each step."""

    def __init__(self, initial_text: str, variables: Optional[Dict[str, Any]] = None, llm=None,
                 on_progress: Optional[Callable[[int, int], None]] = None):
        self.text = initial_text
        self.original_text = initial_text
        self.variables = variables or {}
        self.llm = llm
        self.on_progress = on_progress
        self.history: List[StepResult] = []
        self.logs: List[str] = []
        self.start_time = time.time()

    def update_text(self, new_text: str, node_name: str, duration_ms: float, metadata: Optional[Dict[str, Any]] = None):
        self.history.append(StepResult(node_name, self.text, new_text, duration_ms, metadata))
        self.text = new_text

    def add_log(self, message: str):
        self.logs.append(f"[{time.strftime('%H:%M:%S')}] {message}")

    def total_duration_ms(self) -> float:
        return (time.time() - self.start_time) * 1000.0

    def clear_logs(self):
        self.logs.clear()
