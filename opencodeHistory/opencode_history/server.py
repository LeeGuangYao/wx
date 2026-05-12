import json
import os
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sqlite3
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from opencode_history import db
from opencode_history.indexer import sync
from opencode_history.parser import connect_opencode_db, parse_session, get_project_map

VIEWER_HTML = None
VIEWER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "viewer.html")

DEFAULT_PORT = 7780


def load_viewer_html():
    global VIEWER_HTML
    if VIEWER_HTML is None:
        try:
            with open(VIEWER_PATH, "r", encoding="utf-8") as f:
                VIEWER_HTML = f.read().encode("utf-8")
        except FileNotFoundError:
            VIEWER_HTML = b"<h1>viewer.html not found</h1>"
    return VIEWER_HTML


def get_sessions_api():
    conn = db.get_connection()
    try:
        stats = db.get_stats(conn)
        if stats["total_sessions"] == 0:
            conn.close()
            sync()
            conn = db.get_connection()
        sessions = db.list_sessions(conn, limit=500)
        projects = db.get_all_projects(conn)
    finally:
        conn.close()

    grouped = {}
    for s in sessions:
        pname = s.get("project_name", "") or os.path.basename(s.get("project_path", "")) or "global"
        if pname not in grouped:
            grouped[pname] = {
                "path": s.get("project_path", ""),
                "sessions": [],
            }
        grouped[pname]["sessions"].append(s)

    return grouped


def get_session_detail_api(session_id):
    conn = db.get_connection()
    try:
        session = db.get_session(conn, session_id)
    finally:
        conn.close()

    if not session:
        return None

    try:
        oc_conn = connect_opencode_db()
        try:
            session_row = oc_conn.execute(
                "SELECT * FROM session WHERE id = ?", (session_id,)
            ).fetchone()
            if not session_row:
                return session

            raw_session = dict(session_row)
            messages = []
            msg_rows = oc_conn.execute(
                "SELECT id, data FROM message WHERE session_id = ? ORDER BY time_created",
                (session_id,),
            ).fetchall()

            for mr in msg_rows:
                msg_data = json.loads(mr["data"]) if mr["data"] else {}
                role = msg_data.get("role", "")
                if role not in ("user", "assistant"):
                    continue

                part_rows = oc_conn.execute(
                    "SELECT data FROM part WHERE message_id = ? ORDER BY time_created",
                    (mr["id"],),
                ).fetchall()

                text_parts = []
                tool_parts = []
                for pr in part_rows:
                    pdata = json.loads(pr["data"]) if pr["data"] else {}
                    ptype = pdata.get("type", "")
                    if ptype == "text":
                        t = pdata.get("text", "").strip()
                        if t and not t.startswith("Called the ") and not t.startswith("<path>"):
                            text_parts.append(t)
                    elif ptype == "tool":
                        tool_name = pdata.get("tool", "")
                        state = pdata.get("state", {})
                        tool_input = state.get("input", {})
                        tool_output = state.get("output", "")
                        if isinstance(tool_output, dict):
                            tool_output = tool_output.get("metadata", {}).get("output", str(tool_output))
                        tool_parts.append({
                            "name": tool_name,
                            "input": tool_input,
                            "output": str(tool_output)[:500] if tool_output else "",
                        })

                text = "\n".join(text_parts)
                messages.append({
                    "role": role,
                    "text": text,
                    "tools": tool_parts,
                    "model": msg_data.get("modelID", ""),
                })

            return {**session, "messages": messages}
        finally:
            oc_conn.close()
    except Exception:
        return session


def search_api(query, project=None, tag=None):
    conn = db.get_connection()
    try:
        results = db.search_sessions(conn, query, limit=50, project=project, tag=tag)
    finally:
        conn.close()
    return results


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        if path == "/" or path == "/index.html":
            html = load_viewer_html()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(html)

        elif path == "/api/sessions":
            data = get_sessions_api()
            self._json_response(data)

        elif path.startswith("/api/session/"):
            session_id = path[len("/api/session/"):]
            session_id = session_id.strip("/")
            data = get_session_detail_api(session_id)
            if data is None:
                self._json_response({"error": "not found"}, status=404)
            else:
                self._json_response(data)

        elif path == "/api/search":
            query = params.get("q", [""])[0]
            project = params.get("project", [None])[0]
            tag = params.get("tag", [None])[0]
            if not query:
                self._json_response({"error": "missing q parameter"}, status=400)
                return
            results = search_api(query, project=project, tag=tag)
            self._json_response(results)

        elif path == "/api/tags":
            conn = db.get_connection()
            try:
                tags = db.get_all_tags(conn)
            finally:
                conn.close()
            self._json_response(tags)

        elif path == "/api/projects":
            conn = db.get_connection()
            try:
                projects = db.get_all_projects(conn)
            finally:
                conn.close()
            self._json_response(projects)

        elif path == "/api/stats":
            conn = db.get_connection()
            try:
                stats = db.get_stats(conn)
                tags = db.get_all_tags(conn)
                projects = db.get_all_projects(conn)
                stats["tags_count"] = len(tags)
                stats["projects_count"] = len(projects)
            finally:
                conn.close()
            self._json_response(stats)

        elif path == "/api/reindex":
            count = sync(full=True)
            self._json_response({"reindexed": count})

        else:
            self.send_error(404)

    def _json_response(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def start_server(port=DEFAULT_PORT):
    server = HTTPServer(("localhost", port), Handler)
    print(f"opencode-history server running at http://localhost:{port}")
    print("Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    start_server(port)
