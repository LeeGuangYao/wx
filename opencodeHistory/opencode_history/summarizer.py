import os
import re

TOOL_TAG_MAP = {
    "edit": "coding",
    "write": "coding",
    "create": "coding",
    "bash": "cli",
    "glob": "search",
    "grep": "search",
    "read": "reading",
    "webfetch": "web",
    "websearch": "web",
    "todowrite": "planning",
    "task": "delegation",
    "skill": "workflow",
    "question": "interaction",
}

DEFAULT_TITLE_PATTERNS = [
    re.compile(r"^New session", re.IGNORECASE),
    re.compile(r"^Untitled", re.IGNORECASE),
]


def is_default_title(title):
    if not title or not title.strip():
        return True
    for pat in DEFAULT_TITLE_PATTERNS:
        if pat.match(title):
            return True
    return False


def generate_title(session_title, first_user_message, slug):
    if not is_default_title(session_title):
        return session_title.strip()[:80]
    if first_user_message:
        title = first_user_message.strip().split("\n")[0][:60]
        title = re.sub(r"@\S+\s*", "", title)
        return title.strip() if title.strip() else slug
    return slug


def generate_summary(
    first_user_message, tool_count, files_changed, lines_added, lines_deleted, tools_used
):
    parts = []
    if first_user_message:
        msg = first_user_message.strip().split("\n")[0][:120]
        msg = re.sub(r"@\S+\s*", "", msg)
        if msg.strip():
            parts.append(msg.strip())

    ops = []
    if files_changed and files_changed > 0:
        ops.append(f"修改 {files_changed} 个文件")
    if tool_count and tool_count > 0:
        unique_tools = len(set(tools_used)) if tools_used else 0
        ops.append(f"使用 {unique_tools} 种工具({tool_count} 次)")
    if lines_added or lines_deleted:
        a = lines_added or 0
        d = lines_deleted or 0
        if a or d:
            ops.append(f"+{a}/-{d} 行")

    if ops:
        parts.append("，".join(ops))

    return " | ".join(parts) if parts else "空会话"


def generate_tags(tools_used, project_name, todos):
    tags = set()
    for tool in tools_used:
        tag = TOOL_TAG_MAP.get(tool)
        if tag:
            tags.add(tag)
    if project_name and project_name != "global":
        tags.add(project_name)
    if todos:
        tags.add("task-tracked")
    if not tags:
        tags.add("general")
    return sorted(tags)


def extract_keywords(first_user_message, tool_details):
    keywords = set()

    if first_user_message:
        words = re.findall(r"[\u4e00-\u9fff]+|[a-zA-Z_][\w.-]*", first_user_message)
        stopwords = {
            "the", "a", "an", "is", "are", "was", "were", "be", "been",
            "being", "have", "has", "had", "do", "does", "did", "will",
            "would", "could", "should", "may", "might", "can", "shall",
            "to", "of", "in", "for", "on", "with", "at", "by", "from",
            "and", "or", "but", "not", "no", "if", "so", "as", "up",
            "it", "its", "this", "that", "these", "those", "my", "your",
            "his", "her", "our", "their", "me", "him", "us", "them",
            "what", "which", "who", "whom", "how", "when", "where", "why",
            "all", "each", "every", "both", "few", "more", "most", "other",
            "some", "such", "than", "too", "very", "just", "about",
            "的", "了", "在", "是", "我", "有", "和", "就", "不", "人",
            "都", "一", "一个", "上", "也", "很", "到", "说", "要", "去",
            "你", "会", "着", "没有", "看", "好", "自己", "这",
        }
        for w in words:
            if w.lower() not in stopwords and len(w) > 1:
                keywords.add(w.lower() if w.isascii() else w)

    for td in tool_details:
        name = td.get("name", "")
        inp = td.get("input", {})
        if name in ("edit", "write", "read", "create"):
            fpath = inp.get("filePath", inp.get("path", ""))
            if fpath:
                basename = os.path.basename(fpath)
                if "." in basename:
                    stem = basename.rsplit(".", 1)[0]
                    keywords.add(stem)
                    keywords.add(basename)
        elif name == "bash":
            cmd = inp.get("command", "")
            cmd_name = cmd.split()[0] if cmd else ""
            if cmd_name and len(cmd_name) > 1:
                keywords.add(cmd_name)

    return sorted(keywords)[:15]


def calculate_importance(
    message_count, tool_count, files_changed, lines_added, lines_deleted, todos
):
    score = 2
    if message_count and message_count > 10:
        score += 1
    if tool_count and tool_count > 8:
        score += 1
    if files_changed and files_changed > 2:
        score += 1
    total_lines = (lines_added or 0) + (lines_deleted or 0)
    if total_lines > 30:
        score += 1
    if todos and len(todos) > 0:
        score += 1
    return min(score, 5)


def summarize(parsed_data, project_map):
    session = parsed_data["session"]
    first_msg = parsed_data["first_user_message"]
    tools = parsed_data["tools"]
    tool_details = parsed_data["tool_details"]
    todos = parsed_data["todos"]

    project_id = session.get("project_id", "")
    proj_info = project_map.get(project_id, {})
    project_name = proj_info.get("name", "") or os.path.basename(
        proj_info.get("worktree", "")
    )

    title = generate_title(
        session.get("title", ""), first_msg, session.get("slug", "")
    )
    summary = generate_summary(
        first_msg,
        parsed_data["tool_count"],
        session.get("summary_files", 0),
        session.get("summary_additions", 0),
        session.get("summary_deletions", 0),
        tools,
    )
    tags = generate_tags(tools, project_name, todos)
    keywords = extract_keywords(first_msg, tool_details)
    importance = calculate_importance(
        parsed_data["message_count"],
        parsed_data["tool_count"],
        session.get("summary_files", 0),
        session.get("summary_additions", 0),
        session.get("summary_deletions", 0),
        todos,
    )

    return {
        "id": session["id"],
        "title": title,
        "summary": summary,
        "tags": ",".join(tags),
        "keywords": ",".join(keywords),
        "importance": importance,
        "model": parsed_data["model"],
        "provider": parsed_data["provider"],
        "project_path": proj_info.get("worktree", session.get("directory", "")) or "",
        "project_name": project_name or "",
        "slug": session.get("slug", "") or "",
        "path": session.get("path", "") or "",
        "time_created": session.get("time_created", 0) or 0,
        "time_updated": session.get("time_updated", 0) or 0,
        "message_count": parsed_data["message_count"],
        "tool_count": parsed_data["tool_count"],
        "files_changed": session.get("summary_files", 0) or 0,
        "lines_added": session.get("summary_additions", 0) or 0,
        "lines_deleted": session.get("summary_deletions", 0) or 0,
        "first_user_message": first_msg[:200],
        "tools_used": ",".join(sorted(set(tools))),
        "parent_id": session.get("parent_id"),
        "indexed_at": 0,
    }
