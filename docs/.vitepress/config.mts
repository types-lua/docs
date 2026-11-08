import { defineConfig } from 'vitepress'

// Site URL: https://types-lua.github.io/docs/
// Both languages are prefixed locales (/en/, /zh/) so VitePress's language
// switcher maps /en/x <-> /zh/x correctly. The unprefixed / root page is the
// project landing (not a locale home), which keeps switcher math simple.
const SITE = 'https://types-lua.github.io/docs'

const enSidebar = [
  { text: 'Index', link: '/en/' },
  { text: 'Quickstart', link: '/en/01-quickstart' },
  { text: 'Language', link: '/en/02-language' },
  { text: 'CLI & Tooling', link: '/en/03-cli' },
  { text: 'Concurrency', link: '/en/04-concurrency' },
  { text: 'FFI & Native', link: '/en/05-ffi' },
  { text: 'Patterns & Fixes', link: '/en/06-patterns' },
]

const zhSidebar = [
  { text: '总览', link: '/zh/' },
  { text: '快速开始', link: '/zh/01-quickstart' },
  { text: '语言参考', link: '/zh/02-language' },
  { text: '命令行与工具', link: '/zh/03-cli' },
  { text: '并发', link: '/zh/04-concurrency' },
  { text: 'FFI 与原生', link: '/zh/05-ffi' },
  { text: '模式与排错', link: '/zh/06-patterns' },
]

export default defineConfig({
  title: 'TypeLua',
  description: 'TypeLua — typed superset of Lua (EN/ZH docs + llms.txt)',
  lang: 'en-US',
  // Org site serves this repo at https://types-lua.github.io/docs/.
  base: '/docs/',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: false,
  head: [
    ['link', { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌙</text></svg>' }],
    ['meta', { name: 'theme-color', content: '#5b5bd6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'TypeLua Docs' }],
    ['meta', { property: 'og:description', content: 'Typed superset of Lua — EN/ZH guides, CLI reference, llms.txt for agents.' }],
  ],
  locales: {
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'TypeLua',
      description: 'Typed superset of Lua — guides for humans and LLM agents.',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/' },
          // Static files under public/ are NOT rewritten with base; use the
          // absolute site URL so these links work from any page depth.
          { text: 'llms.txt', link: `${SITE}/llms.txt` },
          { text: 'Compiler', link: 'https://github.com/types-lua/TypeLua' },
        ],
        sidebar: { '/en/': enSidebar },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'TypeLua 文档',
      description: 'TypeLua —— 带类型的 Lua（中英双语 + llms.txt）。',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/' },
          { text: 'llms-zh.txt', link: `${SITE}/llms-zh.txt` },
          { text: '编译器', link: 'https://github.com/types-lua/TypeLua' },
        ],
        sidebar: { '/zh/': zhSidebar },
      },
    },
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/types-lua/TypeLua' },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    editLink: {
      pattern: 'https://github.com/types-lua/docs/edit/main/docs/:path',
      text: 'Edit this page',
    },
  },
})
