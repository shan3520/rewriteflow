"""Unit tests for PipelineContext and PipelineRunner."""
import unittest
from engine.context import PipelineContext
from engine.nodes.base import BaseNode, NodeResult
from engine.runner import PipelineRunner

class UpperNode(BaseNode):
    def __init__(self):
        super().__init__("UpperNode")

    def execute(self, text: str, context: PipelineContext) -> NodeResult:
        return NodeResult(text.upper(), {"transformed": True})

class TestPipelineCore(unittest.TestCase):
    def test_context_initialization(self):
        ctx = PipelineContext("hello world")
        self.assertEqual(ctx.text, "hello world")
        self.assertEqual(ctx.original_text, "hello world")

    def test_runner_execution(self):
        runner = PipelineRunner([UpperNode()])
        ctx = runner.run("hello world")
        self.assertEqual(ctx.text, "HELLO WORLD")
        self.assertEqual(len(ctx.history), 1)
        self.assertEqual(ctx.history[0].node_name, "UpperNode")

if __name__ == "__main__":
    unittest.main()
