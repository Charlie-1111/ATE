/**
 * Eager raw imports of every avatar part SVG, keyed by "category/id".
 * Markup is the inner shapes only (no outer <svg>), so they share one viewBox when composed.
 */

const files = import.meta.glob('../assets/avatar_parts/**/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function extractInner(svgText) {
  if (!svgText || typeof svgText !== 'string') return ''
  let inner = svgText
    .replace(/<\?xml[^>]*>/g, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<svg[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
  // Drop transparent artboard spacer — parent SVG already defines the canvas
  inner = inner.replace(/<rect[^>]*data-artboard="1"[^>]*\/>/g, '')
  return inner.trim()
}

const markupByKey = {}
for (const [path, raw] of Object.entries(files)) {
  const m = path.match(/avatar_parts\/([^/]+)\/([^/]+)\.svg$/)
  if (!m) continue
  const [, category, id] = m
  markupByKey[`${category}/${id}`] = extractInner(raw)
}

export function getPartMarkup(category, id) {
  if (!id) return null
  return markupByKey[`${category}/${id}`] || null
}

export function hasPartMarkup(category, id) {
  return Boolean(getPartMarkup(category, id))
}
