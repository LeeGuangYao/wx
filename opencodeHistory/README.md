# opencode-history

OpenCode CLI 会话管理工具 — 快速索引、摘要、检索你的 OpenCode 对话历史。

## 安装

```bash
chmod +x opencode-history
./opencode-history index

# 或添加到 PATH
ln -s /path/to/opencodeHistory/opencode-history /usr/local/bin/opencode-history
```

## 命令

### `opencode-history index [--full]`
构建或更新会话索引。首次使用自动执行。`--full` 强制全量重建。

### `opencode-history list [-n 30] [-p PROJECT] [-t TAG] [-i 3] [--time 7d]`
列出会话，支持多种过滤：
- `-n` 限制数量
- `-p` 按项目过滤
- `-t` 按标签过滤
- `-i` 按重要性过滤 (1-5)
- `--time` 时间范围 (1h/7d/30d/2024-01-01:2024-12-31)

### `opencode-history search <query> [-p PROJECT] [-t TAG]`
搜索会话。支持模糊匹配和关键词搜索。

### `opencode-history show <session-id>`
查看会话详情。支持部分 ID 匹配。

### `opencode-history interactive` / `opencode-history i`
交互式浏览。支持实时搜索 + 方向键选择。检测到 fzf 时自动使用。

### `opencode-history tags` / `opencode-history projects` / `opencode-history stats`
分别列出所有标签、项目、统计信息。

### `opencode-history serve [-p 7780]`
启动 Web 前端页面。默认端口 7780，浏览器打开 `http://localhost:7780`。

## 快速开始

```bash
# 1. 启动 Web 前端
./opencode-history serve

# 2. 浏览器打开
open http://localhost:7780
```

## 示例输出

```
$ opencode-history list

  1 OpenCode CLI 会话管理工具设计  ★★★★★  11:46 (52m)  wx  cli,coding,delegation,interaction,planning,reading,task-tracked,workflow,wx  [glm-5.1]
  2 会话列表倒序排序问题修复       ★★☆☆☆  09:31 (1m)   wx  coding,reading,wx  [glm-5.1]
  3 底层模型查询                  ★★☆☆☆  09:06 (6s)       general  [glm-5.1]
```

```
$ opencode-history search "排序"

  Fuzzy results for "排序":
    1 会话列表倒序排序问题修复  ★★☆☆☆  09:31 (1m)  wx  coding,reading,wx
```

```
$ opencode-history show ses_2292488cfffeoL7hN3ezNIA7Cw

  会话列表倒序排序问题修复
  ──────────────────────────────────────────────────
  ID:         ses_2292488cfffeoL7hN3ezNIA7Cw
  Summary:    检查一下顺序，好像不是按照倒叙来排序的 | 使用 2 种工具(6 次)
  Tags:       coding,reading,wx
  Keywords:   claude-history-server,claude-history-server.py,claude-history-viewer.html,好像不是按照倒叙来排序的,检查一下顺序
  Importance:  ★★☆☆☆
  Model:      glm-5.1 (ark)
  Project:    /Users/liguangyao/Desktop/ai/wx
  Path:       claudeHistory Viewer
  Duration:   1m
  Messages:   8
  Tools:      edit,read
  Changes:    +0/-0 lines, 0 files
  First msg:   @claude-history-server.py @claude-history-viewer.html 检查一下顺序，好像不是按照倒叙来排序的
```

## 数据存储

- **数据源**: `~/.local/share/opencode/opencode.db` (只读)
- **索引**: `~/.local/share/opencode-history/opencode-history.db` (独立 SQLite)
- 增量更新，仅处理新增/变更的会话

## 依赖

- Python 3.9+，零外部依赖
- 可选: [fzf](https://github.com/junegunn/fzf) (增强交互体验)

## 项目结构

```
opencodeHistory/
├── opencode-history              # 可执行入口
├── opencode_history/
│   ├── __init__.py               # 版本号
│   ├── __main__.py               # CLI 入口 (argparse)
│   ├── parser.py                 # 读取 OpenCode opencode.db
│   ├── summarizer.py             # 规则摘要生成
│   ├── indexer.py                # 增量索引同步
│   ├── db.py                     # 索引 DB 操作
│   ├── display.py                # 终端输出格式化
│   ├── fuzzy.py                  # 模糊匹配算法
│   ├── interactive.py            # 交互式浏览
│   ├── server.py                 # Web HTTP 服务
│   └── viewer.html               # Web 前端页面
└── tests/
    ├── test_db.py
    ├── test_summarizer.py
    └── test_fuzzy.py
```
