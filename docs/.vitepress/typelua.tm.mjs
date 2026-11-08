// Custom Shiki grammar for TypeLua: the plain Lua grammar plus the dialect's
// contextual keywords and builtin type names.
//
// Why a clone instead of a hand-written grammar: the Lua rules (strings,
// long brackets, comments, numerals, stdlib members) are subtle; reusing them
// keeps highlighting right and only layers TypeLua additions on top.
import luaLangs from '@shikijs/langs/lua'

const lua = luaLangs.find((g) => g.name === 'lua')
if (!lua) throw new Error('shiki lua grammar not found')

// Grammars the Lua rules embed (currently `c` for [[...]] blocks).
export const embedded = luaLangs.filter((g) => g.name !== 'lua')

// Declaration / concurrency / FFI keywords (all contextual in TypeLua).
const KEYWORDS = [
  'type', 'interface', 'enum', 'class', 'extends', 'implements', 'abstract',
  'private', 'protected', 'public', 'static', 'readonly', 'export', 'declare',
  'keyof', 'typeof', 'infer', 'is', 'as', 'macro', 'async', 'await', 'spawn',
  'select', 'case', 'default', 'defer', 'errdefer', 'import', 'from', 'super',
  'constructor',
].join('|')

// Builtin type names. Lookbehind keeps `obj.type` and `t.string` untouched;
// lookup ahead `(?!\.)` keeps the `string` namespace in `string.format` plain.
const TYPES = [
  'number', 'string', 'boolean', 'integer', 'float', 'any', 'unknown', 'never',
  'void', 'cdata', 'ctype', 'map', 'Array', 'chan',
].join('|')

export default {
  ...lua,
  name: 'typelua',
  displayName: 'TypeLua',
  scopeName: 'source.typelua',
  patterns: [
    { match: `(?<![\\w.:])(${KEYWORDS})\\b`, name: 'keyword.control.typelua' },
    { match: `(?<![\\w.:])(${TYPES})(?!\\.)\\b`, name: 'support.type.typelua' },
    { match: '(?<![\\w.:])(self)(?![\\w:])', name: 'variable.language.self.typelua' },
    { match: '->|=>', name: 'keyword.operator.arrow.typelua' },
    ...lua.patterns,
  ],
}
