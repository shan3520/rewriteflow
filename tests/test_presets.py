"""Starter workflows in presets/ are valid and shared with the web app."""
import unittest

from engine.parser import list_presets, load_workflow


class TestPresets(unittest.TestCase):
    def test_presets_exist_and_validate(self):
        presets = list_presets()
        self.assertIn("email_polish", presets)
        self.assertIn("technical_doc_generator", presets)
        for name in presets:
            with self.subTest(name):
                wf = load_workflow(name)
                self.assertTrue(wf["steps"])
                self.assertTrue(wf["description"])


if __name__ == "__main__":
    unittest.main()
