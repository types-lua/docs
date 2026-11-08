# 并发（ZH）

单线程协作式 CSP（基于协程）：无真并行。`async`/`await` 只是显式挂点标记，
擦除后为普通调用。

## defer / errdefer（LIFO 清理）

```typelua
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

`defer f()` / `errdefer f()` 只接受调用（`f()`、`obj:m()`），函数退出时 LIFO
运行，捕获是惰性的（Lua 闭包规则）。`errdefer` 仅在同一函数内显式
`error(...)` 离开时触发。禁止直接传裸 `...`（`TL3235`）。

## 协程（带类型）

```typelua
local co: thread = coroutine.create(function()
  coroutine.yield("step")
end)
local ok: boolean
local v: any
ok, v = coroutine.resume(co)
print(ok, v)
print(coroutine.status(co))
```

`create` 要求函数（否则 `TL3233`）；`resume` 返回 `(boolean, any)`；
`running()` 返回 `(thread, boolean | nil)`；`close`/`isyieldable` 仅 5.4
存在（5.1 下 `TL3203`）。`status(co) == "dead"` 字面量参与窄化。

## async / await + spawn + chan + select

```typelua
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

Agent 最常踩的规则：

- `await`/`select` 只能在 `async` 函数或顶层 chunk（否则 `TL3801`/`TL3802`）。
- 同步函数不可调用 `async` 函数或阻塞原语（`sleep`/`timeout`、`ch:send`/
  `ch:recv`、`wg:wait`、`mu:lock`），否则 `TL3805`。`spawn` 豁免。
- `chan<T>` 不变；`makeChan<T>(cap?)` 必须显式写 `T`（否则 `TL3803`）。
- `recv()` 返回 `(T, boolean)`（close 且排空后 `ok=false`）；
  已 close 的通道 `send` 报错；`close` 两次报错。
- `select` 用大括号 + `case` 守卫 + 可选末位 `default`：

```typelua
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

守卫只允许收/发/超时。多个就绪按源码序取第一个（非随机）。
`break` 退出 select；`return`/`defer` 照常。`for v in ch:iter() do`
读到 close 为止，但在 `--target 5.1` 迭代器内不可等待。

`WaitGroup`/`Mutex` 沿用 Go 拼写（`new`/`add`/`done`/`wait`、
`new`/`lock`/`unlock`/`tryLock`），`wait`/`lock` 需 `await`。
