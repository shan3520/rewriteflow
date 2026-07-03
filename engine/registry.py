"""Dynamic node registry."""
from typing import Dict, Type
from engine.nodes.base import BaseNode

class NodeRegistry:
    _registry: Dict[str, Type[BaseNode]] = {}

    @classmethod
    def register(cls, name: str, node_cls: Type[BaseNode]):
        cls._registry[name] = node_cls

    @classmethod
    def create(cls, name: str, config: dict = None) -> BaseNode:
        if name not in cls._registry:
            raise ValueError(f"Unknown node type: {name}")
        return cls._registry[name](config=config)

    @classmethod
    def list_nodes(cls) -> list:
        return list(cls._registry.keys())
