/** Canonical public play URL — Cloudflare quick tunnel while Mac share is running */
export const PLAY_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PLAY_URL) ||
  'https://learners-visiting-regardless-roulette.trycloudflare.com'

export function absolutePlayUrl(path = '/') {
  try {
    return new URL(path, PLAY_URL).href
  } catch {
    return PLAY_URL
  }
}
