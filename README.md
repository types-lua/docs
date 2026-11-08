# TypeLua Docs (`types-lua/docs`)

User documentation for [TypeLua](https://github.com/types-lua/TypeLua) — the typed superset of Lua.
Compiler internals stay in the main repo (`SPEC.md`, `docs/`); this repo is what humans and LLM agents read first.

## For LLM agents: start here

| File | What |
|---|---|
| [`llms.txt`](./docs/public/llms.txt) | Concise English index + cheat sheet (fits in context). |
| [`llms-full.txt`](./docs/public/llms-full.txt) | Full English reference, self-contained (one file). |
| [`llms-zh.txt`](./docs/public/llms-zh.txt) | 简明中文索引 + 速查表。 |
| [`llms-full-zh.txt`](./docs/public/llms-full-zh.txt) | 完整中文参考，单文件自包含。 |
| [`en/`](./docs/en/) | English guides (quickstart → language → CLI → concurrency → FFI → patterns). |
| [`zh/`](./docs/zh/) | 中文指南（与 `en/` 对齐）。 |

Every ` ```typelua ` snippet in this repo passes `tlua check` in a scratch project.
If a snippet needs LuaJIT/`.so` to *run*, it still *checks* clean on 5.4.

Code fences use `typelua`, a custom Shiki grammar
(`docs/.vitepress/typelua.tm.mjs`) that layers TypeLua's contextual keywords
(`type`, `interface`, `class`, `async`, `defer`, …) and builtin type names
(`number`, `string`, `map`, `chan`, …) on top of the Lua grammar. The code
face is self-hosted JetBrains Mono (`docs/.vitepress/theme/fonts/`, OFL-1.1),
so nothing depends on Google Fonts at runtime.

## For humans

- English: `en/index.md` → `en/01-quickstart.md` → `en/02-language.md` → `en/03-cli.md` → `en/04-concurrency.md` → `en/05-ffi.md` → `en/06-patterns.md`
- 中文：`zh/index.md` → `zh/01-quickstart.md` → …（同构）

## Live site (GitHub Pages)

- Site: `https://types-lua.github.io/docs/`
- Every push to `main` rebuilds via `.github/workflows/deploy.yml`
  (snippet verification with `tlua` → VitePress build → deploy).
- First-time setup: repo Settings → Pages → Source → **GitHub Actions**.

## Verify snippets (required before every commit)

```bash
# build tlua from the compiler repo, then verify from this repo root:
(cd /path/to/TypeLua && go build -o /tmp/tlua ./cmd/tlua)
python3 scripts/check_snippets.py /tmp/tlua
# must print ALL SNIPPETS PASS
```

## Visual QA (optional, local)

Two Playwright helpers catch layout regressions that a build cannot:

```bash
npm run docs:dev            # or build and serve dist under /docs/
export CHROME_BIN=$HOME/.cache/ms-playwright/chromium-*/chrome-linux*/chrome

# screenshot a page (width, dark, dpr, full, selector — all optional)
node scripts/shot.mjs http://127.0.0.1:5173/en/02-language /tmp/page.png 1440 "" 2

# report horizontal overflow outside scrollable code blocks
node scripts/audit.mjs http://127.0.0.1:5173/en/02-language 390
```

`shot.mjs` also fails loudly on console errors, failed requests and HTTP 4xx,
so a missing font or asset shows up immediately. `fontcheck.mjs` asserts the
computed font stack and that the self-hosted faces actually loaded:

```bash
node scripts/fontcheck.mjs https://types-lua.github.io/docs/en/02-language
```

