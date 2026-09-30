"""Loads a custom node class and registers it for use under `post:`.

    python -m engine run --workflow my.yaml --plugin ./my_nodes.py:BritishSpelling notes.md

The class must subclass engine.nodes.base.BaseNode. Plugins run with your own
permissions; only load files you trust.
"""
import importlib
import importlib.util
import os
from typing import Type

from engine.nodes.base import BaseNode
from engine.registry import NodeRegistry


class PluginError(ValueError):
    pass


def load_plugin_class(spec: str) -> Type[BaseNode]:
    """spec is "path/to/file.py:ClassName" or "package.module:ClassName"."""
    if ":" not in spec:
        raise PluginError(f"Plugin '{spec}' must look like file.py:ClassName or module:ClassName")
    target, class_name = spec.rsplit(":", 1)
    if target.endswith(".py"):
        if not os.path.isfile(target):
            raise PluginError(f"Plugin file not found: {target}")
        module_name = f"rewriteflow_plugin_{os.path.splitext(os.path.basename(target))[0]}"
        module_spec = importlib.util.spec_from_file_location(module_name, target)
        module = importlib.util.module_from_spec(module_spec)
        module_spec.loader.exec_module(module)
    else:
        module = importlib.import_module(target)
    cls = getattr(module, class_name, None)
    if not (isinstance(cls, type) and issubclass(cls, BaseNode)):
        raise PluginError(f"{class_name} in {target} is not a BaseNode subclass")
    return cls


def register_plugin(spec: str, name: str = None) -> str:
    """Loads and registers a plugin; returns the name to use in `post:`."""
    cls = load_plugin_class(spec)
    name = name or spec.rsplit(":", 1)[1]
    NodeRegistry.register(name, cls)
    return name


class PluginLoader:
    """Backwards-compatible entry point."""

    @staticmethod
    def load_plugin_class(module_name: str, class_name: str) -> Type[BaseNode]:
        return load_plugin_class(f"{module_name}:{class_name}")
