"""Unit tests for audit logger and hallucination detector."""
import unittest
from engine.context import PipelineContext
from engine.nodes.hallucination import HallucinationDetectorNode
from engine.audit.logger import ContentAuditLogger

class TestAuditAndGuards(unittest.TestCase):
    def test_hallucination_guard(self):
        ctx = PipelineContext("In 2026 we start.")
        node = HallucinationDetectorNode()
        res = node.execute("In 2030 we start.", ctx)
        self.assertIn("2030", res.metadata["flagged_hallucinations"])

    def test_audit_record(self):
        rec = ContentAuditLogger.create_audit_record("a", "b")
        self.assertIn("input_hash", rec)

if __name__ == "__main__":
    unittest.main()
