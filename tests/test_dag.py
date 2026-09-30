"""Dependency ordering and the node registry."""
import unittest

from engine.dag import DAGSolver
from engine.nodes.cleanup import TextCleanupNode
from engine.registry import NodeRegistry


class TestDAGAndRegistry(unittest.TestCase):
    def test_dag_solver(self):
        order = DAGSolver({"nodeB": ["nodeA"], "nodeC": ["nodeB"]}).get_execution_order()
        self.assertEqual(order, ["nodeA", "nodeB", "nodeC"])

    def test_builtin_nodes_are_registered(self):
        self.assertIn("tidy_markdown", NodeRegistry.list_nodes())
        self.assertIsInstance(NodeRegistry.create("tidy_whitespace"), TextCleanupNode)
        with self.assertRaisesRegex(ValueError, "Available"):
            NodeRegistry.create("nope")


if __name__ == "__main__":
    unittest.main()
