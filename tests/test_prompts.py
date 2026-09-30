"""Prompt building must match the backend exactly (shared/fixtures/prompts.json)."""
import unittest

from engine.prompts.builder import build_mode_prompt, build_workflow_prompt
from engine.prompts.template import PromptTemplate, fill_params
from tests.helpers import fixture


class TestPrompts(unittest.TestCase):
    def test_matches_backend(self):
        for case in fixture("prompts.json"):
            with self.subTest(case.get("mode") or case["workflow"]):
                if case["kind"] == "mode":
                    actual = build_mode_prompt(case["mode"], case["options"])
                else:
                    actual = build_workflow_prompt(case["workflow"], case["options"])
                self.assertEqual(actual, case["expected"])

    def test_unknown_mode_and_step(self):
        with self.assertRaises(ValueError):
            build_mode_prompt("nope")
        with self.assertRaises(ValueError):
            build_workflow_prompt({"steps": [{"id": "nope"}]})

    def test_fill_params(self):
        defs = {"lang": {"default": "Spanish"}}
        self.assertEqual(fill_params("into {lang}", defs, {"lang": " German "}), "into German")
        self.assertEqual(fill_params("into {lang}", defs), "into Spanish")
        self.assertEqual(fill_params("x {missing}", {}), "x ")

    def test_prompt_template(self):
        self.assertEqual(PromptTemplate("Hi {{ name }}, {{other}}").render({"name": "Ana"}), "Hi Ana, {{other}}")


if __name__ == "__main__":
    unittest.main()
