# TypeLua Docs (`types-lua/docs`)

User documentation for [TypeLua](https://github.com/types-lua/TypeLua) — the typed superset of Lua.
Compiler internals stay in the main repo (`SPEC.md`, `docs/`); this repo is what humans and LLM agents read first.

## For LLM agents: start here

| File | What |
|---|---|
| [`llms.txt`](./llms.txt) | Concise English index + cheat sheet (fits in context). |
| [`llms-full.txt`](./llms-full.txt) | Full English reference, self-contained (one file). |
| [`llms-zh.txt`](./llms-zh.txt) | 简明中文索引 + 速查表。 |
| [`llms-full-zh.txt`](./llms-full-zh.txt) | 完整中文参考，单文件自包含。 |
| [`en/`](./en/) | English guides (quickstart → language → CLI → concurrency → FFI → patterns). |
| [`zh/`](./zh/) | 中文指南（与 `en/` 对齐）。 |

Every ` ```lua ` snippet in this repo passes `tlua check` in a scratch project.
If a snippet needs LuaJIT/`.so` to *run*, it still *checks* clean on 5.4.

## For humans

- English: `en/00-index.md` → `en/01-quickstart.md` → `en/02-language.md` → `en/03-cli.md` → `en/04-concurrency.md` → `en/05-ffi.md` → `en/06-patterns.md`
- 中文：`zh/00-index.md` → `zh/01-quickstart.md` → …（同构）

## Create this repo under the org

```bash
gh repo create types-lua/docs --public --description "TypeLua language docs (EN/ZH + llms.txt)"
# then push this directory as main
git init -b main && git add -A && git commit -m "docs: TypeLua user docs + llms.txt (en/zh)"
git remote add origin https://github.com/types-lua/docs.git
git push -u origin main
```

## Verify snippets (required before every commit)

```bash
# from the TypeLua compiler repo:
go build -o /tmp/tlua ./cmd/tlua
python3 ./scripts/check_snippets.py /tmp/tlua
# must print ALL SNIPPETS PASS
```
