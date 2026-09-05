/** Pre-built avatar looks composed from landmark-baked SVG parts */

function preset(id, label, skin, hair, eyes, mouth, accessories = []) {
  return {
    id,
    label,
    config: {
      skin,
      hair,
      eyes,
      mouth,
      accessories: [...accessories],
    },
  }
}

export const DEFAULT_AVATAR_ID = 'rook'

export const AVATAR_PRESETS = [
  preset('rook', 'Rook', 'medium', 'buzz_cut', 'blue_circles', 'smirk', ['gold_chain']),
  preset('ember', 'Ember', 'tan', 'afro', 'brown_angry', 'angry_frown', ['sunglasses_cool']),
  preset('frost', 'Frost', 'light', 'slicked_back', 'green_ovals', 'poker_face', ['silver_chain']),
  preset('viper', 'Viper', 'dark', 'undercut', 'cat_eyes', 'smirk', ['scar']),
  preset('chaos', 'Chaos', 'very_dark', 'mohawk', 'star_eyes', 'open_laugh', ['nose_ring']),
  preset('crown', 'Crown', 'medium', 'curly', 'black_dots_cute', 'smile', ['crown']),
  preset('shade', 'Shade', 'dark', 'bald', 'sunglasses_dark', 'concerned', ['hoodie']),
  preset('brawler', 'Brawler', 'tan', 'messy', 'wide_shocked', 'tongue_out', ['bandana']),
]

export const PRESETS_BY_ID = Object.fromEntries(AVATAR_PRESETS.map((p) => [p.id, p]))

export function getPreset(id) {
  return PRESETS_BY_ID[id] || PRESETS_BY_ID[DEFAULT_AVATAR_ID]
}

export function getPresetConfig(id) {
  const p = getPreset(id)
  return {
    ...p.config,
    accessories: [...(p.config.accessories || [])],
  }
}
