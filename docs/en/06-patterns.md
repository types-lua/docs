# Patterns & Fixes (EN)

## Wrap legacy Lua with a typed boundary

```typelua
-- legacy.lua returns an untyped table; keep it plain Lua.
-- legacy.tl (typed facade next to it)
local raw = require("legacy") as any
type Legacy = { parse(s: string): number }
local L = raw as Legacy
local n: number = L.parse("42")
print(n)
```

Prefer `as` at one place and export the `Legacy` type; don't sprinkle `any`.

## Module pattern (inferred, frozen at the edge)

```typelua
-- greet.tl
local Greet: { hello(name: string): string } = {
  hello = function(name: string): string return "hi " .. name end,
}
return Greet
```

```typelua
-- main.tl
import G from "greet"
print(G.hello("bo"))
```

If the boundary changes incompatibly, pin it explicitly
(`import G: Api from "greet"`) to get `TL3010` at the edge instead of
surprises inside.

## Error-fix table (what agents hit most)

| Code | Meaning | Fix |
|---|---|---|
| `TL2015` | Nesting > 256 | Split the expression/type/block; don't hand-nest 200+ deep. |
| `TL3010` | Not assignable | Add a narrow (`==nil`, `type(x)==`, `as T`) or fix the boundary `as`. |
| `TL3001` | Duplicate type | Ambient `.d.tl` + local share a name; rename the local. |
| `TL3103` | Undefined type | Import the file or add the `.d.tl`; check `types` allowlist. |
| `TL3106` | Recursive/over-deep generic | Route recursion through an object; avoid `L<L<T>>`-style self-feeding. |
| `TL3201` | Undefined variable | Declare before use; `self` only in methods. |
| `TL3203` | No such field | Narrow the union first; check `keyof`/optional (`?`). |
| `TL3232`/`TL3233` | Arity/type mismatch | Count args (methods pass `self`); match `(A, B)` multi-return. |
| `TL3234` | Bad explicit type args | Fill missing slots left-to-right; respect `extends` constraints. |
| `TL3310` | Visibility | `private` only inside the class; don't reach through instances for `static`. |
| `TL3602`/`TL3603` | Bad mapped/indexed access | Map only over literal-union/`keyof`/index-signature domains; ensure keys exist. |
| `TL37xx` | Macro misuse | Arity exact; statement macro stays in statement position; `...` last and only into call args. |
| `TL3801`/`TL3802` | `await`/`select` outside async | Mark the function `async` or move to the chunk top level. |
| `TL3805` | Sync calls async/blocking | `spawn` it, or make the caller `async` and `await` it. |
| `TL4001` | Cannot read file | Fix `include`/`exclude`/`rootDir`; `outDir` is never an input. |

## 5.1 checklist

- No `<const>`/`<close>`, no `//`, no bitwise ops, no `goto` into new scoping.
- `coroutine.close`/`isyieldable` don't exist (`TL3203`).
- `yield` cannot cross `pcall` or for-iterators; move the suspension out.
- FFI/`.so` runs need `--lua luajit`, never embedded `run`.

## Agent workflow (cheap → expensive)

1. `./tlua check --format=json` — fix `error` entries only (`warning` never fails the build).
2. Re-run the one failing file with `tlua run --check` for a fast repro.
3. For multi-file inference questions, read `SPEC.md` §3/§11, not LSP hover alone.
4. Keep new snippets minimal, then run `scripts/check_snippets.py` before pushing docs.
