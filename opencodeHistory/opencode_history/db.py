import sqlite3
import os
from pathlib import Path

INDEX_DB_DIR = os.path.join(Path.home(), ".local", "share", "opencode-history")
INDEX_DB_PATH = os.path.join(INDEX_DB_DIR, "opencode-history.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS session_index (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '',
    keywords TEXT NOT NULL DEFAULT '',
    importance INTEGER NOT NULL DEFAULT 2,
    model TEXT NOT NULL DEFAULT '',
    provider TEXT NOT NULL DEFAULT '',
    project_path TEXT NOT NULL DEFAULT '',
    project_name TEXT NOT NULL DEFAULT '',
    slug TEXT NOT NULL DEFAULT '',
    path TEXT NOT NULL DEFAULT '',
    time_created INTEGER NOT NULL DEFAULT 0,
    time_updated INTEGER NOT NULL DEFAULT 0,
    message_count INTEGER NOT NULL DEFAULT 0,
    tool_count INTEGER NOT NULL DEFAULT 0,
    files_changed INTEGER NOT NULL DEFAULT 0,
    lines_added INTEGER NOT NULL DEFAULT 0,
    lines_deleted INTEGER NOT NULL DEFAULT 0,
    first_user_message TEXT NOT NULL DEFAULT '',
    tools_used TEXT NOT NULL DEFAULT '',
    parent_id TEXT,
    indexed_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_session_time_updated ON session_index(time_updated DESC);
CREATE INDEX IF NOT EXISTS idx_session_importance ON session_index(importance DESC);
CREATE INDEX IF NOT EXISTS idx_session_project ON session_index(project_path);
"""


def get_db_path():
    return INDEX_DB_PATH


def ensure_db():
    os.makedirs(INDEX_DB_DIR, exist_ok=True)
    conn = sqlite3.connect(INDEX_DB_PATH)
    conn.executescript(SCHEMA)
    conn.close()


def get_connection():
    ensure_db()
    conn = sqlite3.connect(INDEX_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def upsert_session(conn, session: dict):
    conn.execute(
        """
        INSERT INTO session_index (
            id, title, summary, tags, keywords, importance,
            model, provider, project_path, project_name, slug, path,
            time_created, time_updated, message_count, tool_count,
            files_changed, lines_added, lines_deleted,
            first_user_message, tools_used, parent_id, indexed_at
        ) VALUES (
            :id, :title, :summary, :tags, :keywords, :importance,
            :model, :provider, :project_path, :project_name, :slug, :path,
            :time_created, :time_updated, :message_count, :tool_count,
            :files_changed, :lines_added, :lines_deleted,
            :first_user_message, :tools_used, :parent_id, :indexed_at
        )
        ON CONFLICT(id) DO UPDATE SET
            title=excluded.title, summary=excluded.summary,
            tags=excluded.tags, keywords=excluded.keywords,
            importance=excluded.importance, model=excluded.model,
            provider=excluded.provider, project_path=excluded.project_path,
            project_name=excluded.project_name, slug=excluded.slug,
            path=excluded.path, time_created=excluded.time_created,
            time_updated=excluded.time_updated,
            message_count=excluded.message_count, tool_count=excluded.tool_count,
            files_changed=excluded.files_changed, lines_added=excluded.lines_added,
            lines_deleted=excluded.lines_deleted,
            first_user_message=excluded.first_user_message,
            tools_used=excluded.tools_used, parent_id=excluded.parent_id,
            indexed_at=excluded.indexed_at
    """,
        session,
    )


def get_indexed_time(conn, session_id: str) -> int:
    row = conn.execute(
        "SELECT indexed_at FROM session_index WHERE id = ?", (session_id,)
    ).fetchone()
    return row["indexed_at"] if row else 0


def list_sessions(
    conn,
    limit=50,
    offset=0,
    project=None,
    tag=None,
    importance_min=None,
    time_from=None,
    time_to=None,
):
    where_clauses = ["parent_id IS NULL"]
    params = []
    if project:
        where_clauses.append("(project_path LIKE ? OR project_name LIKE ?)")
        params.extend([f"%{project}%", f"%{project}%"])
    if tag:
        where_clauses.append("tags LIKE ?")
        params.append(f"%{tag}%")
    if importance_min:
        where_clauses.append("importance >= ?")
        params.append(importance_min)
    if time_from:
        where_clauses.append("time_updated >= ?")
        params.append(time_from)
    if time_to:
        where_clauses.append("time_updated <= ?")
        params.append(time_to)
    where = " AND ".join(where_clauses)
    sql = f"SELECT * FROM session_index WHERE {where} ORDER BY time_updated DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    return [dict(row) for row in conn.execute(sql, params).fetchall()]


def search_sessions(conn, query, limit=50, project=None, tag=None):
    where_clauses = ["parent_id IS NULL"]
    params = []
    like = f"%{query}%"
    where_clauses.append(
        "(title LIKE ? OR summary LIKE ? OR keywords LIKE ? OR tags LIKE ? OR first_user_message LIKE ? OR tools_used LIKE ?)"
    )
    params.extend([like, like, like, like, like, like])
    if project:
        where_clauses.append("(project_path LIKE ? OR project_name LIKE ?)")
        params.extend([f"%{project}%", f"%{project}%"])
    if tag:
        where_clauses.append("tags LIKE ?")
        params.append(f"%{tag}%")
    where = " AND ".join(where_clauses)
    sql = f"SELECT * FROM session_index WHERE {where} ORDER BY importance DESC, time_updated DESC LIMIT ?"
    params.append(limit)
    return [dict(row) for row in conn.execute(sql, params).fetchall()]


def get_session(conn, session_id: str):
    row = conn.execute(
        "SELECT * FROM session_index WHERE id = ?", (session_id,)
    ).fetchone()
    return dict(row) if row else None


def get_all_tags(conn):
    rows = conn.execute(
        "SELECT DISTINCT tags FROM session_index WHERE tags != ''"
    ).fetchall()
    tags = set()
    for row in rows:
        for t in row["tags"].split(","):
            t = t.strip()
            if t:
                tags.add(t)
    return sorted(tags)


def get_all_projects(conn):
    rows = conn.execute(
        "SELECT DISTINCT project_path, project_name FROM session_index WHERE project_path != ''"
    ).fetchall()
    return [{"path": row["project_path"], "name": row["project_name"]} for row in rows]


def get_stats(conn):
    row = conn.execute(
        "SELECT COUNT(*) as total FROM session_index WHERE parent_id IS NULL"
    ).fetchone()
    return {"total_sessions": row["total"]}


def delete_session(conn, session_id: str):
    conn.execute("DELETE FROM session_index WHERE id = ?", (session_id,))


def clear_all(conn):
    conn.execute("DELETE FROM session_index")
