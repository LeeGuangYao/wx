import re


def fuzzy_match(query, text):
    if not query:
        return (True, 0, [])

    query_lower = query.lower()
    text_lower = text.lower()

    if query_lower in text_lower:
        idx = text_lower.index(query_lower)
        positions = list(range(idx, idx + len(query)))
        score = 100 + len(query) * 10 - idx
        return (True, score, positions)

    qi = 0
    positions = []
    for ti, tc in enumerate(text_lower):
        if qi < len(query_lower) and tc == query_lower[qi]:
            positions.append(ti)
            qi += 1

    if qi != len(query_lower):
        return (False, 0, [])

    score = 0
    prev = -1
    for pos in positions:
        if prev >= 0:
            gap = pos - prev
            if gap == 1:
                score += 10
            else:
                score -= gap
        if pos == 0 or text[pos - 1] in (" ", "-", "_", "/", "."):
            score += 15
        if text[pos].isupper() and (pos == 0 or text[pos - 1].islower()):
            score += 5
        prev = pos

    score += len(query) * 2

    return (True, score, positions)


def fuzzy_search(query, items, key=None):
    results = []
    for item in items:
        text = item[key] if key and isinstance(item, dict) else str(item)
        matched, score, positions = fuzzy_match(query, text)
        if matched:
            results.append((score, item, positions))
    results.sort(key=lambda x: -x[0])
    return [(item, pos) for _, item, pos in results]


def highlight_fuzzy(text, positions):
    if not positions:
        return text
    result = []
    prev_end = 0
    sorted_pos = sorted(set(positions))
    i = 0
    while i < len(sorted_pos):
        start = sorted_pos[i]
        end = start + 1
        while i + 1 < len(sorted_pos) and sorted_pos[i + 1] == end:
            end += 1
            i += 1
        result.append(text[prev_end:start])
        result.append("\033[48;5;237m\033[1m")
        result.append(text[start:end])
        result.append("\033[0m")
        prev_end = end
        i += 1
    result.append(text[prev_end:])
    return "".join(result)
