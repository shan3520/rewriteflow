"""Final System Validation Test Suite."""
import unittest
from engine.telemetry import get_telemetry_report
from engine.runner import PipelineRunner
from engine.nodes.grammar import GrammarFixNode

class TestSystemValidation(unittest.TestCase):
    def test_telemetry(self):
        report = get_telemetry_report()
        self.assertEqual(report["engine_version"], "1.2.0")

    def test_engine_smoke(self):
        runner = PipelineRunner([GrammarFixNode()])
        ctx = runner.run("hello world")
        self.assertTrue(ctx.text)

if __name__ == "__main__":
    unittest.main()
