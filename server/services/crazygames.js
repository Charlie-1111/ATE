/**
 * Verify CrazyGames user JWTs with their rotating public key.
 * Docs: https://docs.crazygames.com/sdk/user/
 */
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const PUBLIC_KEY_URL = 'https://sdk.crazygames.com/publicKey.json'
const CACHE_MS = 60 * 60 * 1000

let cachedPem = null
let cachedAt = 0

async function fetchPublicKeyPem() {
  const now = Date.now()
  if (cachedPem && now - cachedAt < CACHE_MS) return cachedPem

  const res = await fetch(PUBLIC_KEY_URL)
  if (!res.ok) throw new Error(`CrazyGames public key HTTP ${res.status}`)
  const data = await res.json()
  const pem = data.publicKey || data
  if (typeof pem !== 'string' || !pem.includes('BEGIN')) {
    throw new Error('CrazyGames public key missing')
  }
  cachedPem = pem
  cachedAt = now
  return cachedPem
}

/**
 * @returns {{ userId: string, username?: string, profilePictureUrl?: string }}
 */
async function verifyCrazyGamesToken(token) {
  if (!token || typeof token !== 'string') {
    throw Object.assign(new Error('Missing CrazyGames token'), { status: 400 })
  }

  let pem = await fetchPublicKeyPem()
  let keyObject
  try {
    keyObject = crypto.createPublicKey(pem)
  } catch (err) {
    throw Object.assign(new Error(`Invalid CrazyGames public key: ${err.message}`), { status: 500 })
  }

  try {
    return jwt.verify(token, keyObject, { algorithms: ['RS256'] })
  } catch (firstErr) {
    // Key may have rotated — refresh once
    cachedPem = null
    cachedAt = 0
    pem = await fetchPublicKeyPem()
    keyObject = crypto.createPublicKey(pem)
    try {
      return jwt.verify(token, keyObject, { algorithms: ['RS256'] })
    } catch (err) {
      throw Object.assign(new Error(err.message || 'Invalid CrazyGames token'), { status: 401 })
    }
  }
}

function ateUserIdFromCg(cgUserId) {
  return `cg_${String(cgUserId)}`
}

module.exports = {
  verifyCrazyGamesToken,
  ateUserIdFromCg,
  fetchPublicKeyPem,
}
