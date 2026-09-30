"""Workflow file loading and validation."""
import json
import os
import tempfile
import unittest

from engine.parser import WorkflowError, WorkflowParser, load_workflow, validate_workflow


class TestWorkflowParser(unittest.TestCase):
    def test_normalizes_steps(self):
        wf = validate_workflow({"name": " Mine ", "steps": ["grammar", {"id": "translate", "params": {"lang": "French"}}]})
        self.assertEqual(wf["name"], "Mine")
        self.assertEqual(wf["steps"], [{"id": "grammar"}, {"id": "translate", "params": {"lang": "French"}}])
        self.assertEqual(wf["post"], [])

    def test_rejects_bad_workflows(self):
        bad = [
            ({"steps": ["grammar"]}, "name"),
            ({"name": "x", "steps": ["nope"]}, "Unknown step"),
            ({"name": "x", "steps": [{"id": "translate", "params": {"color": "red"}}]}, "Unknown param"),
            ({"name": "x", "steps": ["grammar"] * 11}, "at most 10"),
            ({"name": "x", "steps": []}, "at least one step"),
            ({"name": "x", "steps": ["grammar"], "post": "tidy"}, "post must be a list"),
            ("not a mapping", "mapping"),
        ]
        for data, message in bad:
            with self.subTest(data):
                with self.assertRaisesRegex(WorkflowError, message):
                    validate_workflow(data)

    def test_instruction_only_workflow(self):
        self.assertEqual(validate_workflow({"name": "x", "custom_instruction": "Fix typos"})["steps"], [])

    def test_loads_yaml_and_json_files(self):
        with tempfile.TemporaryDirectory() as d:
            y = os.path.join(d, "w.yaml")
            with open(y, "w") as f:
                f.write("name: Y\nsteps: [grammar, concise]\npost: [tidy_markdown]\n")
            j = os.path.join(d, "w.json")
            with open(j, "w") as f:
                json.dump({"name": "J", "steps": ["formal"]}, f)
            self.assertEqual(load_workflow(y)["post"], ["tidy_markdown"])
            self.assertEqual(load_workflow(j)["name"], "J")
            broken = os.path.join(d, "broken.yaml")
            with open(broken, "w") as f:
                f.write("name: [unclosed\n")
            with self.assertRaisesRegex(WorkflowError, "Could not parse"):
                load_workflow(broken)

    def test_missing_file_lists_presets(self):
        with self.assertRaisesRegex(WorkflowError, "email_polish"):
            load_workflow("does-not-exist")

    def test_legacy_parser_api(self):
        self.assertEqual(WorkflowParser.parse_json('{"name": "x", "steps": ["grammar"]}')["name"], "x")


if __name__ == "__main__":
    unittest.main()
