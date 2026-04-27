#!/usr/bin/env python3
"""
Claude CLI 对话历史本地服务器
用法: python3 claude-history-server.py
然后在浏览器打开 http://localhost:7734
"""

import os, json, re, sys
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

CLAUDE_DIR = Path.home() / ".claude" / "projects"
PORT = 7734


def parse_jsonl(path: Path):
    messages = []
    first_ts = last_ts = None
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return messages, first_ts, last_ts

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue

        ts = obj.get("timestamp") or obj.get("ts")
        if ts:
            if not first_ts:
                first_ts = ts
            last_ts = ts

        msg = obj.get("message") or obj
        role = msg.get("role") or obj.get("role") or obj.get("type")
        if role not in ("user", "assistant"):
            continue

        content = msg.get("content")
        if not content:
            continue

        text_out = ""
        if isinstance(content, str):
            text_out = content
        elif isinstance(content, list):
            for block in content:
                if not isinstance(block, dict):
                    continue
                if block.get("type") == "text":
                    text_out += block.get("text", "")
                elif block.get("type") == "tool_use":
                    inp = json.dumps(block.get("input", {}))[:120]
                    text_out += f"\n__TOOL__{block.get('name','tool')}__INPUT__{inp}"

        if text_out.strip():
            messages.append({"role": role, "text": text_out.strip()})

    return messages, first_ts, last_ts


def load_all_projects():
    if not CLAUDE_DIR.exists():
        return {}

    result = {}
    for proj_dir in sorted(CLAUDE_DIR.iterdir()):
        if not proj_dir.is_dir() or proj_dir.name.startswith("."):
            continue

        # Convert dir name back to path: -Users-foo-bar → ~/bar
        raw = proj_dir.name
        real_path = re.sub(r"^-", "/", raw).replace("-", "/")
        # Shorten home dir
        home = str(Path.home())
        if real_path.startswith(home):
            real_path = "~" + real_path[len(home):]

        proj_name = proj_dir.name.split("-")[-1] if "-" in proj_dir.name else proj_dir.name

        sessions = []
        for jsonl_file in sorted(proj_dir.glob("*.jsonl"), key=lambda f: f.stat().st_mtime, reverse=True):
            session_id = jsonl_file.stem
            size_bytes = jsonl_file.stat().st_size
            messages, first_ts, last_ts = parse_jsonl(jsonl_file)

            if not messages:
                continue

            # Preview: first user message, truncated
            preview = next((m["text"][:60].replace("\n", " ") for m in messages if m["role"] == "user"), session_id[:16])

            # Format size
            if size_bytes < 1024:
                size_str = f"{size_bytes}B"
            elif size_bytes < 1048576:
                size_str = f"{size_bytes//1024}K"
            else:
                size_str = f"{size_bytes/1048576:.1f}M"

            # Format date
            import datetime
            date_str = "-"
            if last_ts:
                try:
                    if isinstance(last_ts, (int, float)):
                        dt = datetime.datetime.fromtimestamp(last_ts / 1000 if last_ts > 1e10 else last_ts)
                    else:
                        dt = datetime.datetime.fromisoformat(str(last_ts).replace("Z", "+00:00")).astimezone()
                    date_str = f"{dt.month}月{dt.day}日 {dt.hour:02d}:{dt.minute:02d}"
                except Exception:
                    date_str = str(last_ts)[:16]

            sessions.append({
                "id": session_id,
                "date": date_str,
                "size": size_str,
                "preview": preview,
                "messages": messages,
            })

        if sessions:
            result[proj_name] = {"path": real_path, "sessions": sessions}

    return result


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # quiet

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/" or parsed.path == "/index.html":
            self.serve_file(VIEWER_HTML, "text/html")
        elif parsed.path == "/claude-history-data.json":
            data = load_all_projects()
            body = json.dumps(data, ensure_ascii=False, indent=2).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def serve_file(self, content: bytes, mime: str):
        self.send_response(200)
        self.send_header("Content-Type", f"{mime}; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


# Embed the HTML viewer inline so we only need one file
VIEWER_HTML_PATH = Path(__file__).parent / "claude-history-viewer.html"
if VIEWER_HTML_PATH.exists():
    VIEWER_HTML = VIEWER_HTML_PATH.read_bytes()
else:
    VIEWER_HTML = b"<h1>claude-history-viewer.html not found</h1><p>Put it in the same folder as this server script.</p>"


if __name__ == "__main__":
    print(f"Claude CLI 对话历史查看器")
    print(f"读取目录: {CLAUDE_DIR}")
    print(f"启动服务: http://localhost:{PORT}")
    print(f"按 Ctrl+C 停止\n")

    if not CLAUDE_DIR.exists():
        print(f"警告: 未找到 ~/.claude/projects 目录", file=sys.stderr)

    server = HTTPServer(("localhost", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止")
