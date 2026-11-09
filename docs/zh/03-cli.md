# 命令行与工具（ZH）

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

`types: []` 表示全部 ambient `.d.tl`（对标 `tsconfig.types`）。
`typeRoots` 默认为 `types` + `tlua_modules/@types`，缺目录忽略。
`.d.tl` 只检查不发射。

## 命令

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

`check`/`build`/`run --check` 支持 `--format=text|json`（默认 `text`，
退出码不变）。`watch` 保持文本流式日志。`--target` 只接受 `5.4`/`5.1`。
`build` 在无 `.tl` 文件时报 `no .tl files found`。

## JSON 诊断（给 Agent 用）

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

键稳定，按 file/line/column 排序。`code` 区间：
`TL1xxx` 词法、`TL2xxx` 语法、`TL3xxx` 类型检查、`TL37xx` 宏、
`TL38xx` 并发、`TL4xxx` 工程。`category` 由 code 派生。

## 包管理

```bash
./tlua mod init
./tlua mod get example.com/greet@v1.2.0
./tlua mod fetch
./tlua mod vendor
./tlua mod list
./tlua mod graph
```

模块即 git 仓库，地址即路径（`github.com/owner/repo[/sub]`），
`tlua.toml`/`tlua.lock` 锁定版本（MVS、`exact` pin、本地 `replace`）。
`vendor` 把 `*.tl` 拷到 `tlua_modules/<path>/`；构建把
`tlua_modules/**/*.tl` 发射到 `dist/tlua_modules/...` 并注入 bootstrap，
`lua dist/main.lua` 开箱即跑，无需配 `LUA_PATH`。

类型化依赖边界示例：

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

## 示例

`tlua example` 列出 `examples/*.tl` 与 `examples/*/main.tl`，按名字运行
（详见 [示例](./08-examples)）。

```bash
tlua example
tlua example basic --check
tlua example basic --lua lua5.4
```

## 测试

`tlua test` 自动发现 `tests/**`、先做全量类型检查、注入 `tlua_test` 断言模块，
再逐个用例运行（详见 [测试](./07-testing)）。

```bash
tlua test
tlua test --filter store --format=json
tlua test --lua lua5.4
```

## 调试

`tlua dap` 是 stdio 的 Debug Adapter Protocol 服务器；VS Code 扩展用它实现
`F5` 与测试浏览器调试（详见 [调试](./09-debugging)）。

```bash
tlua dap
tlua test --list --format=json
```

## LSP（stdio）

```bash
./tlua lsp
```

增量同步（`textDocumentSync: 2`）、悬停、跳转、`.`/`:` 补全（含成员）、
引用、重命名、文档符号。诊断经 `textDocument/publishDiagnostics` 推送
`{range, severity, code, source: "tlua", message}`。诊断会从最近的
`tlua.json`（`typeRoots`）加载 ambient `.d.tl`；跳转定义会进入真正的
`.d.tl` 文件，引用也标注真实文件；跨文件重命名会被拒绝（`import` 仍按单文件
处理）。工程级推断以 `tlua check` 为准。

## sourceMap 与 treeShake

```bash
./tlua build --sourceMap
./tlua build --treeShake
```

`--sourceMap` 输出 `<out>.lua.map`（V3 + `sourcesContent`）并在产物尾加
`--# sourceMappingURL=`。`--treeShake` 删除零引用的纯本地函数
（`local function f` / 单 `local x = function`，含传递闭包）。
全局/方法/表字段/`require`/`import`/`return` 可达/多值或带属性 locals 永不删除。
未知 AST 节点直接停摇（fail-safe）。
