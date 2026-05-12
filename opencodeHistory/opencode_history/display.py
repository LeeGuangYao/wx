import time
from datetime import datetime, timezone

BOLD = "\033[1m"
DIM = "\033[2m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
MAGENTA = "\033[35m"
CYAN = "\033[36m"
RESET = "\033[0m"
BG_HIGHLIGHT = "\033[48;5;237m"


def supports_color():
    import os

    if os.environ.get("NO_COLOR"):
        return False
    if not os.isatty(1):
        return False
    term = os.environ.get("TERM", "")
    return "color" in term or "xterm" in term or term == "screen"


_color = supports_color()


def c(code, text):
    if not _color:
        return text
    return f"{code}{text}{RESET}"


def bold(text):
    return c(BOLD, text)


def dim(text):
    return c(DIM, text)


def green(text):
    return c(GREEN, text)


def yellow(text):
    return c(YELLOW, text)


def cyan(text):
    return c(CYAN, text)


def magenta(text):
    return c(MAGENTA, text)


def red(text):
    return c(RED, text)


def blue(text):
    return c(BLUE, text)


def highlight_match(text, query):
    if not query or not _color:
        return text
    import re

    pattern = re.compile(re.escape(query), re.IGNORECASE)
    return pattern.sub(lambda m: c(BG_HIGHLIGHT + BOLD, m.group()), text)


def format_ts(ts_ms):
    if not ts_ms:
        return "-"
    ts_sec = ts_ms / 1000
    dt = datetime.fromtimestamp(ts_sec)
    now = datetime.now()
    diff = now - dt
    if diff.days == 0:
        return dt.strftime("%H:%M")
    elif diff.days < 7:
        days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        return days[dt.weekday()] + " " + dt.strftime("%H:%M")
    elif diff.days < 365:
        return dt.strftime("%m/%d %H:%M")
    else:
        return dt.strftime("%Y/%m/%d")


def format_duration(time_created, time_updated):
    if not time_created or not time_updated:
        return "-"
    diff_sec = (time_updated - time_created) / 1000
    if diff_sec < 60:
        return f"{int(diff_sec)}s"
    elif diff_sec < 3600:
        return f"{int(diff_sec / 60)}m"
    else:
        return f"{diff_sec / 3600:.1f}h"


def importance_stars(imp):
    return "★" * imp + "☆" * (5 - imp)


def render_session_line(session, query=None, show_index=False):
    idx = ""
    if show_index is not False and show_index is not None:
        idx = dim(f"{show_index:>3} ")

    title = session.get("title", session.get("slug", ""))
    if query:
        title = highlight_match(title, query)
    else:
        title = bold(title)

    imp = importance_stars(session.get("importance", 2))
    imp_colored = yellow(imp) if session.get("importance", 2) >= 4 else dim(imp)

    ts = format_ts(session.get("time_updated", 0))
    dur = format_duration(
        session.get("time_created", 0), session.get("time_updated", 0)
    )
    project = session.get("project_name", "")
    model = session.get("model", "")
    tags = session.get("tags", "")

    parts = [
        idx,
        title,
        dim("  "),
        imp_colored,
        dim("  "),
        cyan(ts),
        dim(" "),
        dim(f"({dur})"),
        dim("  "),
        magenta(project) if project else "",
        dim("  "),
        blue(tags) if tags else "",
    ]
    if model:
        parts.extend([dim("  "), dim(f"[{model}]")])

    return "".join(parts)


def render_session_detail(session):
    lines = []
    lines.append(bold(f"  {session.get('title', session.get('slug', ''))}"))
    lines.append(dim(f"  {'─' * 50}"))
    lines.append(f"  {cyan('ID:')}         {session['id']}")
    lines.append(f"  {cyan('Summary:')}    {session.get('summary', '-')}")
    lines.append(f"  {cyan('Tags:')}       {session.get('tags', '-')}")
    lines.append(f"  {cyan('Keywords:')}   {session.get('keywords', '-')}")
    lines.append(
        f"  {cyan('Importance:')}  {yellow(importance_stars(session.get('importance', 2)))}"
    )
    lines.append(
        f"  {cyan('Model:')}      {session.get('model', '-')} ({session.get('provider', '-')})"
    )
    lines.append(f"  {cyan('Project:')}    {session.get('project_path', '-')}")
    lines.append(f"  {cyan('Path:')}       {session.get('path', '-')}")
    lines.append(
        f"  {cyan('Created:')}    {format_ts(session.get('time_created', 0))}"
    )
    lines.append(
        f"  {cyan('Updated:')}    {format_ts(session.get('time_updated', 0))}"
    )
    lines.append(
        f"  {cyan('Duration:')}   {format_duration(session.get('time_created', 0), session.get('time_updated', 0))}"
    )
    lines.append(f"  {cyan('Messages:')}   {session.get('message_count', 0)}")
    lines.append(f"  {cyan('Tools:')}      {session.get('tools_used', '-')}")
    lines.append(
        f"  {cyan('Changes:')}    +{session.get('lines_added', 0)}/-{session.get('lines_deleted', 0)} lines, {session.get('files_changed', 0)} files"
    )
    if session.get("first_user_message"):
        lines.append(
            f"  {cyan('First msg:')}   {session['first_user_message'][:120]}"
        )
    return "\n".join(lines)


def render_session_list(sessions, query=None):
    if not sessions:
        return dim("  No sessions found.")

    lines = []
    for i, s in enumerate(sessions):
        lines.append(render_session_line(s, query=query, show_index=i + 1))
    return "\n".join(lines)
