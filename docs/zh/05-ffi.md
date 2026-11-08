# FFI 与原生（ZH）

FFI 需要 LuaJIT：`--target 5.1` + `--lua luajit`。检查器在 5.4 下同样接受
FFI 类型，因此以下片段在任何目标下都 `check` 通过。

## 直接 FFI（显式边界）

```lua
local ffi = require("ffi")
ffi.cdef[[
  int add(int a, int b);
]]
type CLib = { add(a: integer, b: integer): integer }
local C = ffi.load("mylib") as CLib
local n: number = C.add(20, 22)
print(n)
```

- `cdata`/`ctype` 永不与 `userdata` 混用（`TL3010`；可疑转换 `TL3204`）。
- `cdef` 字符串不透明、原样透传，C 侧由作者保证；类型边界一律手写 `as CLib`。
- 局部 `require` 被遮蔽时 `require("ffi")` 整体回退为 `any`（老代码零误报）。

## bindgen（头文件为唯一源）

```bash
tlua bindgen --header mylib.h --out types/mylib.d.tl --shim mylib.tl --lib MyLib
```

生成 `type`/枚举/`interface` 契约，可选同步生成 typed shim
（`require ffi` + 去卫士 `cdef` + 脚本目录 `ffi.load` + 唯一 `as` + `return`）。
调用方 `import` 零 cast。文件名与 `lib<基名>.so` 不一致时用 `--so` 指定。

## 跨语言 shim（一口收敛）

把三种形态（C 模块 / FFI 直调 / shim 进程）藏进 `require` + `.d.tl`：

```lua
-- native_shim.lua（HOW，普通 Lua，与 .tl 同目录）
local M = {}
function M.native_add(a, b) return a + b end
return M
```

```lua
-- native.d.tl（WHAT，只检查不发射）
declare type NativeLib = { native_add(a: number, b: number): number }
```

```lua
-- main.tl（调用方只认 require + as；真实工程里 NativeLib 来自 native.d.tl，
-- 这里为单文件可验而在本地拼写）
type NativeLib = { native_add(a: number, b: number): number }
local M = require("native_shim") as NativeLib
print(M.native_add(20, 22))
```

推荐形态（`examples/c`）：`.h` → `bindgen` → `.d.tl` → 一次封装的 TypeLua
shim（`cdef` + `ffi.load` + 唯一 `as`，末尾 `return M`）→ 调用方
`import C from "mylib"` 零 cast。

## 资产与打包

`build` 透传 `*.lua` shim、`*.so`/`*.dylib`/`*.dll`、`*.a` 到 `dist`（同布局）。
`mod vendor` 把四类文件拷进 `tlua_modules/<path>/`。`.a` 永不进
`package.cpath`：把它链进宿主可执行文件，运行时经 `ffi.C` 直调。
头文件与文档只进缓存，不进 vendor。

监听集含 `ListNativeAssets`（`.lua`/`.so`/`.a` 改动触发重编）；
`outDir` 恒不监听。
