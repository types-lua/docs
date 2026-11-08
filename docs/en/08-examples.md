# Examples (EN)

`tlua example` is the cargo-style examples workflow: list what exists, then run
one by name — no paths, no build artifacts.

```bash
tlua example                 # list examples with one-line descriptions
tlua example basic           # run examples/basic.tl or examples/basic/main.tl
tlua example basic -- a b    # pass arguments to the example
tlua example basic --check   # full type check first
tlua example basic --lua lua5.4
```

## Layout

Two layouts are supported and can be mixed:

```
examples/
├── basic.tl          # single-file example
├── batch.tl
└── snapshots/
    └── main.tl       # directory example (main.tl)
```

A directory example wins over a same-named file. Both are listed by name:

```
examples · 3
  basic      Open, write, read, iterate, reopen and clean up.
  batch      Atomic writes with WriteBatch, then a compaction round.
  snapshots  Point-in-time reads: a snapshot ignores later writes.

run one with: tlua example NAME [-- args...]
```

## Descriptions

The first `---` comment line becomes the list description:

```lua
--- Open, write, read, iterate, reopen and clean up.

import leveldb from "leveldb"
-- ...
```

## How running works

The command runs the example through a generated root-level wrapper
(`require("examples.basic")`). Because the wrapper lives at the project root,
the example can import project libraries with normal dotted paths, and the same
entry works with `--lua lua5.4` or `--lua luajit --target 5.1`.

```
examples/basic.tl  ──wrapper──▶  require("examples.basic")
project root on package.path ──▶  import leveldb from "leveldb"
```

## Library examples

`typelua-leveldb` ships its own examples and consumes them exactly this way:

```bash
tlua example              # basic, batch, snapshots
tlua example basic
tlua example batch --lua lua5.4
```

See [Testing](./07-testing) for the companion `tlua test` workflow.
