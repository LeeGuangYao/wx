import time
from opencode_history import db
from opencode_history import parser
from opencode_history import summarizer


def sync(full=False):
    try:
        oc_conn = parser.connect_opencode_db()
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return 0

    idx_conn = db.get_connection()
    try:
        if full:
            db.clear_all(idx_conn)
            updated_since = 0
        else:
            row = idx_conn.execute(
                "SELECT MAX(time_updated) as max_ts FROM session_index"
            ).fetchone()
            updated_since = row["max_ts"] if row and row["max_ts"] else 0

        sessions = parser.get_sessions(oc_conn, updated_since=updated_since)
        project_map = parser.get_project_map(oc_conn)

        count = 0
        for session in sessions:
            try:
                parsed = parser.parse_session(oc_conn, session)
                summary = summarizer.summarize(parsed, project_map)
                summary["indexed_at"] = int(time.time() * 1000)
                db.upsert_session(idx_conn, summary)
                count += 1
            except Exception as e:
                print(f"Warning: failed to index session {session['id']}: {e}")

        idx_conn.commit()
        return count
    finally:
        idx_conn.close()
        oc_conn.close()


def reindex():
    return sync(full=True)


def get_or_sync_session(session_id):
    idx_conn = db.get_connection()
    try:
        existing = db.get_session(idx_conn, session_id)
        if existing:
            return existing

        oc_conn = parser.connect_opencode_db()
        try:
            session_row = oc_conn.execute(
                "SELECT * FROM session WHERE id = ?", (session_id,)
            ).fetchone()
            if not session_row:
                return None
            session = dict(session_row)
            project_map = parser.get_project_map(oc_conn)
            parsed = parser.parse_session(oc_conn, session)
            summary = summarizer.summarize(parsed, project_map)
            summary["indexed_at"] = int(time.time() * 1000)
            db.upsert_session(idx_conn, summary)
            idx_conn.commit()
            return summary
        finally:
            oc_conn.close()
    finally:
        idx_conn.close()
