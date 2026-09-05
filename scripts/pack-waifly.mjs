#!/usr/bin/env node
/**
 * Pack a slim Node bundle for Waifly free (300 MB RAM).
 * Run after: npm run build
 */
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

const root = new URL('..', import.meta.url).pathname
const out = join(root, 'dist-waifly')
const serverPkg = JSON.parse(readFileSync(join(root, 'server/package.json'), 'utf8'))

if (!existsSync(join(root, 'client/dist'))) {
  console.error('Run npm run build first')
  process.exit(1)
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

// server sources (no node_modules)
cpSync(join(root, 'server'), join(out), {
  recursive: true,
  filter: (src) => !src.includes('node_modules') && !src.endsWith('.env'),
})

// client build → ../client/dist relative to server index
mkdirSync(join(out, '../client'), { recursive: true })
// pack layout: dist-waifly is the server root; put client dist beside it
rmSync(join(root, 'dist-waifly-client'), { recursive: true, force: true })
const layout = join(root, 'dist-waifly-upload')
rmSync(layout, { recursive: true, force: true })
mkdirSync(join(layout, 'server'), { recursive: true })
mkdirSync(join(layout, 'client'), { recursive: true })

cpSync(join(root, 'server'), join(layout, 'server'), {
  recursive: true,
  filter: (src) => !src.includes('node_modules') && !src.endsWith('.env'),
})
cpSync(join(root, 'client/dist'), join(layout, 'client/dist'), { recursive: true })

writeFileSync(
  join(layout, 'package.json'),
  JSON.stringify(
    {
      name: 'ate-waifly',
      private: true,
      type: 'commonjs',
      scripts: { start: 'node server/index.js' },
      dependencies: serverPkg.dependencies,
    },
    null,
    2,
  ),
)

writeFileSync(
  join(layout, 'server/.env.example'),
  'NODE_ENV=production\nJWT_SECRET=change-me\n',
)

rmSync(out, { recursive: true, force: true })

console.log('Created dist-waifly-upload/')
console.log('Upload the CONTENTS of dist-waifly-upload/ to Waifly server root.')
console.log('Startup: npm start   (or: node server/index.js)')
console.log('Ensure PORT from the panel is passed through (already supported).')
