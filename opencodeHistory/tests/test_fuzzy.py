import unittest
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from opencode_history.fuzzy import fuzzy_match, fuzzy_search, highlight_fuzzy


class TestFuzzyMatch(unittest.TestCase):
    def test_exact_substring(self):
        matched, score, pos = fuzzy_match("login", "fix login bug")
        self.assertTrue(matched)
        self.assertGreater(score, 100)
        self.assertEqual(len(pos), 5)

    def test_fuzzy_chars(self):
        matched, score, pos = fuzzy_match("lgn", "fix login bug")
        self.assertTrue(matched)
        self.assertEqual(len(pos), 3)

    def test_no_match(self):
        matched, score, pos = fuzzy_match("xyz", "fix login bug")
        self.assertFalse(matched)

    def test_empty_query(self):
        matched, score, pos = fuzzy_match("", "hello")
        self.assertTrue(matched)
        self.assertEqual(score, 0)

    def test_case_insensitive(self):
        matched, score, pos = fuzzy_match("LOGIN", "fix login bug")
        self.assertTrue(matched)

    def test_word_boundary_bonus(self):
        _, score1, _ = fuzzy_match("l", "login bug")
        _, score2, _ = fuzzy_match("l", "hello")
        self.assertGreater(score1, score2)


class TestFuzzySearch(unittest.TestCase):
    def test_search_dicts(self):
        items = [
            {"title": "Fix login bug", "id": "1"},
            {"title": "Add dark mode", "id": "2"},
            {"title": "Login page redesign", "id": "3"},
        ]
        results = fuzzy_search("login", items, key="title")
        self.assertEqual(len(results), 2)
        self.assertIn(results[0][0]["id"], ["1", "3"])

    def test_search_strings(self):
        items = ["hello world", "fix bug", "hello there"]
        results = fuzzy_search("hello", items)
        self.assertEqual(len(results), 2)


class TestHighlightFuzzy(unittest.TestCase):
    def test_highlight(self):
        result = highlight_fuzzy("hello world", [0, 1, 2, 3, 4])
        self.assertIn("\033[", result)
        self.assertIn("hello", result)

    def test_no_positions(self):
        result = highlight_fuzzy("hello world", [])
        self.assertEqual(result, "hello world")


if __name__ == "__main__":
    unittest.main()
