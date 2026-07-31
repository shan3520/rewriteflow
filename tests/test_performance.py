"""Performance & latency unit tests."""
import unittest
import time
from engine.nodes.grammar import GrammarFixNode
from engine.context import PipelineContext

class TestPerformance(unittest.TestCase):
    def test_node_latency(self):
        node = GrammarFixNode()
        ctx = PipelineContext("sample text for latency test " * 50)
        start = time.time()
        node.run(ctx)
        elapsed_ms = (time.time() - start) * 1000
        self.assertLess(elapsed_ms, 100.0)

if __name__ == "__main__":
    unittest.main()
