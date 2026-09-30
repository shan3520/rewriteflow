"""Unit test for verifying preset YAML workflows."""
import unittest
import os

class TestPresets(unittest.TestCase):
    def test_presets_exist(self):
        preset_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "presets")
        files = os.listdir(preset_dir)
        self.assertIn("academic_paper.yaml", files)
        self.assertIn("technical_doc_generator.yaml", files)

if __name__ == "__main__":
    unittest.main()
