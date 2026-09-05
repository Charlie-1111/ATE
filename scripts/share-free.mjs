#!/usr/bin/env node
/**
 * Free public URL via Cloudflare quick tunnel — no credit card.
 * Requires: cloudflared installed (brew install cloudflare/cloudflare/cloudflared)
 * Keeps running until you Ctrl+C. Mac must stay awake/online.
 */
import { spawn } from 'child_process'
import { createServer } from 'net'

const PORT = Number(process.env.PORT) || 8080

function waitPort(port, ms = 20000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const s = createServer()
      s.once('error', () => {
        if (Date.now() - start > ms) reject(new Error('timeout waiting for free port check'))
        else setTimeout(tryOnce, 200)
      })
      s.listen(port, '127.0.0.1', () => {
        s.close(() => resolve())
      })
    }
    // If something already listens, that's fine — we assume our server
    const probe = spawn('curl', ['-sf', `http://127.0.0.1:${port}/api/health`], { stdio: 'ignore' })
    probe.on('close', (code) => {
      if (code === 0) resolve()
      else tryOnce()
    })
  })
}

async function main() {
  console.log('[share] starting ATE on', PORT)
  const server = spawn('node', ['server/index.js'], {
    env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT), JWT_SECRET: process.env.JWT_SECRET || 'ate-share-dev' },
    stdio: ['ignore', 'inherit', 'inherit'],
  })

  // wait until health responds
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250))
    const ok = await new Promise((resolve) => {
      const c = spawn('curl', ['-sf', `http://127.0.0.1:${PORT}/api/health`], { stdio: 'ignore' })
      c.on('close', (code) => resolve(code === 0))
    })
    if (ok) break
    if (i === 39) {
      console.error('[share] server failed to start')
      process.exit(1)
    }
  }

  console.log('[share] opening Cloudflare free tunnel (no card)…')
  const tunnel = spawn('cloudflared', ['tunnel', '--url', `http://127.0.0.1:${PORT}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const onData = (buf) => {
    const text = buf.toString()
    process.stderr.write(text)
    const m = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
    if (m) {
      console.log('\n========================================')
      console.log('  FREE play URL (while this is running):')
      console.log(' ', m[0])
      console.log('========================================\n')
    }
  }
  tunnel.stdout.on('data', onData)
  tunnel.stderr.on('data', onData)

  const shutdown = () => {
    tunnel.kill()
    server.kill()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  tunnel.on('exit', (code) => {
    console.error('[share] tunnel exited', code)
    server.kill()
    process.exit(code || 1)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
