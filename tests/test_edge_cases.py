"""Text helpers and edge-case inputs."""
import unittest

from engine.metrics.readability import analyze
from engine.nodes.hallucination import check_meaning
from engine.text import collapse_whitespace, count_words, normalize_text, split_paragraphs


class TestEdgeCases(unittest.TestCase):
    def test_normalize(self):
        self.assertEqual(normalize_text("café\r\nx\ry"), "café\nx\ny")

    def test_paragraphs(self):
        self.assertEqual(split_paragraphs("  a \n\n\n b\n\n   \n\n"), ["a", "b"])
        self.assertEqual(split_paragraphs(""), [])

    def test_whitespace_and_words(self):
        self.assertEqual(collapse_whitespace(" a\t b\n c "), "a b c")
        self.assertEqual(count_words("  one two\nthree "), 3)

    def test_non_ascii_and_empty_inputs(self):
        self.assertEqual(analyze("")["words"], 0)
        self.assertEqual(check_meaning("", ""), {"checked": 0, "missing": [], "added": []})
        result = check_meaning("Ünïcode café in 2024.", "Café in 2024.")
        self.assertEqual(result["missing"], [])


if __name__ == "__main__":
    unittest.main()
