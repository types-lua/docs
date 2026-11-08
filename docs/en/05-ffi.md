# FFI & Native (EN)

FFI needs LuaJIT: `--target 5.1` plus `--lua luajit`. The checker accepts FFI
types on 5.4 too, so snippets below still `check` clean everywhere.

## Direct FFI (explicit boundary)

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

- `cdata`/`ctype` never mix with `userdata` (`TL3010`; dubious conversions
  are `TL3204`).
- `cdef` strings are opaque and emitted verbatim; the author guarantees the C
  side. The type boundary is always hand-written `as CLib`.
- If the local `require` is shadowed, `require("ffi")` degrades to `any`
  (old code keeps working).

## bindgen (header is the single source)

```bash
tlua bindgen --header mylib.h --out types/mylib.d.tl --shim mylib.tl --lib MyLib
```

Generates a `type`/enum/`interface` contract plus an optional typed shim
(`require ffi` + `cdef` + script-dir `ffi.load` + single `as` + `return`).
Callers then `import` with zero casts. Point `--so` at the real shared object
when the filename differs from `lib<base>.so`.

## Cross-language shim (one mouth)

Hide the three shapes (C module / FFI-direct / shim process) behind
`require` + `.d.tl`:

```lua
-- native_shim.lua (HOW, plain Lua kept next to the .tl)
local M = {}
function M.native_add(a, b) return a + b end
return M
```

```lua
-- native.d.tl (WHAT, checks but never emits)
declare type NativeLib = { native_add(a: number, b: number): number }
```

```lua
-- main.tl (caller only sees require + as; in a real project NativeLib
-- comes from native.d.tl, here it is spelled locally so the file checks alone)
type NativeLib = { native_add(a: number, b: number): number }
local M = require("native_shim") as NativeLib
print(M.native_add(20, 22))
```

The recommended shape (`examples/c`) is: `.h` → `bindgen` → `.d.tl` → one
hand-written TypeLua shim (`cdef` + `ffi.load` + single `as`, ends with
`return M`) → callers `import C from "mylib"` with no casts.

## Assets and packaging

`build` passes through `*.lua` shims, `*.so`/`*.dylib`/`*.dll`, and `*.a`
into `dist` (same layout). `mod vendor` copies all four kinds into
`tlua_modules/<path>/`. `.a` never enters `package.cpath`: link it into the
host binary and call it via `ffi.C` instead of `ffi.load`. Keep headers and
docs out of `vendor` (cache only).

Watch tracks `ListNativeAssets` (`.lua`/`.so`/`.a` changes rebuild); `outDir`
is never watched.
