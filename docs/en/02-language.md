# Language reference (EN)

Covers SPEC §§2–6 + §8 essentials. Every snippet checks clean.

## Types

```lua
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

`integer`/`float` are subtypes of `number`. `T?` means `T | nil`.
`map<K, V>` field access requires `K` to accept `string` for dot access.
`keyof`/`typeof`/indexed access/conditionals are in Advanced below.

## Type aliases, interfaces, enums

```lua
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

Mixed string enums need explicit values on every member after the first
(`TL3120` otherwise). `interface` is structural; class instances are nominal.

## Functions (both type syntaxes work)

```lua
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

Multi-return is `-> (A, B)`; only the last call in an argument list expands.
Generic functions infer, or take explicit arguments:

```lua
local function id<T>(v: T): T return v end
local function first<T>(xs: T[]): T | nil
  if #xs == 0 then return nil end
  return xs[1]
end
print(id<string>("hi"), id<number>(7), first<string>({ "a", "b" }))
print(first<number>({}))
```

Explicit args also work on methods and constructors: `obj:m<T>()`, `C.new<T>()`.

## Narrowing (nil-safe Lua)

```lua
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

Truthiness also narrows (`if x then` drops `nil`/`false`), and member paths
narrow without a temporary:

```lua
type Node = { v: number, next: Node | nil }
local function second(n: Node): number
  if n.next then
    return n.next.v
  end
  return n.v
end
print(second({ v = 1, next = { v = 2, next = nil } }))
```

`x as T` passes when either direction is assignable; `x!` strips `nil`;
`!=` is `~=` and always emits as `~=`.

## Classes (nominal, block-scoped)

```lua
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

Rules: single `extends` + multiple `implements`; subclass instances assign to
base, unrelated classes never mix; `private`/`protected`/`readonly`/`static`/
`abstract` are compile-time; `super(...)` only in derived constructors before
`self`, `super:m(...)` for base methods; abstract classes cannot be
instantiated. Declare-only classes (`declare class`) emit nothing.

## Advanced types (conditional / keyof / indexed / mapped)

```lua
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

`infer` only appears inside an `extends` clause. Bare type parameters
distribute over unions. Indexed access requires every key to exist
(`TL3603`). `keyof` mappings inherit optionality/readonly unless `-?`/
`-readonly` forces the opposite. Recursive aliases must go through an object
(`type A = A` is `TL3106`).

## Imports are typed requires

```lua
-- math_utils.tl
local M: { double(n: number): number } = {
  double = function(n: number): number return n * 2 end,
}
return M
```

```lua
-- main.tl
import U from "math_utils"
print(U.double(21))
```

The checker infers the module type from `return M`; annotate the boundary
(`import U: T from "p"` or `require(...) as T`) to freeze it. Mismatches are
`TL3010`. Missing/circular/self imports degrade to `any`, never to a crash.

## Macros are hygienic

```lua
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

Expression macros use `=`, statement macros use `do ... end`. Parameters are
renamed per expansion (hygiene); statement macros in expression position are
`TL3704`; arity must match (`TL3702`); trailing `...` must be last and only
splices into call args (`TL3706`).
