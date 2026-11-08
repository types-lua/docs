// Layout audit: detect horizontal overflow that actually breaks the page.
// Elements inside a scrollable ancestor (code blocks, wide tables) are fine.
// Usage: CHROME_BIN=<path> node scripts/audit.mjs <url> [width]
import { chromium } from 'playwright-core'

const exe = process.env.CHROME_BIN
const [url, width = '1440'] = process.argv.slice(2)
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: Number(width), height: 1000 } })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(250)

const report = await page.evaluate(() => {
  const doc = document.documentElement
  const vw = doc.clientWidth
  const scrollableAncestor = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p)
      if (/(auto|scroll)/.test(s.overflowX) && p.scrollWidth > p.clientWidth) return p
    }
    return null
  }
  const offenders = []
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) continue
    if (r.right <= vw + 1) continue
    const s = getComputedStyle(el)
    if (s.position === 'fixed') continue
    if (scrollableAncestor(el)) continue
    offenders.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className && String(el.className).slice(0, 60)) || '',
      left: Math.round(r.left),
      right: Math.round(r.right),
    })
  }
  return { viewport: vw, scrollWidth: doc.scrollWidth, overflow: doc.scrollWidth - vw, offenders: offenders.slice(0, 10) }
})
console.log(JSON.stringify(report, null, 2))
await browser.close()
