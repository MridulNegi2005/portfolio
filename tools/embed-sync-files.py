#!/usr/bin/env python3
"""Copy the real repo files into the sync-demo data blocks in index.html.

The demo section quotes .ai-sync/context.md, handoff.md, DESIGN.md and the
original brief. Rather than hand-copying them (which drifts the moment anyone
runs /sync-handoff), this script injects them verbatim.

Re-run after every sync:   python tools/embed-sync-files.py
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")


def read(rel):
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        return None
    return io.open(path, encoding="utf-8").read().replace("\r\n", "\n").rstrip("\n")


def trim(text, keep, what="lines"):
    """Keep the first `keep` lines; note how much was withheld."""
    lines = text.split("\n")
    if len(lines) <= keep:
        return text
    rest = len(lines) - keep
    return "\n".join(lines[:keep]) + "\n\n[ ... %d more %s trimmed for preview ]" % (rest, what)


def safe(text):
    # script content is raw text: only a literal </script can break out.
    return text.replace("</script", "<\\/script")


BLOCKS = {
    "f-context": lambda: read(".ai-sync/context.md"),
    "f-handoff": lambda: read(".ai-sync/handoff.md"),
    "f-brief":   lambda: read(".ai-sync/artifacts/original-brief.md"),
    "f-claude":  lambda: read("CLAUDE.md"),
    "f-gemini":  lambda: read("GEMINI.md") or read("CLAUDE.md"),
    # DESIGN.md is a preview only: the full palette/spec stays in the repo.
    "f-design":  lambda: trim(read("DESIGN.md") or "", 22),
    # index.html shows its own head, then stops.
    "f-index":   lambda: trim(read("index.html") or "", 14),
}


def main():
    html = io.open(INDEX, encoding="utf-8").read()
    missing, done = [], []
    for key, getter in BLOCKS.items():
        body = getter()
        if not body:
            missing.append(key)
            continue
        pattern = re.compile(
            r'(<script type="text/plain" id="%s">)(.*?)(</script>)' % re.escape(key),
            re.S,
        )
        if not pattern.search(html):
            missing.append(key + " (no block in index.html)")
            continue
        html = pattern.sub(lambda m: m.group(1) + safe(body) + m.group(3), html, count=1)
        done.append("%s (%d chars)" % (key, len(body)))

    io.open(INDEX, "w", encoding="utf-8", newline="").write(html)
    print("embedded: " + ", ".join(done))
    if missing:
        print("SKIPPED: " + ", ".join(missing), file=sys.stderr)


if __name__ == "__main__":
    main()
