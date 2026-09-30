"""Custom post-processing nodes loaded from files or modules."""
import os
import tempfile
import unittest

from engine.plugins.loader import PluginError, PluginLoader, load_plugin_class, register_plugin
from engine.registry import NodeRegistry
from engine.runner import rewrite_document
from tests.helpers import FakeLLM

PLUGIN = """
from engine.nodes.base import BaseNode, NodeResult

class BritishSpelling(BaseNode):
    def __init__(self, config=None):
        super().__init__("BritishSpelling", config)

    def execute(self, text, context):
        return NodeResult(text.replace("color", "colour"))

NOT_A_NODE = 42
"""


class TestPlugins(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = os.path.join(self.tmp.name, "spelling.py")
        with open(self.path, "w") as f:
            f.write(PLUGIN)

    def tearDown(self):
        self.tmp.cleanup()

    def test_load_register_and_run(self):
        name = register_plugin(f"{self.path}:BritishSpelling", name="british")
        self.assertIn("british", NodeRegistry.list_nodes())
        result = rewrite_document("The color is big.", "SYS", FakeLLM(), post=[name])
        self.assertEqual(result["output"], "The colour is large.")

    def test_module_spec(self):
        cls = PluginLoader.load_plugin_class("engine.nodes.cleanup", "TextCleanupNode")
        self.assertEqual(cls.__name__, "TextCleanupNode")

    def test_errors(self):
        for spec, message in [
            ("no-colon", "must look like"),
            (os.path.join(self.tmp.name, "missing.py:X"), "not found"),
            (f"{self.path}:NOT_A_NODE", "not a BaseNode"),
            (f"{self.path}:Missing", "not a BaseNode"),
        ]:
            with self.subTest(spec):
                with self.assertRaisesRegex(PluginError, message):
                    load_plugin_class(spec)


if __name__ == "__main__":
    unittest.main()
