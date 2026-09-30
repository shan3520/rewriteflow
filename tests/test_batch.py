"""Batch processing of files and folders."""
import os
import tempfile
import unittest

from engine.batch import collect_files, process_files
from tests.helpers import FakeLLM


class TestBatch(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = self.tmp.name
        os.makedirs(os.path.join(self.dir, "in", "sub"))
        os.makedirs(os.path.join(self.dir, "in", ".hidden"))
        self.write("in/a.txt", "The big plan grew.")
        self.write("in/sub/b.md", "# Notes\n\nBig news.")
        self.write("in/skip.png", "binary")
        self.write("in/.hidden/c.txt", "hidden")
        self.write("in/empty.txt", "   ")

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, rel, text):
        with open(os.path.join(self.dir, rel), "w") as f:
            f.write(text)

    def test_collect_files_recurses_text_files_only(self):
        found = collect_files([os.path.join(self.dir, "in")])
        self.assertEqual([rel for _, rel in found], ["a.txt", "empty.txt", os.path.join("sub", "b.md")])
        with self.assertRaises(FileNotFoundError):
            collect_files([os.path.join(self.dir, "missing")])

    def test_process_writes_outputs_and_reports_failures(self):
        out = os.path.join(self.dir, "out")
        events = []
        files = collect_files([os.path.join(self.dir, "in")])
        results = process_files(files, "SYS", FakeLLM(), out, workers=2, on_event=lambda k, i: events.append(k))
        self.assertEqual([r["status"] for r in results], ["ok", "error", "ok"])
        self.assertIn("empty", results[1]["error"])
        with open(os.path.join(out, "a.txt")) as f:
            self.assertEqual(f.read(), "The large plan increased.\n")
        self.assertTrue(os.path.exists(os.path.join(out, "sub", "b.md")))
        self.assertEqual(events.count("done"), 2)
        self.assertEqual(events.count("error"), 1)

    def test_llm_failure_is_per_file(self):
        files = collect_files([os.path.join(self.dir, "in", "a.txt"), os.path.join(self.dir, "in", "sub", "b.md")])
        results = process_files(files, "SYS", FakeLLM(fail_on="Big news"), os.path.join(self.dir, "out"))
        self.assertEqual([r["status"] for r in results], ["ok", "error"])
        self.assertIn("model unavailable", results[1]["error"])

    def test_refuses_to_overwrite_input(self):
        src = os.path.join(self.dir, "in", "a.txt")
        results = process_files([(src, "a.txt")], "SYS", FakeLLM(), os.path.join(self.dir, "in"))
        self.assertEqual(results[0]["status"], "error")
        with open(src) as f:
            self.assertEqual(f.read(), "The big plan grew.")


if __name__ == "__main__":
    unittest.main()
