# Concurrency (EN)

Single-threaded CSP on coroutines: no true parallelism. `async`/`await` are
explicit markers that erase to plain calls.

## defer / errdefer (LIFO cleanup)

```lua
local function read(name: string): number
  local log: { close(): void } = {
    close = function(): void print("close", name) end,
  }
  local function closeLog(): void log.close() end
  defer closeLog()
  if name == "" then
    return 0
  end
  return 1
end
print(read("a"))
print(read(""))
```

`defer f()` / `errdefer f()` take a call, run LIFO at function exit, and
capture lazily (Lua closure rules). `errdefer` runs only when the same
function leaves via an explicit `error(...)`. Never pass bare `...`
(`TL3235`).

## Coroutines (typed)

```lua
local co: thread = coroutine.create(function()
  coroutine.yield("step")
end)
local ok: boolean
local v: any
ok, v = coroutine.resume(co)
print(ok, v)
print(coroutine.status(co))
```

`create` requires a function (`TL3233`); `resume` returns `(boolean, any)`;
`running()` returns `(thread, boolean | nil)`; `close`/`isyieldable` exist
only on 5.4 (`TL3203` on 5.1). Literal `status(co) == "dead"` narrows.

## async / await + spawn + chan + select

```lua
local jobs: chan<integer> = makeChan<integer>(4)
local done: chan<boolean> = makeChan<boolean>(1)

async function worker(): void
  while true do
    local v: integer
    local ok: boolean
    v, ok = await jobs:recv()
    if not ok then
      await done:send(true)
      return
    end
    print("did", v)
  end
end

async function main(): void
  spawn worker()
  await jobs:send(1)
  await jobs:send(2)
  jobs:close()
  local d: boolean
  local ok2: boolean
  d, ok2 = await done:recv()
  print("done", d, ok2)
end

await main()
```

Rules agents trip on:

- `await`/`select` only inside `async` functions or the top-level chunk
  (`TL3801`/`TL3802`).
- Sync functions cannot call `async` functions or blocking primitives
  (`sleep`/`timeout`, `ch:send`/`ch:recv`, `wg:wait`, `mu:lock`) — `TL3805`.
  `spawn` is exempt.
- `chan<T>` is invariant; `makeChan<T>(cap?)` must spell `T` (`TL3803`).
- `recv()` returns `(T, boolean)` (`ok=false` when closed and drained);
  `send` on a closed channel errors; `close` twice errors.
- `select` uses braces with `case` guards and optional trailing `default`:

```lua
local ch: chan<integer> = makeChan<integer>(1)
await ch:send(9)
select {
  case local v = ch:recv() then
    print("got", v)
  case timeout(5.0) then
    print("timed out")
  default then
    print("busy")
}
```

Only `recv`/`send`/`timeout`/`sleep` guards are allowed. First ready case in
source order wins (not random). `break` exits the select; `return`/`defer`
behave normally. `for v in ch:iter() do` drains until close but cannot wait
inside `--target 5.1` iterators.

`WaitGroup`/`Mutex` follow Go spelling (`new`/`add`/`done`/`wait`,
`new`/`lock`/`unlock`/`tryLock`) with `await` on `wait`/`lock`.
