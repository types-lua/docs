import { defineConfig } from 'vitepress'
import typeluaGrammar, { embedded as typeluaDeps } from './typelua.tm.mjs'

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
  { text: 'Testing', link: '/en/07-testing' },
  { text: 'Examples', link: '/en/08-examples' },
]

const zhSidebar = [
  { text: '总览', link: '/zh/' },
  { text: '快速开始', link: '/zh/01-quickstart' },
  { text: '语言参考', link: '/zh/02-language' },
  { text: '命令行与工具', link: '/zh/03-cli' },
  { text: '并发', link: '/zh/04-concurrency' },
  { text: 'FFI 与原生', link: '/zh/05-ffi' },
  { text: '模式与排错', link: '/zh/06-patterns' },
  { text: '测试', link: '/zh/07-testing' },
  { text: '示例', link: '/zh/08-examples' },
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
  // Register the TypeLua dialect grammar; fenced blocks use ```typelua.
  markdown: {
    languages: [...typeluaDeps, typeluaGrammar],
  },
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
        // VitePress 1.6 ships no UI translations; spell the zh strings out.
        outline: { label: '本页目录', level: [2, 3] },
        docFooter: { prev: '上一篇', next: '下一篇' },
        lastUpdated: { text: '最后更新于' },
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        langMenuLabel: '切换语言',
        editLink: {
          pattern: 'https://github.com/types-lua/docs/edit/main/docs/:path',
          text: '在 GitHub 上编辑此页',
        },
        search: {
          provider: 'local',
          options: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                noResultsText: '没有找到结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },
  },
  themeConfig: {
    // Root (non-locale) landing page: it needs its own nav, because locale
    // navs only apply under /en/ and /zh/.
    nav: [
      { text: 'Guide', link: '/en/' },
      { text: '中文', link: '/zh/' },
      { text: 'llms.txt', link: `${SITE}/llms.txt` },
      { text: 'Compiler', link: 'https://github.com/types-lua/TypeLua' },
    ],
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
