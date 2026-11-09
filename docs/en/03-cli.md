# CLI & Tooling (EN)

## tlua.json

```json
{
  "compilerOptions": {
    "target": "5.4",
    "strict": true,
    "strictNilChecks": true,
    "noImplicitAny": false,
    "outDir": "dist",
    "rootDir": ".",
    "sourceMap": false,
    "treeShake": false,
    "types": [],
    "typeRoots": ["types", "tlua_modules/@types"]
  },
  "include": ["**/*.tl"],
  "exclude": ["dist"]
}
```

`types: []` means all ambient `.d.tl` files (mirrors `tsconfig.types`).
`typeRoots` defaults are `types` + `tlua_modules/@types`; missing dirs are ignored.
`.d.tl` files check but never emit.

## Commands

```bash
./tlua init
./tlua check
./tlua check --format=json
./tlua build --target 5.1 --treeShake
./tlua build --format=json
./tlua run main.tl -- arg1 arg2
./tlua run --check --format=json main.tl
./tlua run --lua luajit --target 5.1 main.tl
./tlua watch
./tlua bindgen --header foo.h --out types/foo.d.tl --shim foo.tl
./tlua lsp
```

`check`/`build`/`run --check` accept `--format=text|json` (default `text`,
exit code unchanged). `watch` stays text (streaming logs). `--target` only
accepts `5.4`/`5.1`. `build` with no `.tl` files is `no .tl files found`.

## JSON diagnostics (for agents)

```bash
./tlua check --format=json
```

```json
[
  {
    "file": "bad.tl",
    "line": 1,
    "column": 7,
    "endLine": 1,
    "endColumn": 8,
    "severity": "error",
    "code": "TL3010",
    "category": "checker",
    "message": "type '\"oops\"' is not assignable to type 'number'"
  }
]
```

Keys are stable and sorted by file/line/column. `code` ranges:
`TL1xxx` lexer, `TL2xxx` parser, `TL3xxx` checker, `TL37xx` macros,
`TL38xx` concurrency, `TL4xxx` project. `category` derives from the code.

## Packages

```bash
./tlua mod init
./tlua mod get example.com/greet@v1.2.0
./tlua mod fetch
./tlua mod vendor
./tlua mod list
./tlua mod graph
```

Modules are git repos addressed by path (`github.com/owner/repo[/sub]`),
pinned in `tlua.toml`/`tlua.lock` (MVS, `exact` pins, `replace` for local
paths). `vendor` copies `*.tl` into `tlua_modules/<path>/`; builds emit
`tlua_modules/**/*.tl` to `dist/tlua_modules/...` and inject a bootstrap
prelude so `lua dist/main.lua` runs without `LUA_PATH` setup.

A typed dependency boundary looks like this:

```typelua
-- math_utils.tl
local M: { double(n: number): number } = {
  double = function(n: number): number return n * 2 end,
}
return M
```

```typelua
-- main.tl
import U from "math_utils"
print(U.double(21))
```

## Examples

`tlua example` lists `examples/*.tl` and `examples/*/main.tl` and runs one by
name (see [Examples](./08-examples)).

```bash
tlua example
tlua example basic --check
tlua example basic --lua lua5.4
```

## Testing

`tlua test` discovers `tests/**`, type-checks the project, injects the
`tlua_test` helper and runs every named case (see [Testing](./07-testing)).

```bash
tlua test
tlua test --filter store --format=json
tlua test --lua lua5.4
```

## Debugging

`tlua dap` is a stdio Debug Adapter Protocol server; the VS Code extension
starts it for `F5`/Test Explorer debugging (see [Debugging](./09-debugging)).

```bash
tlua dap
tlua test --list --format=json
```

## LSP (stdio)

```bash
./tlua lsp
```

Incremental sync (`textDocumentSync: 2`), hover, definition, completion on
`.`/`:` (members included), references, rename, document symbols. Diagnostics
push as `textDocument/publishDiagnostics` with `{range, severity, code,
source: "tlua", message}`. Diagnostics load ambient `.d.tl` declarations
from the nearest `tlua.json` (`typeRoots`). Go-to-definition follows ambient
declarations into their `.d.tl` file and references label the real files;
cross-file rename is refused because imports are still single-file. Use
`tlua check` for project-wide inference.

## sourceMap and treeShake

```bash
./tlua build --sourceMap
./tlua build --treeShake
```

`--sourceMap` writes `<out>.lua.map` (V3 + `sourcesContent`) plus a
`--# sourceMappingURL=` footer. `--treeShake` drops zero-reference pure local
functions (`local function f` / single `local x = function`, transitive).
Globals, methods, table fields, `require`/`import`, `return`-reachable and
multi-value/attributed locals are never removed. Unknown AST nodes disable
shaking for that file (fail-safe).
