# Debugging (EN)

`tlua dap` is a Debug Adapter Protocol server. The VS Code extension starts it
automatically; any DAP client can use it over stdio.

## From VS Code

Press `F5` on a `.tl` file, or run **TypeLua: Debug File**. A minimal
`launch.json`:

```json
{
  "type": "typelua",
  "request": "launch",
  "name": "Debug TypeLua",
  "program": "${file}",
  "args": [],
  "stopOnEntry": false,
  "check": false
}
```

| Field | Meaning |
|---|---|
| `program` | Entry `.tl` file (required) |
| `args` | Script arguments (`arg[1..]`) |
| `cwd` | Working directory (defaults to the workspace folder) |
| `lua` | Interpreter; default auto-detects `lua5.4`, then `luajit` |
| `target` | `5.4` (default) or `5.1` (LuaJIT) |
| `check` | Type-check before running |
| `stopOnEntry` | Break on the first executable line |
| `test` / `testCase` | Debug a test file / a single case |

Breakpoints, step in/over/out, the call stack, locals and program output all
work in the standard Debug view. Positions are mapped from emitted Lua back to
`.tl` lines through the compiler's statement-level source maps.

## Test Explorer

The Testing view lists discovered cases (`tests/**/*.tl`, `*_test.tl`,
`*.test.tl`). The inline ▶ runs a case through `tlua test`; the 🐞 starts a
debug session for it. Pass/fail flows back to the Testing view through a
custom `typelua/testResult` DAP event.

Discovery uses `tlua test --list`:

```bash
tlua test --list --format=json    # {"module","case","file"} per line
```

## How it works

1. Compile the project in memory with mappings (`compiler.Render`).
2. Write the emitted Lua and a debug configuration to a temp directory.
3. Run `dap_agent.lua` under the selected Lua interpreter. The agent installs
   line and call hooks, stops on mapped breakpoints or step conditions, and
   talks to the adapter over stderr (`##tlua-dap` prefix); program output stays
   on stdout.
4. The adapter translates bridge messages to DAP responses/events and maps
   runtime lines back to `.tl` positions.

## Limitations

- **Pause while running** is not implemented; breakpoints set during execution
  apply at the next stop.
- **Evaluate/watch expressions** and **set variable** are not supported.
- The debugger needs an external Lua interpreter (`lua5.4` or `luajit`); the
  embedded `tlua run` runtime has no local-variable inspection.
- FFI programs need `luajit` plus `--target 5.1`.
