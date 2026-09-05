#!/usr/bin/env node
/**
 * Bake face landmarks into avatar part SVGs.
 *
 * Skin + hairstyles + headwear/neck accessories stay authored (anchor / silhouette).
 * Eyes, mouths, and face-worn accessories get translate(0, dy) to hit:
 *   eyes center     → 78
 *   mouth center    → 110
 *   mid-face extras → 78
 *   lower-face      → 110
 *
 * Re-seeds from ~/Downloads/avatar_parts when present (idempotent).
 * Strips filter/gradient defs (duplicate ids break when inlined).
 */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  cpSync,
  rmSync,
  mkdirSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { homedir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PARTS = join(__dirname, '../src/assets/avatar_parts')
const DOWNLOADS = join(homedir(), 'Downloads/avatar_parts')

const CATEGORY_TARGET = {
  eyes: 78,
  mouths: 110,
}

/** Only face-worn accessories — hats/neck stay authored */
const ACCESSORY_TARGET = {
  sunglasses_cool: 78,
  nose_ring: 90,
  scar: 82,
  face_paint_stripe: 90,
  ear_piercings: 95,
  cigar: 125,
  mustache: 110,
  goatee: 110,
  beard: 110,
}

function listSvgs(dir) {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith('.svg'))
      .map((f) => join(dir, f))
  } catch {
    return []
  }
}

function mean(nums) {
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function estimateFeatureY(svg) {
  const cys = [...svg.matchAll(/\bcy="([0-9.]+)"/g)].map((m) => +m[1])
  if (cys.length) return mean(cys)

  const moveYs = [...svg.matchAll(/[Mm]\s*([0-9.]+)\s+([0-9.]+)/g)].map((m) => +m[2])
  if (!moveYs.length) return null
  moveYs.sort((a, b) => a - b)
  return moveYs[Math.floor(moveYs.length / 2)]
}

function stripDefsAndFilters(svg) {
  let out = svg.replace(/<defs>[\s\S]*?<\/defs>\s*/g, '')
  out = out.replace(/\sfilter="url\([^"]+\)"/g, '')
  return out
}

function ensureRoot(svg) {
  return svg.replace(/<svg[^>]*>/, (tag) => {
    let t = tag
    if (!/viewBox=/.test(t)) t = t.replace(/<svg/, '<svg viewBox="0 0 200 200"')
    else t = t.replace(/viewBox="[^"]*"/, 'viewBox="0 0 200 200"')
    if (!/\swidth=/.test(t)) t = t.replace(/<svg/, '<svg width="200"')
    else t = t.replace(/\swidth="[^"]*"/, ' width="200"')
    if (!/\sheight=/.test(t)) t = t.replace(/<svg/, '<svg height="200"')
    else t = t.replace(/\sheight="[^"]*"/, ' height="200"')
    return t
  })
}

function applyDy(svg, dy) {
  if (!dy || Math.abs(dy) < 0.5) return svg
  const rounded = Math.round(dy * 100) / 100
  if (/<g\s[^>]*\bid=/.test(svg)) {
    return svg.replace(/<g(\s[^>]*\bid="[^"]*"[^>]*)>/, (_full, attrs) => {
      if (/transform=/.test(attrs)) {
        return `<g${attrs.replace(/transform="([^"]*)"/, `transform="$1 translate(0 ${rounded})"`)}>`
      }
      return `<g${attrs} transform="translate(0 ${rounded})">`
    })
  }
  return svg.replace(
    /(<svg[^>]*>)([\s\S]*)(<\/svg>)/,
    `$1\n  <g transform="translate(0 ${rounded})">$2  </g>\n$3`,
  )
}

function cleanOnly(path, reason) {
  let svg = readFileSync(path, 'utf8')
  svg = stripDefsAndFilters(ensureRoot(svg))
  writeFileSync(path, svg)
  return { path, skipped: true, reason }
}

function processFile(path, targetY) {
  let svg = readFileSync(path, 'utf8')
  svg = stripDefsAndFilters(svg)
  svg = ensureRoot(svg)

  if (targetY == null) {
    writeFileSync(path, svg)
    return { path, skipped: true }
  }

  const current = estimateFeatureY(svg)
  if (current == null) {
    writeFileSync(path, svg)
    return { path, skipped: true, reason: 'no-y' }
  }

  const dy = targetY - current
  svg = applyDy(svg, dy)
  writeFileSync(path, svg)
  return { path, current, targetY, dy: Math.round(dy * 100) / 100 }
}

function reseedFromDownloads() {
  if (!existsSync(DOWNLOADS)) {
    console.warn('No Downloads/avatar_parts — baking current src/assets in place')
    return
  }
  rmSync(PARTS, { recursive: true, force: true })
  mkdirSync(dirname(PARTS), { recursive: true })
  cpSync(DOWNLOADS, PARTS, { recursive: true })
  console.log('Re-seeded src/assets/avatar_parts from Downloads')
}

function main() {
  reseedFromDownloads()
  const report = []

  for (const [cat, target] of Object.entries(CATEGORY_TARGET)) {
    for (const file of listSvgs(join(PARTS, cat))) {
      report.push(processFile(file, target))
    }
  }

  for (const file of listSvgs(join(PARTS, 'skin_tones'))) {
    report.push(cleanOnly(file, 'skin-anchor'))
  }

  for (const file of listSvgs(join(PARTS, 'hairstyles'))) {
    report.push(cleanOnly(file, 'hair-authored'))
  }

  for (const file of listSvgs(join(PARTS, 'accessories'))) {
    const id = file.split('/').pop().replace(/\.svg$/, '')
    if (Object.prototype.hasOwnProperty.call(ACCESSORY_TARGET, id)) {
      report.push(processFile(file, ACCESSORY_TARGET[id]))
    } else {
      report.push(cleanOnly(file, 'accessory-authored'))
    }
  }

  for (const r of report) {
    const name = r.path?.split('/avatar_parts/')[1] || r.path
    if (r.skipped) console.log('skip', name, r.reason || '')
    else console.log('bake', name, `y ${r.current?.toFixed?.(1)} → ${r.targetY} (dy=${r.dy})`)
  }

  const sync = spawnSync(process.execPath, [join(__dirname, 'sync-avatar-parts.mjs')], {
    stdio: 'inherit',
  })
  if (sync.status !== 0) process.exit(sync.status ?? 1)
}

main()
