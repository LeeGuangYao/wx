import unittest
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from opencode_history.summarizer import (
    is_default_title,
    generate_title,
    generate_summary,
    generate_tags,
    extract_keywords,
    calculate_importance,
    summarize,
)


class TestIsDefaultTitle(unittest.TestCase):
    def test_empty(self):
        self.assertTrue(is_default_title(""))
        self.assertTrue(is_default_title("   "))

    def test_new_session(self):
        self.assertTrue(is_default_title("New session - 2024-01-01"))

    def test_real_title(self):
        self.assertFalse(is_default_title("Fix login bug"))
        self.assertFalse(is_default_title("实现用户认证"))


class TestGenerateTitle(unittest.TestCase):
    def test_uses_session_title(self):
        self.assertEqual(generate_title("Fix bug", "hello", "slug"), "Fix bug")

    def test_falls_back_to_first_msg(self):
        result = generate_title("New session", "检查排序逻辑", "slug")
        self.assertEqual(result, "检查排序逻辑")

    def test_strips_file_refs(self):
        result = generate_title("New session", "@file.py 修复问题", "slug")
        self.assertEqual(result, "修复问题")

    def test_falls_back_to_slug(self):
        result = generate_title("New session", "", "happy-otter")
        self.assertEqual(result, "happy-otter")


class TestGenerateSummary(unittest.TestCase):
    def test_with_message_and_ops(self):
        result = generate_summary("修复登录问题", 5, 3, 50, 10, ["edit", "bash"])
        self.assertIn("修复登录问题", result)
        self.assertIn("修改 3 个文件", result)

    def test_empty(self):
        result = generate_summary("", 0, 0, 0, 0, [])
        self.assertEqual(result, "空会话")

    def test_message_only(self):
        result = generate_summary("你好", 0, 0, 0, 0, [])
        self.assertIn("你好", result)


class TestGenerateTags(unittest.TestCase):
    def test_coding_tools(self):
        tags = generate_tags(["edit", "write", "bash"], "myapp", [])
        self.assertIn("coding", tags)
        self.assertIn("cli", tags)
        self.assertIn("myapp", tags)

    def test_with_todos(self):
        tags = generate_tags(["read"], "proj", [{"content": "task1"}])
        self.assertIn("task-tracked", tags)

    def test_no_tools(self):
        tags = generate_tags([], "global", [])
        self.assertEqual(tags, ["general"])


class TestExtractKeywords(unittest.TestCase):
    def test_from_message(self):
        kws = extract_keywords("实现用户认证功能", [])
        self.assertIn("实现用户认证功能", kws)

    def test_from_mixed_message(self):
        kws = extract_keywords("修复 login 页面 bug", [])
        self.assertIn("login", kws)
        self.assertIn("修复", kws)
        self.assertIn("页面", kws)

    def test_from_tool_paths(self):
        kws = extract_keywords(
            "", [{"name": "edit", "input": {"filePath": "/src/auth/login.py"}}]
        )
        self.assertIn("login", kws)
        self.assertIn("login.py", kws)

    def test_from_bash_commands(self):
        kws = extract_keywords(
            "", [{"name": "bash", "input": {"command": "git log --oneline"}}]
        )
        self.assertIn("git", kws)

    def test_limit_15(self):
        msg = " ".join(f"word{i}" for i in range(30))
        kws = extract_keywords(msg, [])
        self.assertLessEqual(len(kws), 15)


class TestCalculateImportance(unittest.TestCase):
    def test_base(self):
        self.assertEqual(calculate_importance(2, 1, 0, 0, 0, []), 2)

    def test_high(self):
        score = calculate_importance(20, 15, 5, 100, 50, [{"content": "x"}])
        self.assertEqual(score, 5)

    def test_medium(self):
        score = calculate_importance(12, 5, 3, 20, 5, [])
        self.assertEqual(score, 4)


class TestSummarize(unittest.TestCase):
    def test_full(self):
        parsed = {
            "session": {
                "id": "ses_123",
                "title": "修复登录 bug",
                "slug": "fix-login",
                "directory": "/home/user/app",
                "project_id": "proj_1",
                "time_created": 1700000000000,
                "time_updated": 1700000100000,
                "summary_files": 3,
                "summary_additions": 50,
                "summary_deletions": 10,
                "parent_id": None,
                "path": "src",
            },
            "first_user_message": "登录页面验证码不显示",
            "model": "glm-5.1",
            "provider": "ark",
            "tools": ["edit", "bash", "read"],
            "tool_details": [
                {"name": "edit", "input": {"filePath": "/src/login.vue"}},
            ],
            "todos": [],
            "message_count": 15,
            "tool_count": 8,
        }
        project_map = {"proj_1": {"worktree": "/home/user/app", "name": "app"}}
        result = summarize(parsed, project_map)
        self.assertEqual(result["id"], "ses_123")
        self.assertEqual(result["title"], "修复登录 bug")
        self.assertIn("登录页面验证码不显示", result["summary"])
        self.assertIn("coding", result["tags"])
        self.assertIn("login", result["keywords"])
        self.assertGreaterEqual(result["importance"], 3)


if __name__ == "__main__":
    unittest.main()
