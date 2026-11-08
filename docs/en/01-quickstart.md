# Quickstart (EN)

## 1. Install and scaffold

```bash
go build -o tlua ./cmd/tlua
./tlua init
./tlua check
./tlua build   # -> dist/*.lua
./tlua run main.tl -- arg1 arg2
```

`./tlua init` writes `tlua.json` plus a hello `main.tl` when missing.
`./tlua check` prints `checked N file(s): no errors` and exits 1 on error.
`./tlua build --watch` (or `./tlua watch`) recompiles on change like `tsc --watch`.

## 2. Your first typed program

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

Run it without leaving artifacts:

```bash
./tlua run --check main.tl
```

Expected output is `25`.

## 3. Target 5.4 vs 5.1

Default `target` is `5.4`. Use `5.1` for LuaJIT:

```json
{
  "compilerOptions": { "target": "5.1", "strict": true, "outDir": "dist", "rootDir": "." },
  "include": ["**/*.tl"],
  "exclude": ["dist"]
}
```

`--target 5.1` strips `<const>`/`<close>` and hides
`coroutine.close`/`coroutine.isyieldable`. FFI and `.so` modules always need
`--target 5.1` plus an external interpreter:

```bash
./tlua build --target 5.1
./tlua run --target 5.1 --lua luajit main.tl
```

The embedded `run` (golua) cannot load C modules by design.

## 4. Nil safety from the start

```typelua
local function greet(name: string | nil): string
  if name == nil then
    return "hello, stranger"
  end
  return "hello, " .. name
end
print(greet(nil))
print(greet("ada"))
```

`strictNilChecks` is on by default: `nil` is not assignable to `string`.
Narrow with `==nil`/`~=nil`, `type(x)`, `=="lit"`, truthiness, or member paths:

```typelua
type Node = { v: number, next: Node | nil }
local function head(n: Node | nil): number
  if n == nil then
    return 0
  end
  if n.next then
    return n.next.v
  end
  return n.v
end
print(head(nil))
print(head({ v = 7, next = { v = 8, next = nil } }))
```

## 5. Next steps

- Language details: `en/02-language.md`
- CLI + JSON diags + LSP: `en/03-cli.md`
- If `tlua check` fails, read the `TLxxxx` code in the fix table (`en/06-patterns.md`).
