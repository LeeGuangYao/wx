import unittest
import sqlite3
import tempfile
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import opencode_history.db as db


class TestDB(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.tmpdir, "test.db")
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(db.SCHEMA)

    def tearDown(self):
        self.conn.close()
        for f in os.listdir(self.tmpdir):
            os.remove(os.path.join(self.tmpdir, f))
        os.rmdir(self.tmpdir)

    def _make_session(self, **overrides):
        base = {
            "id": "ses_test001",
            "title": "Test Session",
            "summary": "A test session summary",
            "tags": "coding,cli",
            "keywords": "test,unit",
            "importance": 3,
            "model": "glm-5.1",
            "provider": "ark",
            "project_path": "/home/user/project",
            "project_name": "project",
            "slug": "test-slug",
            "path": "src",
            "time_created": 1700000000000,
            "time_updated": 1700000100000,
            "message_count": 10,
            "tool_count": 5,
            "files_changed": 2,
            "lines_added": 50,
            "lines_deleted": 10,
            "first_user_message": "Hello world",
            "tools_used": "bash,edit",
            "parent_id": None,
            "indexed_at": 1700000200000,
        }
        base.update(overrides)
        return base

    def test_upsert_and_get(self):
        session = self._make_session()
        db.upsert_session(self.conn, session)
        result = db.get_session(self.conn, "ses_test001")
        self.assertIsNotNone(result)
        self.assertEqual(result["title"], "Test Session")
        self.assertEqual(result["importance"], 3)

    def test_upsert_updates_existing(self):
        session = self._make_session()
        db.upsert_session(self.conn, session)
        session["title"] = "Updated Title"
        db.upsert_session(self.conn, session)
        result = db.get_session(self.conn, "ses_test001")
        self.assertEqual(result["title"], "Updated Title")

    def test_list_sessions(self):
        for i in range(3):
            db.upsert_session(
                self.conn,
                self._make_session(id=f"ses_{i}", time_updated=1700000100000 + i * 1000),
            )
        results = db.list_sessions(self.conn, limit=10)
        self.assertEqual(len(results), 3)
        self.assertEqual(results[0]["id"], "ses_2")

    def test_list_filter_project(self):
        db.upsert_session(
            self.conn, self._make_session(id="ses_a", project_path="/home/user/myapp")
        )
        db.upsert_session(
            self.conn, self._make_session(id="ses_b", project_path="/home/user/other")
        )
        results = db.list_sessions(self.conn, project="myapp")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "ses_a")

    def test_list_filter_tag(self):
        db.upsert_session(
            self.conn, self._make_session(id="ses_a", tags="coding,search")
        )
        db.upsert_session(self.conn, self._make_session(id="ses_b", tags="planning"))
        results = db.list_sessions(self.conn, tag="coding")
        self.assertEqual(len(results), 1)

    def test_list_filter_importance(self):
        db.upsert_session(self.conn, self._make_session(id="ses_a", importance=5))
        db.upsert_session(self.conn, self._make_session(id="ses_b", importance=2))
        results = db.list_sessions(self.conn, importance_min=4)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "ses_a")

    def test_search_sessions(self):
        db.upsert_session(
            self.conn,
            self._make_session(id="ses_a", title="Fix login bug", keywords="auth,login"),
        )
        db.upsert_session(
            self.conn,
            self._make_session(id="ses_b", title="Add dark mode", keywords="ui,theme"),
        )
        results = db.search_sessions(self.conn, "login")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "ses_a")

    def test_get_all_tags(self):
        db.upsert_session(self.conn, self._make_session(id="ses_a", tags="coding,cli"))
        db.upsert_session(self.conn, self._make_session(id="ses_b", tags="search,coding"))
        tags = db.get_all_tags(self.conn)
        self.assertEqual(tags, ["cli", "coding", "search"])

    def test_get_stats(self):
        db.upsert_session(self.conn, self._make_session(id="ses_a"))
        db.upsert_session(
            self.conn, self._make_session(id="ses_b", parent_id="ses_a")
        )
        stats = db.get_stats(self.conn)
        self.assertEqual(stats["total_sessions"], 1)

    def test_delete_session(self):
        db.upsert_session(self.conn, self._make_session())
        db.delete_session(self.conn, "ses_test001")
        result = db.get_session(self.conn, "ses_test001")
        self.assertIsNone(result)

    def test_clear_all(self):
        db.upsert_session(self.conn, self._make_session(id="ses_a"))
        db.upsert_session(self.conn, self._make_session(id="ses_b"))
        db.clear_all(self.conn)
        stats = db.get_stats(self.conn)
        self.assertEqual(stats["total_sessions"], 0)


if __name__ == "__main__":
    unittest.main()
