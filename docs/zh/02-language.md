# 语言参考（ZH）

覆盖 SPEC §§2–6 + §8 要点。所有片段均通过 `tlua check`。

## 类型

```typelua
local a: any = 1
local u: unknown = "s"
local n: number = 1.5
local i: integer = 3
local f: float = 1.5
local s: string = "hi"
local b: boolean = true
local t: table = {}
local lit: "red" = "red"
local num: 42 = 42
local arr: number[] = { 1, 2, 3 }
local m: map<string, number> = { alice = 3 }
local tup: [string, number] = { "age", 30 }
local uni: number | nil = nil
type Both = { a: number } & { b: string }
local inter: Both = { a = 1, b = "x" }
local opt: string? = nil
print(a, u, n, i, f, s, b, #arr, m.alice, tup[1], uni, inter, opt)
```

`integer`/`float` 是 `number` 的子类型。`T?` 即 `T | nil`。
`map<K, V>` 用点访问时要求 `K` 接受 `string`。

## 类型别名、接口、枚举

```typelua
type Point = { x: number, y: number }
type List<T> = { head: T, tail: List<T> | nil }
interface Named { name: string, greet(msg: string): string }
interface Employee extends Named { id: integer }
enum Color { Red = "red", Green = "green", Blue = "blue" }
enum N { A, B = 5, C }
local p: Point = { x = 1, y = 2 }
local c: Color = Color.Red
local e: Employee = {
  name = "bo",
  id = 7,
  greet = function(msg: string): string return msg .. "bo" end,
}
print(p.x, c, e.id, N.C)
```

混合字符串枚举从第二项起每项都要显式值，否则 `TL3120`。
`interface` 按结构兼容，类实例按名义兼容。

## 函数（两种返回标注都行）

```typelua
local function add(a: number, b: number): number return a + b end
local function divmod(a: number, b: number): (number, number) return a / b, a % b end
local function cat(...nums: number[]): string
  local out: string = ""
  for _, v in ipairs(nums) do out = out .. tostring(v) end
  return out
end
local q: number
local r: number
q, r = divmod(7, 2)
print(add(2, 3), q, r, cat(1, 2, 3))
```

多返回写成 `-> (A, B)`；只有实参列表最后一个调用可展开。
泛型自动推断，也可显式指定：

```typelua
local function id<T>(v: T): T return v end
local function first<T>(xs: T[]): T | nil
  if #xs == 0 then return nil end
  return xs[1]
end
print(id<string>("hi"), id<number>(7), first<string>({ "a", "b" }))
print(first<number>({}))
```

显式实参可用于方法与构造：`obj:m<T>()`、`C.new<T>()`。

## 窄化（写出 nil 安全的 Lua）

```typelua
local function use(x: number | string | nil): string
  if x == nil then
    return "none"
  end
  if type(x) == "string" then
    return "str:" .. x
  end
  return "num:" .. tostring(x + 1)
end
print(use(nil))
print(use("hi"))
print(use(41))
```

真值同样窄化（`if x then` 去掉 `nil`/`false`），成员路径无需临时变量：

```typelua
type Node = { v: number, next: Node | nil }
local function second(n: Node): number
  if n.next then
    return n.next.v
  end
  return n.v
end
print(second({ v = 1, next = { v = 2, next = nil } }))
```

`x as T` 在任一方向可赋时通过；`x!` 去掉 `nil`；`!=` 即 `~=`，发射恒为 `~=`。

## 类（名义类型、块作用域）

```typelua
abstract class Animal {
  name: string,
  constructor(name: string) self.name = name end,
  abstract speak(): string,
  describe(): string return "i am " .. self.name end,
}
class Dog extends Animal {
  tricks: string[] = {},
  static count: integer = 0,
  constructor(name: string) super(name) end,
  speak(): string return "woof" end,
}
local d = Dog.new("rex")
print(d:describe(), d:speak())
```

规则：单 `extends` + 多 `implements`；子类实例可赋给基类，无关类即使同形状也不兼容；
`private`/`protected`/`readonly`/`static`/`abstract` 只在编译期生效；
`super(...)` 只出现在派生构造器且在 `self` 之前，调基类方法用 `super:m(...)`；
抽象类不可实例化。`declare class` 无发射。

## 高级类型（条件 / keyof / 索引 / 映射）

```typelua
type IsString<T> = T extends string ? true : false
type Head<T> = T extends [infer H, ...unknown[]] ? H : never
type NameOf<T> = keyof T
local a: IsString<string> = true
local h: Head<[string, number]> = "first"
type P = { x: number, y?: string, readonly z: boolean }
local k: NameOf<P> = "x"
local px: P[string] = 1
type RO<T> = { readonly [K in keyof T]: T[K] }
print(a, h, k, px)
```

`infer` 只能出现在 `extends` 子句内。裸类型参数对联合分发。
索引访问要求键全部存在（`TL3603`）。`keyof` 映射默认继承可选/只读，
`-?`/`-readonly` 强制反转。递归别名必须经过对象（`type A = A` 报 `TL3106`）。

## import 是带类型的 require

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

检查器从 `return M` 推断模块类型；用 `import U: T from "p"` 或
`require(...) as T` 冻结边界，不一致报 `TL3010`。缺失/循环/自引用一律退化为
`any`，绝不崩溃。

## 宏是卫生的

```typelua
macro twice(x) = (x) + (x)
macro unless(cond, body) do
  if not (cond) then
    body
  end
end
local v: number = twice(20) + 1
unless(v == 0, print("nonzero"))
print(v)
```

表达式宏用 `=`，语句宏用 `do ... end`。形参逐次重命名（卫生）；
语句宏出现在表达式位置报 `TL3704`；元数必须精确（`TL3702`）；
尾部 `...` 必须末位且只能拼接到调用实参（`TL3706`）。
