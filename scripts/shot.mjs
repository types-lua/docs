// Screenshot helper for visual QA (not part of the site build).
// Usage: CHROME_BIN=<path> node scripts/shot.mjs <url> <out.png> [width] [dark] [dpr] [full]
import { chromium } from 'playwright-core'

const exe = process.env.CHROME_BIN
const [url, out, width = '1440', dark = '', dpr = '1', full = '', selector = ''] = process.argv.slice(2)
if (!url || !out || !exe) {
  console.error('usage: CHROME_BIN=<path> node scripts/shot.mjs <url> <out.png> [width] [dark] [dpr] [full]')
  process.exit(2)
}

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] })
const page = await browser.newPage({
  viewport: { width: Number(width), height: 1000 },
  colorScheme: dark === 'dark' ? 'dark' : 'light',
  deviceScaleFactor: Number(dpr),
})
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText || ''}`))
page.on('response', (r) => { if (r.status() >= 400) errors.push(`http${r.status()}: ${r.url()}`) })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(350)
if (selector) {
  await page.locator(selector).first().screenshot({ path: out })
} else {
  await page.screenshot({ path: out, fullPage: full === 'full' })
}
await browser.close()
if (errors.length) {
  console.log('CONSOLE_ERRORS:')
  for (const e of errors) console.log('  ' + e)
} else {
  console.log('console clean')
}
