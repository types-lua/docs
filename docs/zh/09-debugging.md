# 调试（ZH）

`tlua dap` 是一个 Debug Adapter Protocol 服务器。VS Code 扩展会自动启动它；
任何 DAP 客户端都可以通过 stdio 使用。

从 [vscode-typelua Releases](https://github.com/types-lua/vscode-typelua/releases)
安装扩展（`typelua-X.Y.Z.vsix`，可用随附的 `SHA256SUMS.txt` 校验）。

## 在 VS Code 中调试

在 `.tl` 文件上按 `F5`，或执行 **TypeLua: Debug File**。最小 `launch.json`：

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

| 字段 | 含义 |
|---|---|
| `program` | 入口 `.tl`（必填） |
| `args` | 脚本参数（`arg[1..]`） |
| `cwd` | 工作目录（默认工作区根） |
| `lua` | 解释器；默认自动选择 `lua5.4`，其次 `luajit` |
| `target` | `5.4`（默认）或 `5.1`（LuaJIT） |
| `check` | 运行前先做类型检查 |
| `stopOnEntry` | 在第一条可执行行断住 |
| `test` / `testCase` | 调试测试文件 / 单个用例 |

断点、单步（进入/跳过/跳出）、调用栈、局部变量与程序输出都在标准调试视图中
工作。位置通过编译器的语句级 source map 从发射后的 Lua 映射回 `.tl` 行。

## 测试浏览器

Testing 视图列出发现的用例（`tests/**/*.tl`、`*_test.tl`、`*.test.tl`）。
行内 ▶ 通过 `tlua test` 运行用例；🐞 为它启动调试会话。通过与失败经自定义
`typelua/testResult` DAP 事件回报到 Testing 视图。

发现使用 `tlua test --list`：

```bash
tlua test --list --format=json    # 每行 {"module","case","file"}
```

## 工作原理

1. 在内存中带映射地编译工程（`compiler.Render`）。
2. 把发射产物与调试配置写入临时目录。
3. 用选定的 Lua 解释器运行 `dap_agent.lua`。代理安装行/调用钩子，在命中的断点
   或单步条件处停下，并通过 stderr（`##tlua-dap` 前缀）与适配器通信；程序输出
   仍走 stdout。
4. 适配器把桥接消息翻译成 DAP 响应/事件，并把运行期行号映射回 `.tl` 位置。

## 限制

- **运行中暂停**尚未实现；执行期间设置的断点在下一次停下时生效。
- 不支持**表达式求值/监视**与**改变量**。
- 调试需要外部 Lua 解释器（`lua5.4` 或 `luajit`）；内嵌 `tlua run` 运行时不提供
  局部变量查看。
- FFI 程序需要 `luajit` + `--target 5.1`。
