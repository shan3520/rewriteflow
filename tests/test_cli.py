"""Integration tests for CLI benchmark commands."""
import unittest
from engine.benchmark import run_benchmark
from engine.runner import PipelineRunner
from engine.nodes.grammar import GrammarFixNode

class TestCLIBenchmark(unittest.TestCase):
    def test_benchmark(self):
        runner = PipelineRunner([GrammarFixNode()])
        res = run_benchmark(runner, ["test one", "test two"])
        self.assertEqual(res["total_items"], 2)

if __name__ == "__main__":
    unittest.main()
