import sqlite3
import json
import os
from pathlib import Path

OPENCODE_DB_PATH = os.path.join(
    Path.home(), ".local", "share", "opencode", "opencode.db"
)


def get_opencode_db_path():
    return OPENCODE_DB_PATH


def connect_opencode_db():
    path = get_opencode_db_path()
    if not os.path.exists(path):
        raise FileNotFoundError(f"OpenCode DB not found: {path}")
    conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def get_sessions(conn, updated_since=0):
    rows = conn.execute(
        "SELECT * FROM session WHERE parent_id IS NULL AND time_updated > ? ORDER BY time_updated DESC",
        (updated_since,),
    ).fetchall()
    return [dict(r) for r in rows]


def get_all_sessions(conn):
    rows = conn.execute(
        "SELECT * FROM session WHERE parent_id IS NULL ORDER BY time_updated DESC"
    ).fetchall()
    return [dict(r) for r in rows]


def get_project_map(conn):
    rows = conn.execute("SELECT id, worktree, name FROM project").fetchall()
    return {r["id"]: {"worktree": r["worktree"], "name": r["name"]} for r in rows}


def get_messages_for_session(conn, session_id):
    rows = conn.execute(
        "SELECT id, data FROM message WHERE session_id = ? ORDER BY time_created",
        (session_id,),
    ).fetchall()
    result = []
    for r in rows:
        data = json.loads(r["data"]) if r["data"] else {}
        result.append({"id": r["id"], **data})
    return result


def get_parts_for_session(conn, session_id):
    rows = conn.execute(
        "SELECT id, message_id, data FROM part WHERE session_id = ? ORDER BY time_created",
        (session_id,),
    ).fetchall()
    result = []
    for r in rows:
        data = json.loads(r["data"]) if r["data"] else {}
        result.append({"id": r["id"], "message_id": r["message_id"], **data})
    return result


def get_todos_for_session(conn, session_id):
    rows = conn.execute(
        "SELECT content, status, priority FROM todo WHERE session_id = ?",
        (session_id,),
    ).fetchall()
    return [dict(r) for r in rows]


def extract_first_user_message(messages, parts):
    for msg in messages:
        if msg.get("role") != "user":
            continue
        msg_parts = [p for p in parts if p.get("message_id") == msg.get("id")]
        text_parts = []
        for p in msg_parts:
            if p.get("type") == "text" and p.get("text", "").strip():
                text = p["text"].strip()
                if not text.startswith("Called the ") and not text.startswith("<path>"):
                    text_parts.append(text)
        if text_parts:
            return " ".join(text_parts)[:200]
    return ""


def extract_model_info(messages):
    model = ""
    provider = ""
    for msg in messages:
        if msg.get("role") == "assistant":
            model = msg.get("modelID", "")
            provider = msg.get("providerID", "")
            break
    return model, provider


def extract_tool_usage(parts):
    tools = []
    tool_details = []
    for p in parts:
        if p.get("type") == "tool":
            tool_name = p.get("tool", "")
            if tool_name:
                tools.append(tool_name)
            state = p.get("state", {})
            tool_input = state.get("input", {})
            tool_details.append({"name": tool_name, "input": tool_input})
    return tools, tool_details


def parse_session(conn, session):
    session_id = session["id"]
    messages = get_messages_for_session(conn, session_id)
    parts = get_parts_for_session(conn, session_id)
    todos = get_todos_for_session(conn, session_id)

    first_user_msg = extract_first_user_message(messages, parts)
    model, provider = extract_model_info(messages)
    tools, tool_details = extract_tool_usage(parts)

    user_msgs = [m for m in messages if m.get("role") == "user"]
    assistant_msgs = [m for m in messages if m.get("role") == "assistant"]

    return {
        "session": session,
        "messages": messages,
        "parts": parts,
        "todos": todos,
        "first_user_message": first_user_msg,
        "model": model,
        "provider": provider,
        "tools": tools,
        "tool_details": tool_details,
        "message_count": len(user_msgs) + len(assistant_msgs),
        "tool_count": len(tools),
    }
