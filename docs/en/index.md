# TypeLua — English index

> TypeLua is Lua with erasable static types (TypeScript-for-Lua). Default target Lua 5.4, compatible with 5.1/LuaJIT. `class`/`enum` are the only type-level constructs with runtime values.

## Reading order

1. `en/index.md` — what/why, doc map (read first)
2. `en/01-quickstart.md` — init/check/build/run in 5 minutes
3. `en/02-language.md` — types, declarations, narrowing, classes, generics
4. `en/03-cli.md` — `tlua.json`, CLI flags, `--format=json`, LSP, diagnostics
5. `en/04-concurrency.md` — `defer`, coroutines, `async`/`await`/`spawn`/`chan`/`select`
6. `en/05-ffi.md` — FFI, `bindgen`, cross-language shims, `.d.tl`, packaging
7. `en/06-patterns.md` — agent recipes + error-fix table

## Minimal program (verified)

```typelua
type Point = { x: number, y: number }
local function dist(a: Point, b: Point): number
  local dx: number = a.x - b.x
  local dy: number = a.y - b.y
  return dx * dx + dy * dy
end
local p: Point = { x = 1, y = 2 }
print(dist(p, { x = 4, y = 6 }))
```

## tlua.json (sane default)

```json
{
  "compilerOptions": { "target": "5.4", "strict": true, "outDir": "dist", "rootDir": "." },
  "include": ["**/*.tl"],
  "exclude": ["dist"]
}
```

## Agent commands

```bash
go build -o tlua ./cmd/tlua
./tlua check --format=json
./tlua build
./tlua run --check main.tl
```

Full reference: `llms-full.txt`. Chinese: `llms-zh.txt` / `llms-full-zh.txt`.
Contract: `https://github.com/types-lua/TypeLua/blob/main/SPEC.md`.
Runnable idioms: `https://github.com/types-lua/TypeLua/tree/main/examples`.
