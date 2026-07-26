"""Dynamic plugin class loader."""
from typing import Type
from engine.nodes.base import BaseNode

class PluginLoader:
    @staticmethod
    def load_plugin_class(module_name: str, class_name: str) -> Type[BaseNode]:
        mod = __import__(module_name, fromlist=[class_name])
        return getattr(mod, class_name)
