import argparse
import sys
import re
import os
from datetime import datetime, timezone, timedelta

from opencode_history import __version__
from opencode_history import db
from opencode_history import display
from opencode_history import fuzzy as fuzzy_mod
from opencode_history.indexer import sync, reindex


def parse_time_range(time_str):
    now = datetime.now(tz=timezone.utc)
    m = re.match(r"^(\d+)([hdwmy])$", time_str)
    if m:
        n, unit = int(m.group(1)), m.group(2)
        if unit == "h":
            dt = now - timedelta(hours=n)
        elif unit == "d":
            dt = now - timedelta(days=n)
        elif unit == "w":
            dt = now - timedelta(weeks=n)
        elif unit == "m":
            dt = now - timedelta(days=n * 30)
        elif unit == "y":
            dt = now - timedelta(days=n * 365)
        else:
            return None
        return int(dt.timestamp() * 1000)
    m = re.match(r"^(\d{4}-\d{2}-\d{2})(?::(\d{4}-\d{2}-\d{2}))?$", time_str)
    if m:
        start = datetime.strptime(m.group(1), "%Y-%m-%d").replace(tzinfo=timezone.utc)
        from_ts = int(start.timestamp() * 1000)
        if m.group(2):
            end = datetime.strptime(m.group(2), "%Y-%m-%d").replace(
                tzinfo=timezone.utc, hour=23, minute=59, second=59
            )
            to_ts = int(end.timestamp() * 1000)
            return (from_ts, to_ts)
        return from_ts
    return None


def cmd_index(args):
    if args.full:
        count = reindex()
        print(f"Full reindex complete: {count} sessions indexed")
    else:
        count = sync()
        print(f"Synced {count} new/updated sessions")


def cmd_list(args):
    ensure_index()

    conn = db.get_connection()
    try:
        kwargs = {"limit": args.limit or 30}
        if args.project:
            kwargs["project"] = args.project
        if args.tag:
            kwargs["tag"] = args.tag
        if args.importance:
            kwargs["importance_min"] = args.importance
        if args.time:
            tr = parse_time_range(args.time)
            if isinstance(tr, tuple):
                kwargs["time_from"], kwargs["time_to"] = tr
            elif tr:
                kwargs["time_from"] = tr

        sessions = db.list_sessions(conn, **kwargs)
        print(display.render_session_list(sessions))
    finally:
        conn.close()


def cmd_search(args):
    ensure_index()

    conn = db.get_connection()
    try:
        sessions = db.search_sessions(
            conn, args.query, limit=args.limit or 30, project=args.project, tag=args.tag
        )

        if not args.no_fuzzy:
            fuzzy_results = fuzzy_mod.fuzzy_search(args.query, sessions, key="title")
            if fuzzy_results:
                print(display.bold(f'  Fuzzy results for "{args.query}":'))
                for i, (s, pos) in enumerate(fuzzy_results):
                    idx = display.dim(f"{i + 1:>3} ")
                    title = fuzzy_mod.highlight_fuzzy(s.get("title", ""), pos)
                    imp = display.importance_stars(s.get("importance", 2))
                    ts = display.format_ts(s.get("time_updated", 0))
                    dur = display.format_duration(
                        s.get("time_created", 0), s.get("time_updated", 0)
                    )
                    project = display.magenta(s.get("project_name", ""))
                    tags = display.blue(s.get("tags", ""))
                    print(
                        f"{idx}{title}  {display.dim(imp)}  {display.cyan(ts)} {display.dim(f'({dur})')}  {project}  {tags}"
                    )
                return

        print(display.render_session_list(sessions, query=args.query))
    finally:
        conn.close()


def cmd_show(args):
    ensure_index()

    sid = args.session_id
    conn = db.get_connection()
    try:
        session = db.get_session(conn, sid)
        if not session:
            matches = db.search_sessions(conn, sid, limit=5)
            if len(matches) == 1:
                session = matches[0]
            elif matches:
                print(f"Session '{sid}' not found. Did you mean:")
                for s in matches:
                    print(f"  {s['id']}  {s['title']}")
                return
            else:
                print(f"Session '{sid}' not found.")
                return
        print(display.render_session_detail(session))
    finally:
        conn.close()


def cmd_tags(args):
    ensure_index()

    conn = db.get_connection()
    try:
        tags = db.get_all_tags(conn)
        if tags:
            print(display.bold("  Tags:"))
            for t in tags:
                print(f"    {display.cyan('●')} {t}")
        else:
            print("  No tags found.")
    finally:
        conn.close()


def cmd_projects(args):
    ensure_index()

    conn = db.get_connection()
    try:
        projects = db.get_all_projects(conn)
        if projects:
            print(display.bold("  Projects:"))
            for p in projects:
                name = p["name"] or os.path.basename(p["path"])
                print(f"    {display.magenta('●')} {name}  {display.dim(p['path'])}")
        else:
            print("  No projects found.")
    finally:
        conn.close()


def cmd_stats(args):
    ensure_index()

    conn = db.get_connection()
    try:
        stats = db.get_stats(conn)
        print(display.bold(f"  Total sessions: {stats['total_sessions']}"))
        tags = db.get_all_tags(conn)
        projects = db.get_all_projects(conn)
        print(f"  Tags: {len(tags)}, Projects: {len(projects)}")
    finally:
        conn.close()


def ensure_index():
    conn = db.get_connection()
    try:
        stats = db.get_stats(conn)
        if stats["total_sessions"] == 0:
            print("Index is empty, running initial sync...")
            conn.close()
            count = sync()
            print(f"Indexed {count} sessions.\n")
            return
    finally:
        try:
            conn.close()
        except Exception:
            pass


def build_parser():
    p = argparse.ArgumentParser(
        prog="opencode-history",
        description="OpenCode CLI session manager - search and browse your conversation history",
    )
    p.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    p.add_argument("--no-color", action="store_true", help="Disable colored output")

    sub = p.add_subparsers(dest="command", help="Available commands")

    idx = sub.add_parser("index", help="Build or update session index")
    idx.add_argument(
        "--full", action="store_true", help="Full reindex (re-process all sessions)"
    )

    ls = sub.add_parser("list", aliases=["ls"], help="List sessions")
    ls.add_argument("-n", "--limit", type=int, default=30, help="Max sessions to show")
    ls.add_argument("-p", "--project", help="Filter by project name/path")
    ls.add_argument("-t", "--tag", help="Filter by tag")
    ls.add_argument("-i", "--importance", type=int, help="Min importance (1-5)")
    ls.add_argument(
        "--time", help="Time range (e.g. 7d, 1h, 2024-01-01:2024-12-31)"
    )

    sr = sub.add_parser("search", help="Search sessions")
    sr.add_argument("query", help="Search query")
    sr.add_argument("-n", "--limit", type=int, default=30)
    sr.add_argument("-p", "--project", help="Filter by project")
    sr.add_argument("-t", "--tag", help="Filter by tag")
    sr.add_argument(
        "--no-fuzzy", action="store_true", help="Disable fuzzy matching"
    )

    sh = sub.add_parser("show", help="Show session details")
    sh.add_argument("session_id", help="Session ID (or partial ID)")

    sub.add_parser("tags", help="List all tags")
    sub.add_parser("projects", help="List all projects")
    sub.add_parser("stats", help="Show index statistics")

    sub.add_parser(
        "interactive", aliases=["i"], help="Interactive session browser"
    )

    sv = sub.add_parser("serve", help="Start web UI server")
    sv.add_argument("-p", "--port", type=int, default=7780, help="Port (default: 7780)")

    return p


def main():
    if len(sys.argv) == 1:
        sys.argv.append("list")

    parser_obj = build_parser()
    args = parser_obj.parse_args()

    if args.no_color:
        os.environ["NO_COLOR"] = "1"

    commands = {
        "index": cmd_index,
        "list": cmd_list,
        "ls": cmd_list,
        "search": cmd_search,
        "show": cmd_show,
        "tags": cmd_tags,
        "projects": cmd_projects,
        "stats": cmd_stats,
    }

    if args.command in commands:
        commands[args.command](args)
    elif args.command in ("interactive", "i"):
        from opencode_history.interactive import interactive_mode

        interactive_mode(args)
    elif args.command == "serve":
        from opencode_history.server import start_server

        ensure_index()
        start_server(port=args.port)
    else:
        parser_obj.print_help()


if __name__ == "__main__":
    main()
