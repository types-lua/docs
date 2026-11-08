# Testing (EN)

`tlua test` is the zero-configuration test runner: it discovers test files,
type-checks the whole project, injects a small assertion module and runs every
named case in isolation. No harness file, no dependencies.

## Write a test

Put files under `tests/` (or name them `*_test.tl` / `*.test.tl`) and return a
table of cases:

```lua
import T from "tlua_test"

local function add(a: number, b: number): number
  return a + b
end

return {
  ["adds numbers"] = function(): void
    T.eq(add(1, 2), 3)
  end,
  ["concatenates strings"] = function(): void
    T.ok("a" < "b")
    T.eq("x" .. "y", "xy")
  end,
  ["rejects bad input"] = function(): void
    T.raises(function(): void
      error("boom")
    end)
  end,
}
```

The `tlua_test` module is injected at `tlua_modules/tlua_test.tl`, so the
import resolves both for the checker and the runtime.

## Run

```bash
tlua test                              # discover + type-check + run (embedded golua)
tlua test tests/test_store.tl          # explicit files or directories
tlua test --filter compaction          # module or case name contains "compaction"
tlua test --format=json                # one JSON object per line
tlua test --lua lua5.4                 # stock Lua 5.4
tlua test --lua luajit --target 5.1    # LuaJIT build
```

Output:

```
tlua test · 4 file(s)
  ✓ tests.test_store / adds numbers
  ✗ tests.test_store / rejects bad input
      rejects bad input: expected an error
  ✓ tests.test_store / concatenates strings

2 passed, 1 failed (3 checks)
  ✗ tests.test_store / rejects bad input
```

The process exits `1` when any case fails, so CI needs no wrapper.

## Assertions

| Helper | Meaning |
|---|---|
| `T.eq(actual, expected, label?)` | Strict equality (numbers, strings, tables by identity) |
| `T.eqBytes(actual, expected, label?)` | Same as `eq`, documents binary payload intent |
| `T.ok(cond, label?)` | Truthy check |
| `T.raises(fn, label?)` | `fn` must raise; returns the message |
| `T.fail(message)` | Unconditional failure |

A failed assertion stops its case and is reported with `module / case: message`.
Failure details from assertions are counted as *checks*, so "1160 checks" means
1160 expectations across 23 cases.

## How it works

1. Discover `tests/**/*.tl`, `*_test.tl`, `*.test.tl` (skipping `tlua_modules`,
   `dist`, `testdata`).
2. Load the whole project, so library modules are type-checked and emitted too.
3. Inject `tlua_modules/tlua_test.tl` and a generated root runner that
   `require`s each test module by its dotted project path.
4. Check; abort with diagnostics if the project does not type-check.
5. Emit to a temp directory and execute the runner. Each case runs in `pcall`,
   so one failure does not hide the rest.

## CI recipe

```yaml
- run: tlua check
- run: tlua test
- run: tlua test --lua lua5.4
- run: tlua test --lua luajit --target 5.1
```

`--format=json` is NDJSON: one object per case plus a final
`{"summary":true,...}` line, which is convenient for agents and dashboards.
`tlua test --list --format=json` enumerates cases without running them
(`{"module","case","file"}` per line); the VS Code Test Explorer uses it, and
`--module NAME` / `--case NAME` run exactly one case.
