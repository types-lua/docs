// Verify that the intended fonts are actually applied (not just requested).
// Usage: CHROME_BIN=<path> node scripts/fontcheck.mjs <url>
import { chromium } from 'playwright-core'

const exe = process.env.CHROME_BIN
const url = process.argv[2]
if (!url || !exe) {
  console.error('usage: CHROME_BIN=<path> node scripts/fontcheck.mjs <url>')
  process.exit(2)
}
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const failed = []
page.on('requestfailed', (r) => failed.push(r.url()))
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`) })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

const res = await page.evaluate(async () => {
  await document.fonts.ready
  const code = document.querySelector('.vp-doc div[class*="language-"] code')
  const body = document.querySelector('.vp-doc p')
  const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family)
  return {
    codeFamily: code ? getComputedStyle(code).fontFamily : null,
    bodyFamily: body ? getComputedStyle(body).fontFamily : null,
    jbLoaded: document.fonts.check('16px "JetBrains Mono"'),
    loadedFonts: [...new Set(loaded)],
  }
})
console.log(JSON.stringify({ ...res, failed }, null, 2))
await browser.close()
