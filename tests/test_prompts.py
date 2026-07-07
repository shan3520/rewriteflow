"""Unit tests for prompt templates and few-shot formatting."""
import unittest
from engine.prompts.template import PromptTemplate
from engine.prompts.few_shot import FewShotPromptManager

class TestPrompts(unittest.TestCase):
    def test_template_render(self):
        tmpl = PromptTemplate("Hello {{ name }}, tone is {{ tone }}.")
        rendered = tmpl.render({"name": "User", "tone": "formal"})
        self.assertEqual(rendered, "Hello User, tone is formal.")

    def test_few_shot_manager(self):
        mgr = FewShotPromptManager()
        mgr.add_example("can't", "cannot")
        formatted = mgr.format_examples()
        self.assertIn("Input: can't", formatted)

if __name__ == "__main__":
    unittest.main()

from engine.prompts.chain_of_thought import CoTReasoningBuilder
from engine.prompts.versioning import PromptVersionManager

class TestCoTAndVersioning(unittest.TestCase):
    def test_cot_builder(self):
        cot = CoTReasoningBuilder()
        prompt = cot.build_prompt("Sample text")
        self.assertIn("Think step by step:", prompt)

    def test_version_manager(self):
        mgr = PromptVersionManager()
        mgr.register_version("tone", "v1.0", "Draft template {{ text }}")
        self.assertEqual(mgr.get_template("tone", "v1.0"), "Draft template {{ text }}")
