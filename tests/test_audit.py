"""Audit hashes and the JSON run log."""
import hashlib
import json
import os
import tempfile
import unittest

from engine.audit.logger import ContentAuditLogger
from engine.telemetry import RunLog, estimate_tokens, get_telemetry_report


class TestAudit(unittest.TestCase):
    def test_hashes(self):
        record = ContentAuditLogger.create_audit_record("in", "out")
        self.assertEqual(record["input_sha256"], hashlib.sha256(b"in").hexdigest())
        self.assertEqual(record["output_sha256"], hashlib.sha256(b"out").hexdigest())

    def test_run_log(self):
        log = RunLog({"mode": "standard"})
        log.add({"source": "a.txt", "output_path": "out/a.txt", "status": "ok", "input_text": "abcd", "output": "rewritten",
                 "seconds": 1.2, "paragraphs": 1, "report": {"issues": 2}})
        log.add({"source": "b.txt", "output_path": "out/b.txt", "status": "error", "error": "boom"})
        data = log.to_dict()
        self.assertEqual(data["summary"], {"ok": 1, "failed": 1, "details_to_check": 2})
        self.assertEqual(data["files"][1]["error"], "boom")
        self.assertEqual(data["files"][0]["output_path"], "out/a.txt")
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "r.json")
            log.write(path)
            with open(path) as f:
                self.assertEqual(json.load(f)["source"], {"mode": "standard"})

    def test_estimates_and_telemetry(self):
        self.assertEqual(estimate_tokens("abcdefgh"), 2)
        self.assertIn("engine_version", get_telemetry_report())


if __name__ == "__main__":
    unittest.main()
