"""Unit tests for WorkflowParser."""
import unittest
from engine.parser import WorkflowParser

class TestWorkflowParser(unittest.TestCase):
    def test_parse_json(self):
        json_data = '{"name": "Test", "nodes": [{"type": "GrammarFixNode"}]}'
        parsed = WorkflowParser.parse_json(json_data)
        self.assertEqual(parsed["name"], "Test")
        self.assertEqual(len(parsed["nodes"]), 1)

if __name__ == "__main__":
    unittest.main()
