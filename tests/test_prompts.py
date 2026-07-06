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
