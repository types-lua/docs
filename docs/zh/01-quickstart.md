# 快速开始（ZH）

## 1. 安装与脚手架

```bash
go build -o tlua ./cmd/tlua
./tlua init
./tlua check
./tlua build   # -> dist/*.lua
./tlua run main.tl -- arg1 arg2
```

`init` 会写 `tlua.json` 并在缺失时附一个示例 `main.tl`。
`check` 成功打印 `checked N file(s): no errors`，失败 exit 1。
`build --watch`（或 `watch`）对标 `tsc --watch`，改动自动重编。

## 2. 第一个带类型的程序

```lua
type Point = { x: number, y: number }
local function dist(a: Point, b: Point): number
  local dx: number = a.x - b.x
  local dy: number = a.y - b.y
  return dx * dx + dy * dy
end
local p: Point = { x = 1, y = 2 }
print(dist(p, { x = 4, y = 6 }))
```

不落产物直接跑：

```bash
./tlua run --check main.tl
```

期望输出 `25`。

## 3. 目标 5.4 与 5.1

默认 `target` 为 `5.4`。跑 LuaJIT 用 `5.1`：

```json
{
  "compilerOptions": { "target": "5.1", "strict": true, "outDir": "dist", "rootDir": "." },
  "include": ["**/*.tl"],
  "exclude": ["dist"]
}
```

`--target 5.1` 会剥离 `<const>`/`<close>`，并隐藏
`coroutine.close`/`coroutine.isyieldable`。FFI 与 `.so` 模块必须
`--target 5.1` + 外部解释器：

```bash
./tlua build --target 5.1
./tlua run --target 5.1 --lua luajit main.tl
```

内嵌 `run`（golua）按设计不支持 C 模块加载器。

## 4. 从第一天就写 nil 安全的代码

```lua
local function greet(name: string | nil): string
  if name == nil then
    return "hello, stranger"
  end
  return "hello, " .. name
end
print(greet(nil))
print(greet("ada"))
```

`strictNilChecks` 默认开启：`nil` 不可赋给 `string`。
用 `==nil`/`~=nil`、`type(x)`、`=="lit"`、真值、成员路径窄化：

```lua
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

## 5. 下一步

- 语言细节：`zh/02-language.md`
- CLI + JSON 诊断 + LSP：`zh/03-cli.md`
- `tlua check` 报错时查排错表（`zh/06-patterns.md`）的 `TLxxxx`。
