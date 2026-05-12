import sys
import os
import subprocess
import shutil

from opencode_history import db
from opencode_history import display
from opencode_history import fuzzy as fuzzy_mod
from opencode_history.indexer import sync


def has_fzf():
    return shutil.which("fzf") is not None


def interactive_fzf(sessions):
    try:
        lines = []
        for i, s in enumerate(sessions):
            title = s.get("title", s.get("slug", ""))
            tags = s.get("tags", "")
            project = s.get("project_name", "")
            ts = display.format_ts(s.get("time_updated", 0))
            imp = display.importance_stars(s.get("importance", 2))
            lines.append(f"{s['id']}\t{title}\t{ts}\t{project}\t{tags}\t{imp}")

        input_text = "\n".join(lines)
        result = subprocess.run(
            [
                "fzf",
                "--ansi",
                "--delimiter=\t",
                "--with-nth=2..",
                "--preview",
                "echo 'Session: {1}'",
                "--preview-window",
                "up:1:hidden",
                "--height",
                "80%",
                "--layout=reverse",
                "--prompt",
                "opencode-history> ",
            ],
            input=input_text,
            capture_output=True,
            text=True,
        )
        if result.returncode == 0 and result.stdout.strip():
            session_id = result.stdout.strip().split("\t")[0]
            return session_id
    except Exception:
        pass
    return None


def interactive_readline(sessions):
    selected = 0
    query = ""
    filtered = list(sessions)

    def render():
        sys.stdout.write("\033[2J\033[H")
        sys.stdout.write(display.bold("  opencode-history interactive\n"))
        sys.stdout.write(
            display.dim(
                "  Type to search, ↑↓ to navigate, Enter to view, q to quit\n"
            )
        )
        sys.stdout.write(f"  > {query}\n")
        sys.stdout.write(display.dim("  " + "─" * 60 + "\n"))

        for i, s in enumerate(filtered[:20]):
            marker = display.green("▸") if i == selected else " "
            line = display.render_session_line(s, show_index=False)
            print(f"  {marker} {line}")

        if not filtered:
            sys.stdout.write(display.dim("  No matching sessions.\n"))

        sys.stdout.flush()

    render()

    try:
        import tty
        import termios

        old_settings = termios.tcgetattr(sys.stdin)
        tty.setraw(sys.stdin.fileno())
        try:
            while True:
                ch = sys.stdin.read(1)
                if ch == "\x1b":
                    ch2 = sys.stdin.read(1)
                    if ch2 == "[":
                        ch3 = sys.stdin.read(1)
                        if ch3 == "A":
                            selected = max(0, selected - 1)
                            render()
                        elif ch3 == "B":
                            selected = min(len(filtered) - 1, selected + 1)
                            render()
                    continue
                elif ch == "\r" or ch == "\n":
                    if filtered:
                        return filtered[selected]["id"]
                    return None
                elif ch == "q" or ch == "\x03":
                    return None
                elif ch == "\x7f" or ch == "\x08":
                    query = query[:-1]
                elif ch == "\x15":
                    query = ""
                elif ord(ch) >= 32:
                    query += ch

                if query:
                    fuzzy_results = fuzzy_mod.fuzzy_search(
                        query, sessions, key="title"
                    )
                    filtered = [item for item, _ in fuzzy_results]
                    if not filtered:
                        conn = db.get_connection()
                        try:
                            filtered = db.search_sessions(conn, query, limit=20)
                        finally:
                            conn.close()
                else:
                    filtered = list(sessions)
                selected = min(selected, max(0, len(filtered) - 1))
                render()
        finally:
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)
    except (ImportError, termios.error):
        print("Interactive mode requires a terminal. Use 'list' or 'search' instead.")
        return None


def interactive_mode(args):
    conn = db.get_connection()
    try:
        stats = db.get_stats(conn)
        if stats["total_sessions"] == 0:
            conn.close()
            print("Index is empty, running initial sync...")
            sync()
            conn = db.get_connection()
        sessions = db.list_sessions(conn, limit=200)
    finally:
        try:
            conn.close()
        except Exception:
            pass

    if not sessions:
        print("No sessions found.")
        return

    session_id = None
    if has_fzf():
        session_id = interactive_fzf(sessions)

    if not session_id:
        session_id = interactive_readline(sessions)

    if session_id:
        conn = db.get_connection()
        try:
            session = db.get_session(conn, session_id)
            if session:
                print("\n" + display.render_session_detail(session))
        finally:
            conn.close()
