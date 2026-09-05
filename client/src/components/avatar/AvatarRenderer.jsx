import { useMemo } from 'react'
import {
  DEFAULT_AVATAR_CONFIG,
  sortAccessories,
  accessoryBand,
} from '../../lib/avatarCatalog.js'
import { getPartMarkup } from '../../lib/avatarPartMarkup.js'

function layersFor(cfg) {
  const out = []
  const add = (key, category, id) => {
    if (!id) return
    const markup = getPartMarkup(category, id)
    if (markup) out.push({ key, markup })
  }

  const accessories = sortAccessories(cfg.accessories || [])
  const headwear = accessories.filter((id) => accessoryBand(id) === 1)
  const rest = accessories.filter((id) => accessoryBand(id) !== 1)

  // skin → hair → headwear → eyes → mouth → face / lower / neck
  add('skin', 'skin_tones', cfg.skin)
  add('hair', 'hairstyles', cfg.hair)
  headwear.forEach((id, i) => add(`acc-hw-${i}-${id}`, 'accessories', id))
  add('eyes', 'eyes', cfg.eyes)
  add('mouth', 'mouths', cfg.mouth)
  rest.forEach((id, i) => add(`acc-${i}-${id}`, 'accessories', id))
  return out
}

/**
 * One SVG, one viewBox — landmark-baked parts share 200×200 coordinates.
 * No runtime Y nudges; no custom crop.
 */
export default function AvatarRenderer({ config, size = 128, className = '' }) {
  const cfg = config || DEFAULT_AVATAR_CONFIG
  const px = typeof size === 'number' ? size : 128
  const roundClass = px >= 160 ? 'rounded-2xl' : 'rounded-full'
  const layerKey = [
    cfg.skin,
    cfg.hair,
    cfg.eyes,
    cfg.mouth,
    ...(cfg.accessories || []),
  ].join('|')
  const layers = useMemo(() => layersFor(cfg), [layerKey])

  return (
    <div
      className={`relative overflow-hidden box-border ${roundClass} bg-[#2a2a3e] border-2 border-gray-600 ${className}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label="Player avatar"
    >
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        className="block pointer-events-none select-none"
        aria-hidden="true"
      >
        {layers.map((layer) => (
          <g
            key={layer.key}
            dangerouslySetInnerHTML={{ __html: layer.markup }}
          />
        ))}
      </svg>
    </div>
  )
}

export function AvatarPartThumb({ slot, partId, skinId = 'medium', size = 72, className = '' }) {
  if (slot === 'skin') {
    return (
      <AvatarRenderer
        config={{ skin: partId, hair: null, eyes: null, mouth: null, accessories: [] }}
        size={size}
        className={className}
      />
    )
  }

  return (
    <AvatarRenderer
      config={{
        skin: skinId,
        hair: slot === 'hair' ? partId : null,
        eyes: slot === 'eyes' ? partId : null,
        mouth: slot === 'mouth' ? partId : null,
        accessories: slot === 'accessories' ? [partId] : [],
      }}
      size={size}
      className={className}
    />
  )
}
