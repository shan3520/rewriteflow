"""Unit tests for plugin sandbox."""
import unittest
from engine.plugins.sandbox import ScriptSandbox

class TestPlugins(unittest.TestCase):
    def test_sandbox_exec(self):
        code = "output_text = input_text.upper()"
        out = ScriptSandbox.execute_transform(code, "hello")
        self.assertEqual(out, "HELLO")

if __name__ == "__main__":
    unittest.main()
