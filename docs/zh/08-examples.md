# 示例（ZH）

`tlua example` 是 cargo 风格的示例工作流：先列出、再按名字运行，不需要写路径，
也不会留下构建产物。

```bash
tlua example                 # 列出示例与一句话说明
tlua example basic           # 运行 examples/basic.tl 或 examples/basic/main.tl
tlua example basic -- a b    # 透传参数
tlua example basic --check   # 先做完整类型检查
tlua example basic --lua lua5.4
```

## 目录布局

两种布局都支持，可以混用：

```
examples/
├── basic.tl          # 单文件示例
├── batch.tl
└── snapshots/
    └── main.tl       # 目录式示例（main.tl）
```

同名时目录式示例优先。列表输出：

```
examples · 3
  basic      Open, write, read, iterate, reopen and clean up.
  batch      Atomic writes with WriteBatch, then a compaction round.
  snapshots  Point-in-time reads: a snapshot ignores later writes.

run one with: tlua example NAME [-- args...]
```

## 说明文字

文件首行 `---` 注释即列表里的描述：

```lua
--- Open, write, read, iterate, reopen and clean up.

import leveldb from "leveldb"
-- ...
```

## 运行原理

命令会生成一个工程根部的包装入口（`require("examples.basic")`）再执行。
因为包装入口位于根目录，示例可以像普通模块一样用点式路径导入工程库；
同样的入口也适用于 `--lua lua5.4`、`--lua luajit --target 5.1`。

```
examples/basic.tl  ──包装──▶  require("examples.basic")
工程根在 package.path 上 ──▶  import leveldb from "leveldb"
```

## 库的示例

`typelua-leveldb` 就按这种方式提供并消费示例：

```bash
tlua example              # basic、batch、snapshots
tlua example basic
tlua example batch --lua lua5.4
```

配套的测试工作流见 [测试](./07-testing)。
