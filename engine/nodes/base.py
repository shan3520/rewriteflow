"""Base abstract node for RewriteFlow transformations."""
from abc import ABC, abstractmethod
import time
from typing import Dict, Any, Optional
from engine.context import PipelineContext

class NodeResult:
    def __init__(self, output_text: str, metadata: Optional[Dict[str, Any]] = None):
        self.output_text = output_text
        self.metadata = metadata or {}

class BaseNode(ABC):
    def __init__(self, name: str, config: Optional[Dict[str, Any]] = None):
        self.name = name
        self.config = config or {}

    def get_option(self, key: str, default: Any = None) -> Any:
        return self.config.get(key, default)

    @abstractmethod
    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        pass

    def run(self, context: PipelineContext) -> str:
        context.add_log(f"Starting node: {self.name}")
        start = time.time()
        result = self.execute(context.text, context)
        duration_ms = (time.time() - start) * 1000.0
        context.update_text(result.output_text, self.name, duration_ms, result.metadata)
        context.add_log(f"Completed node: {self.name} in {duration_ms:.2f}ms")
        return result.output_text
