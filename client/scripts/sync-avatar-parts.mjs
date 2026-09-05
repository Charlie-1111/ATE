#!/usr/bin/env node
/**
 * Copy canonical avatar parts (src/assets) → public/avatar_parts
 * so catalog URLs never drift from the renderer imports.
 */
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'src/assets/avatar_parts')
const dest = join(root, 'public/avatar_parts')

if (!existsSync(src)) {
  console.error('Missing canonical assets at', src)
  process.exit(1)
}

rmSync(dest, { recursive: true, force: true })
mkdirSync(dirname(dest), { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('Synced avatar_parts → public/avatar_parts')
