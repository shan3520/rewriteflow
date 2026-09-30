"""End-to-end CLI tests with a fake LLM."""
import contextlib
import io
import json
import os
import sys
import tempfile
import unittest
from unittest import mock

from engine import cli
from tests.helpers import FakeLLM


def run_cli(*argv, stdin=None, llm=None):
    out, err = io.StringIO(), io.StringIO()
    llm = llm or FakeLLM()
    with mock.patch.object(cli, "make_client", return_value=llm), \
            contextlib.redirect_stdout(out), contextlib.redirect_stderr(err), \
            mock.patch.object(sys, "stdin", io.StringIO(stdin or "")):
        code = cli.main(list(argv))
    return code, out.getvalue(), err.getvalue(), llm


class TestCLI(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = self.tmp.name
        self.src = os.path.join(self.dir, "draft.md")
        with open(self.src, "w") as f:
            f.write("Revenue grew 12% this year.\n\nThe big launch is next.")

    def tearDown(self):
        self.tmp.cleanup()

    def test_steps_and_presets(self):
        code, out, _, _ = run_cli("steps")
        self.assertEqual(code, 0)
        self.assertIn("translate", out)
        self.assertIn("params: lang=Spanish", out)
        code, out, _, _ = run_cli("presets")
        self.assertIn("email_polish", out)

    def test_run_workflow_on_files_with_report(self):
        out_dir = os.path.join(self.dir, "out")
        report = os.path.join(self.dir, "report.json")
        code, _, err, llm = run_cli("run", "--workflow", "email_polish", "--length", "shorter", self.src, "--out", out_dir, "--report", report)
        self.assertEqual(code, 0, err)
        with open(os.path.join(out_dir, "draft.md")) as f:
            self.assertEqual(f.read(), "Revenue increased 12% this year.\n\nThe large launch is next.\n")
        system = llm.calls[0][0]
        self.assertIn("1. Correct spelling", system)
        self.assertIn("noticeably shorter", system)
        self.assertIn("Done: 1 rewritten, 0 failed", err)
        self.assertIn(f"→ {os.path.join(out_dir, 'draft.md')} (2 paragraph(s)", err)
        with open(report) as f:
            data = json.load(f)
        self.assertEqual(data["source"], {"workflow": "Email Polish"})
        self.assertEqual(data["summary"], {"ok": 1, "failed": 0, "details_to_check": 0})
        self.assertEqual(len(data["files"][0]["audit"]["input_sha256"]), 64)
        self.assertEqual(data["files"][0]["output_path"], os.path.join(out_dir, "draft.md"))

    def test_run_mode_flags_lost_details(self):
        code, _, err, _ = run_cli("run", "--mode", "simplified", self.src, "--out", os.path.join(self.dir, "o"), llm=FakeLLM(drop_percent=True))
        self.assertEqual(code, 0)
        self.assertIn("1 detail to check", err)

    def test_stdin_to_stdout(self):
        code, out, err, llm = run_cli("run", "--steps", "grammar,translate", "--param", "translate.lang=German", "-", stdin="It grew.")
        self.assertEqual(code, 0)
        self.assertEqual(out, "It increased.\n")
        self.assertIn("into German", llm.calls[0][0])
        self.assertIn("details preserved", err)

    def test_dry_run_prints_prompt_without_calling_api(self):
        code, out, _, llm = run_cli("run", "--instruction", "Only fix typos.", "--dry-run", "x.txt")
        self.assertEqual(code, 0)
        self.assertIn("Only fix typos.", out)
        self.assertEqual(llm.calls, [])

    def test_usage_errors(self):
        self.assertEqual(run_cli("run", "--mode", "standard", "--workflow", "email_polish", self.src)[0], 2)
        self.assertEqual(run_cli("run", "--workflow", "nope", self.src)[0], 2)
        self.assertEqual(run_cli("run", "--steps", "grammar", "--param", "bad", self.src)[0], 2)
        self.assertEqual(run_cli("run", os.path.join(self.dir, "missing.txt"))[0], 2)

    def test_failures_set_exit_code(self):
        code, _, err, _ = run_cli("run", self.src, "--out", os.path.join(self.dir, "o"), llm=FakeLLM(fail_on="Revenue"))
        self.assertEqual(code, 1)
        self.assertIn("failed: model unavailable", err)

    def test_validate_and_analyze(self):
        bad = os.path.join(self.dir, "bad.yaml")
        with open(bad, "w") as f:
            f.write("name: x\nsteps: [nope]\n")
        code, out, _, _ = run_cli("validate", "presets/email_polish.yaml", bad)
        self.assertEqual(code, 1)
        self.assertIn("ok     presets/email_polish.yaml", out)
        self.assertIn("Unknown step 'nope'", out)

        rewritten = os.path.join(self.dir, "new.md")
        with open(rewritten, "w") as f:
            f.write("Revenue increased this year.\n\nThe large launch is next.")
        code, out, _, _ = run_cli("analyze", self.src, rewritten)
        self.assertEqual(code, 0)
        self.assertIn("missing  Number    12%", out)
        code, out, _, _ = run_cli("analyze", self.src, rewritten, "--json")
        self.assertEqual(json.loads(out)["issues"], 1)

    def test_plugin_post_node(self):
        plugin = os.path.join(self.dir, "shout.py")
        with open(plugin, "w") as f:
            f.write(
                "from engine.nodes.base import BaseNode, NodeResult\n"
                "class Shout(BaseNode):\n"
                "    def __init__(self, config=None):\n"
                "        super().__init__('Shout', config)\n"
                "    def execute(self, text, context):\n"
                "        return NodeResult(text.upper())\n"
            )
        code, out, err, _ = run_cli("run", "--plugin", f"{plugin}:Shout", "--post", "Shout", "-", stdin="quiet words")
        self.assertEqual(code, 0, err)
        self.assertEqual(out, "QUIET WORDS\n")


if __name__ == "__main__":
    unittest.main()
