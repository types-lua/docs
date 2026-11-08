# TypeLua —— 中文总览

> TypeLua 是带可擦除静态类型的 Lua（TypeScript-for-Lua）。默认产物为地道 Lua 5.4，兼容 5.1/LuaJIT。只有 `class`/`enum` 会产生运行时值。

## 阅读顺序

1. `zh/index.md` —— 总览（先读）
2. `zh/01-quickstart.md` —— 5 分钟上手
3. `zh/02-language.md` —— 类型、声明、窄化、类、泛型
4. `zh/03-cli.md` —— `tlua.json`、CLI、`--format=json`、LSP、诊断
5. `zh/04-concurrency.md` —— `defer`、协程、`async`/`await`/`spawn`/`chan`/`select`
6. `zh/05-ffi.md` —— FFI、`bindgen`、跨语言 shim、`.d.tl`、包管理
7. `zh/06-patterns.md` —— Agent 实战模式 + 排错表

## 最小程序（已验证）

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

## tlua.json（稳妥默认）

```json
{
  "compilerOptions": { "target": "5.4", "strict": true, "outDir": "dist", "rootDir": "." },
  "include": ["**/*.tl"],
  "exclude": ["dist"]
}
```

## Agent 常用命令

```bash
go build -o tlua ./cmd/tlua
./tlua check --format=json
./tlua build
./tlua run --check main.tl
```

完整英文单文件：`llms-full.txt`；完整中文单文件：`llms-full-zh.txt`。
语言契约以编译器仓库的 `SPEC.md` 为准，25 个可运行示例在 `examples/`。
