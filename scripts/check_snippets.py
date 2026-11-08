#!/usr/bin/env python3
"""Extract every ```lua (TypeLua) block and verify `tlua check` passes.

Usage: python3 scripts/check_snippets.py /tmp/tlua [--docs docs]
Exit 0 on ALL SNIPPETS PASS, 1 otherwise. Each block runs in isolation
(single-file project) unless it contains '-- FILE:' markers for multi-file.
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

BLOCK = re.compile(r"```(lua|tl|typelua)\s*\n(.*?)```", re.S)

def docs_root() -> Path:
    for a in sys.argv[2:]:
        if not a.startswith("-"):
            return Path(a)
    # scripts/ -> repo root -> docs/
    root = Path(__file__).resolve().parent.parent
    return root / "docs"

def main() -> int:
    tlua = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/tlua")
    docs = docs_root()
    files = sorted(docs.rglob("*.md")) + sorted((docs / "public").glob("llms*.txt"))
    blocks: list[tuple[Path, int, str]] = []
    for f in files:
        if not f.is_file():
            continue
        text = f.read_text(encoding="utf-8")
        for i, m in enumerate(BLOCK.finditer(text)):
            code = m.group(2).strip() + "\n"
            # skip intentional bad examples marked with TL error code + BAD
            head = "\n".join(text[: m.start()].splitlines()[-3:])
            if "BAD" in head and "TL" in head:
                continue
            blocks.append((f, i, code))
    print(f"found {len(blocks)} snippet(s) in {docs}")
    failures = 0
    for f, i, code in blocks:
        # multi-file: split on '-- FILE: name'
        parts = re.split(r"-- FILE:\s*(\S+)", code)
        with tempfile.TemporaryDirectory() as td:
            td = Path(td)
            if len(parts) > 1:
                # parts[0] is preamble (usually empty), then name, body, ...
                for j in range(1, len(parts), 2):
                    name = parts[j].strip()
                    body = parts[j + 1] if j + 1 < len(parts) else ""
                    (td / name).parent.mkdir(parents=True, exist_ok=True)
                    (td / name).write_text(body, encoding="utf-8")
                if not (td / "tlua.json").exists():
                    (td / "tlua.json").write_text(
                        '{"compilerOptions":{"target":"5.4","strict":true,"strictNilChecks":true,'
                        '"noImplicitAny":false,"rootDir":".","outDir":"dist"},'
                        '"include":["**/*.tl"],"exclude":["dist"]}',
                        encoding="utf-8",
                    )
            else:
                (td / "tlua.json").write_text(
                    '{"compilerOptions":{"target":"5.4","strict":true,"strictNilChecks":true,'
                    '"noImplicitAny":false,"rootDir":".","outDir":"dist"},'
                    '"include":["**/*.tl"],"exclude":["dist"]}',
                    encoding="utf-8",
                )
                (td / "main.tl").write_text(code, encoding="utf-8")
            r = subprocess.run([str(tlua), "check"], cwd=td, capture_output=True, text=True)
            if r.returncode != 0 or "error" in (r.stdout + r.stderr).lower().split("no errors")[0].lower():
                # careful: success prints "no errors"; failure prints "error(s)"
                if "no errors" not in (r.stdout + r.stderr):
                    failures += 1
                    print(f"FAIL {f.relative_to(docs)} block#{i}")
                    print((r.stdout + r.stderr)[: 2000])
    if failures:
        print(f"{failures} snippet(s) FAILED")
        return 1
    print("ALL SNIPPETS PASS")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
