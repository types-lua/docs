# 模式与排错（ZH）

## 给老 Lua 包一层类型边界

```lua
-- legacy.lua 返回无类型表，保持普通 Lua。
-- legacy.tl（并排的类型门面）
local raw = require("legacy") as any
type Legacy = { parse(s: string): number }
local L = raw as Legacy
local n: number = L.parse("42")
print(n)
```

`as` 只收敛一处，对外导出 `Legacy` 类型；不要到处撒 `any`。

## 模块模式（推断 + 边缘冻结）

```lua
-- greet.tl
local Greet: { hello(name: string): string } = {
  hello = function(name: string): string return "hi " .. name end,
}
return Greet
```

```lua
-- main.tl
import G from "greet"
print(G.hello("bo"))
```

边界变化大时显式冻结（`import G: Api from "greet"`），让 `TL3010` 拦在边缘，
而不是渗进内部。

## 排错表（Agent 最常遇到）

| Code | 含义 | 修法 |
|---|---|---|
| `TL2015` | 嵌套超 256 层 | 拆表达式/类型/块；不要手写 200+ 层嵌套。 |
| `TL3010` | 不可赋 | 加窄化（`==nil`、`type(x)==`、`as T`）或修正边界 `as`。 |
| `TL3001` | 类型重定义 | ambient `.d.tl` 与局部同名；改局部名。 |
| `TL3103` | 未定义类型 | 引入文件或补 `.d.tl`；检查 `types` 白名单。 |
| `TL3106` | 递归/实例化过深 | 递归走对象；避免 `L<L<T>>` 自喂养。 |
| `TL3201` | 未定义变量 | 先声明后使用；`self` 只在方法内。 |
| `TL3203` | 无此字段 | 先窄化联合；检查 `keyof`/可选（`?`）。 |
| `TL3232`/`TL3233` | 参数个数/类型 | 数清实参（方法自带 `self`）；对齐 `(A, B)` 多返回。 |
| `TL3234` | 显式实参非法 | 缺位从左到右补齐；遵守 `extends` 约束。 |
| `TL3310` | 可见性 | `private` 只在类内；`static` 不经实例调。 |
| `TL3602`/`TL3603` | 映射/索引非法 | 映射域只用字面量并/`keyof`/索引签名；确保键存在。 |
| `TL37xx` | 宏误用 | 元数精确；语句宏留在语句位；`...` 末位且只进调用实参。 |
| `TL3801`/`TL3802` | `await`/`select` 越界 | 函数标 `async` 或搬到 chunk 顶层。 |
| `TL3805` | 同步调 async/阻塞 | `spawn` 或把调用方改 `async` + `await`。 |
| `TL4001` | 文件不可读 | 修 `include`/`exclude`/`rootDir`；`outDir` 永不作为输入。 |

## 5.1 检查单

- 无 `<const>`/`<close>`、无 `//`、无位运算、无跨作用域 `goto`。
- `coroutine.close`/`isyieldable` 不存在（`TL3203`）。
- `yield` 不可穿 `pcall` 或 for 迭代器；把挂起点移出来。
- FFI/`.so` 必须 `--lua luajit`，永不用内嵌 `run`。

## Agent 工作流（从便宜到贵）

1. `./tlua check --format=json` —— 只修 `error`（`warning` 不失败）。
2. 单文件复现：`tlua run --check <file>`。
3. 多文件推断问题读 SPEC §3/§11，别只看 LSP 悬停。
4. 文档新片段保持最小，提交前跑 `scripts/check_snippets.py`。
