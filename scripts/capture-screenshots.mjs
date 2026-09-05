/**
 * Captures the PWA install-prompt screenshots declared in vite.config.ts.
 *
 * Serves the production build on a fixed port and shoots it with headless
 * Chrome. The output dimensions must keep matching the `sizes` fields in the
 * manifest's `screenshots` array, or Chrome silently drops the entry.
 *
 * Usage: npm run screenshots   (run `npm run build` first)
 */
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { access, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public/screenshots')
const PORT = 4173 // vite preview's default; fixed so a stale server is easy to spot
const ORIGIN = `http://localhost:${PORT}/`

/** form_factor drives which install UI Chrome shows, so we need one of each. */
const SHOTS = [
  { name: 'wide.png', width: 1280, height: 800 },
  { name: 'narrow.png', width: 540, height: 720 }
]

const CHROME_CANDIDATES = ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']

function run(command, args, options = {}) {
  return spawn(command, args, { stdio: 'inherit', ...options })
}

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    const probe = spawn(candidate, ['--version'], { stdio: 'ignore' })
    const [code] = await once(probe, 'close').catch(() => [1])
    if (code === 0) return candidate
  }
  throw new Error(`No Chrome found. Tried: ${CHROME_CANDIDATES.join(', ')}`)
}

async function waitForServer(timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(ORIGIN)
      if (response.ok) return
    } catch {
      // Server still booting.
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`Preview server never answered on ${ORIGIN}`)
}

async function capture(chrome, { name, width, height }) {
  const target = join(OUT_DIR, name)
  const shot = run(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    // Headless defaults to a dark prefers-color-scheme; the manifest's splash
    // colours are the light palette, so shoot the light one to match. (1 = light)
    '--blink-settings=preferredColorScheme=1',
    `--window-size=${width},${height}`,
    // The web font and Vue mount both need to land before the shutter.
    '--virtual-time-budget=4000',
    `--screenshot=${target}`,
    ORIGIN
  ])
  const [code] = await once(shot, 'close')
  if (code !== 0) throw new Error(`Chrome exited ${code} while capturing ${name}`)
  console.log(`captured ${name} (${width}x${height})`)
}

async function main() {
  await access(join(ROOT, 'dist/index.html')).catch(() => {
    throw new Error('dist/ is missing or stale — run `npm run build` first.')
  })
  await mkdir(OUT_DIR, { recursive: true })

  const chrome = await findChrome()
  const server = run('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore'
  })

  try {
    await waitForServer()
    for (const shot of SHOTS) await capture(chrome, shot)
  } finally {
    server.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
