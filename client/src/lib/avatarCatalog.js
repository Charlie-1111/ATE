/** Catalog of modular avatar SVG parts served from /avatar_parts */

function labelize(id) {
  return id
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function makeParts(category, ids) {
  return ids.map((id) => ({
    id,
    label: labelize(id),
    src: `/avatar_parts/${category}/${id}.svg`,
  }))
}

export const AVATAR_LAYERS = [
  { key: 'skin', category: 'skin_tones', label: 'Skin' },
  { key: 'hair', category: 'hairstyles', label: 'Hair' },
  { key: 'eyes', category: 'eyes', label: 'Eyes' },
  { key: 'mouth', category: 'mouths', label: 'Mouth' },
  { key: 'accessories', category: 'accessories', label: 'Accessories', multi: true },
]

export const SKIN_PARTS = makeParts('skin_tones', [
  'light', 'medium', 'tan', 'dark', 'very_dark',
])

export const HAIR_PARTS = makeParts('hairstyles', [
  'bald', 'buzz_cut', 'afro', 'curly', 'messy', 'mohawk', 'spiky',
  'slicked_back', 'undercut', 'half_shave', 'cornrows', 'mullet',
  'long_straight', 'long_wavy', 'space_buns',
])

export const EYE_PARTS = makeParts('eyes', [
  'black_dots_cute', 'blue_circles', 'green_ovals', 'brown_angry',
  'cat_eyes', 'closed_winking', 'sleepy_half_closed', 'wide_shocked',
  'star_eyes', 'sunglasses_dark',
])

export const MOUTH_PARTS = makeParts('mouths', [
  'smile', 'smirk', 'poker_face', 'open_laugh', 'surprised_o',
  'angry_frown', 'concerned', 'tongue_out',
])

export const ACCESSORY_PARTS = makeParts('accessories', [
  'gold_chain', 'silver_chain', 'crown', 'headphones', 'sunglasses_cool',
  'bandana', 'baseball_cap', 'beanie_winter', 'top_hat', 'pirate_hat',
  'viking_helmet', 'hoodie', 'beard', 'goatee', 'mustache',
  'nose_ring', 'ear_piercings', 'scar', 'face_paint_stripe',
  'collar_neck_tattoo', 'cigar',
])

export const PARTS_BY_SLOT = {
  skin: SKIN_PARTS,
  hair: HAIR_PARTS,
  eyes: EYE_PARTS,
  mouth: MOUTH_PARTS,
  accessories: ACCESSORY_PARTS,
}

export const MAX_ACCESSORIES = 3

/**
 * Accessory draw bands (after skin → hair → eyes → mouth base stack).
 * Lower number = earlier (behind). Neck last so chains sit on top of collar.
 */
export const ACCESSORY_BAND = {
  // Headwear — after hair, before eyes so bangs/glasses can sit over brim when needed
  crown: 1,
  headphones: 1,
  bandana: 1,
  baseball_cap: 1,
  beanie_winter: 1,
  top_hat: 1,
  pirate_hat: 1,
  viking_helmet: 1,
  // Face — after eyes
  sunglasses_cool: 2,
  scar: 2,
  face_paint_stripe: 2,
  nose_ring: 2,
  ear_piercings: 2,
  cigar: 2,
  // Lower face — after mouth
  mustache: 3,
  goatee: 3,
  beard: 3,
  // Neck — last
  gold_chain: 4,
  silver_chain: 4,
  hoodie: 4,
  collar_neck_tattoo: 4,
}

export function accessoryBand(id) {
  return ACCESSORY_BAND[id] ?? 2
}

export function sortAccessories(ids = []) {
  return [...ids].sort((a, b) => {
    const d = accessoryBand(a) - accessoryBand(b)
    return d !== 0 ? d : a.localeCompare(b)
  })
}

export const DEFAULT_AVATAR_CONFIG = {
  skin: 'medium',
  hair: 'buzz_cut',
  eyes: 'blue_circles',
  mouth: 'smirk',
  accessories: ['gold_chain'],
}

export function partSrc(category, id) {
  if (!id) return null
  return `/avatar_parts/${category}/${id}.svg`
}

export function getPart(slot, id) {
  return PARTS_BY_SLOT[slot]?.find((p) => p.id === id) || null
}
