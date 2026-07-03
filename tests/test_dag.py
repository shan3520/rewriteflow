"""Unit tests for DAGSolver and NodeRegistry."""
import unittest
from engine.dag import DAGSolver
from engine.registry import NodeRegistry
from engine.nodes.grammar import GrammarFixNode

class TestDAGAndRegistry(unittest.TestCase):
    def test_dag_solver(self):
        deps = {
            "nodeB": ["nodeA"],
            "nodeC": ["nodeB"]
        }
        solver = DAGSolver(deps)
        order = solver.get_execution_order()
        self.assertEqual(order, ["nodeA", "nodeB", "nodeC"])

    def test_node_registry(self):
        NodeRegistry.register("grammar", GrammarFixNode)
        node = NodeRegistry.create("grammar")
        self.assertEqual(node.name, "GrammarFixNode")

if __name__ == "__main__":
    unittest.main()
