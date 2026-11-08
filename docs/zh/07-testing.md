# 测试（ZH）

`tlua test` 是零配置测试运行器：自动发现测试文件、先做全量类型检查、注入断言模块，
再逐个用例隔离运行。不需要额外的 harness 文件，也不依赖第三方库。

## 写一个测试

测试文件放在 `tests/`（或命名 `*_test.tl` / `*.test.tl`），返回「用例名 → 函数」表：

```lua
import T from "tlua_test"

local function add(a: number, b: number): number
  return a + b
end

return {
  ["整数相加"] = function(): void
    T.eq(add(1, 2), 3)
  end,
  ["字符串比较"] = function(): void
    T.ok("a" < "b")
    T.eq("x" .. "y", "xy")
  end,
  ["非法输入会抛错"] = function(): void
    T.raises(function(): void
      error("boom")
    end)
  end,
}
```

`tlua_test` 模块由命令自动注入到 `tlua_modules/tlua_test.tl`，检查器与运行时都能解析。

## 运行

```bash
tlua test                              # 发现 + 类型检查 + 运行（内嵌 golua）
tlua test tests/test_store.tl          # 指定文件或目录
tlua test --filter compaction          # 只跑模块/用例名含 compaction 的
tlua test --format=json                # 每行一个 JSON 对象
tlua test --lua lua5.4                 # 用原生 Lua 5.4
tlua test --lua luajit --target 5.1    # LuaJIT
```

输出示例：

```
tlua test · 4 file(s)
  ✓ tests.test_store / 整数相加
  ✗ tests.test_store / 非法输入会抛错
      非法输入会抛错: expected an error
  ✓ tests.test_store / 字符串比较

2 passed, 1 failed (3 checks)
  ✗ tests.test_store / 非法输入会抛错
```

任一用例失败，进程以 `1` 退出，CI 无需再包一层判断。

## 断言

| 方法 | 含义 |
|---|---|
| `T.eq(actual, expected, label?)` | 严格相等（表按引用比较） |
| `T.eqBytes(actual, expected, label?)` | 同 `eq`，用于二进制字节串 |
| `T.ok(cond, label?)` | 真值断言 |
| `T.raises(fn, label?)` | 断言 `fn` 抛错，返回错误信息 |
| `T.fail(message)` | 无条件失败 |

断言失败会终止当前用例，并带上 `模块 / 用例: 信息`。断言计数即 “checks”，
例如 “1160 checks” 表示 23 个用例里共有 1160 条断言。

## 实现方式

1. 发现 `tests/**/*.tl`、`*_test.tl`、`*.test.tl`（跳过 `tlua_modules`、`dist`、`testdata`）。
2. 加载整个工程，库模块一并参与类型检查与发射。
3. 注入 `tlua_modules/tlua_test.tl` 与生成的根 runner，按点式模块路径 `require` 每个测试文件。
4. 先检查；类型不通过直接输出诊断并退出，不运行任何用例。
5. 发射到临时目录执行；每个用例用 `pcall` 包裹，一个失败不影响其余用例。

## CI 配方

```yaml
- run: tlua check
- run: tlua test
- run: tlua test --lua lua5.4
- run: tlua test --lua luajit --target 5.1
```

`--format=json` 输出 NDJSON：每个用例一行对象，最后一行是
`{"summary":true,...}`，方便 agent 或看板消费。
