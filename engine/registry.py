"""Registry of local post-processing nodes that workflows can name under `post:`."""
from typing import Dict, Type

from engine.nodes.base import BaseNode
from engine.nodes.cleanup import TextCleanupNode
from engine.nodes.formatting import MarkdownFormattingNode


class NodeRegistry:
    _registry: Dict[str, Type[BaseNode]] = {}

    @classmethod
    def register(cls, name: str, node_cls: Type[BaseNode]):
        cls._registry[name] = node_cls

    @classmethod
    def create(cls, name: str, config: dict = None) -> BaseNode:
        if name not in cls._registry:
            raise ValueError(f"Unknown node '{name}'. Available: {', '.join(sorted(cls._registry))}")
        return cls._registry[name](config=config)

    @classmethod
    def list_nodes(cls) -> list:
        return sorted(cls._registry)


NodeRegistry.register("tidy_whitespace", TextCleanupNode)
NodeRegistry.register("tidy_markdown", MarkdownFormattingNode)
