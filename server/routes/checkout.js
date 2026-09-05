/**
 * Stripe Checkout for premium characters (card + Alipay).
 * Without STRIPE_SECRET_KEY, Buy falls back to a mock unlock for local dev.
 */
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const authMiddleware = require('../middleware/auth.js')

const router = express.Router()

const PREMIUM = {
  king_octane: { name: 'King Octane', amountCents: 499 },
  nova_scott: { name: 'Nova Scott', amountCents: 499 },
}

const memoryPurchases = new Map() // userId -> Set(characterId)

function getKnex() {
  if (!process.env.DATABASE_URL) return null
  try {
    const Knex = require('knex')
    const config = require('../knexfile.js')
    const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
    return Knex(config[env])
  } catch {
    return null
  }
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null
  const Stripe = require('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

async function addPurchase(userId, characterId, sessionId = null) {
  const db = getKnex()
  if (db) {
    try {
      const exists = await db('character_purchases')
        .where({ user_id: userId, character_id: characterId })
        .first()
      if (!exists) {
        await db('character_purchases').insert({
          id: uuidv4(),
          user_id: userId,
          character_id: characterId,
          stripe_session_id: sessionId,
        })
      }
      return
    } catch (err) {
      console.warn('[Checkout] DB purchase write failed, using memory:', err.message)
    }
  }
  if (!memoryPurchases.has(userId)) memoryPurchases.set(userId, new Set())
  memoryPurchases.get(userId).add(characterId)
}

async function listPurchases(userId) {
  const db = getKnex()
  if (db) {
    try {
      const rows = await db('character_purchases').where({ user_id: userId }).select('character_id')
      return rows.map((r) => r.character_id)
    } catch {
      // fall through
    }
  }
  return [...(memoryPurchases.get(userId) || [])]
}

router.get('/purchases', authMiddleware, async (req, res) => {
  try {
    const ids = await listPurchases(req.user.id)
    res.json({ purchasedIds: ids })
  } catch (err) {
    res.status(500).json({ error: 'Failed to load purchases' })
  }
})

router.post('/session', authMiddleware, async (req, res) => {
  try {
    const characterId = String(req.body.characterId || '')
    const product = PREMIUM[characterId]
    if (!product) return res.status(400).json({ error: 'Invalid character' })

    const owned = await listPurchases(req.user.id)
    if (owned.includes(characterId)) {
      return res.json({ alreadyOwned: true, purchasedIds: owned })
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const stripe = getStripe()

    if (!stripe) {
      // Local mock: unlock immediately
      await addPurchase(req.user.id, characterId, 'mock')
      const purchasedIds = await listPurchases(req.user.id)
      return res.json({
        mock: true,
        url: `${clientUrl}/shop?checkout=success&character=${characterId}`,
        purchasedIds,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'alipay'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: product.amountCents,
            product_data: {
              name: `ATE Character — ${product.name}`,
              description: `Unlock ${product.name} for ATE Roast Battle`,
            },
          },
        },
      ],
      success_url: `${clientUrl}/shop?checkout=success&character=${characterId}`,
      cancel_url: `${clientUrl}/shop?checkout=cancel`,
      client_reference_id: req.user.id,
      metadata: {
        userId: req.user.id,
        characterId,
      },
    })

    res.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('[Checkout] session', err.message)
    res.status(500).json({ error: err.message || 'Checkout failed' })
  }
})

/** Stripe webhook — mounted with raw body in index.js */
async function handleWebhook(req, res) {
  const stripe = getStripe()
  if (!stripe) return res.status(200).json({ received: true, mock: true })

  const sig = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  let event
  try {
    const raw = req.rawBody || req.body
    event = secret
      ? stripe.webhooks.constructEvent(raw, sig, secret)
      : JSON.parse(typeof raw === 'string' ? raw : raw.toString())
  } catch (err) {
    console.error('[Checkout] webhook verify', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId || session.client_reference_id
    const characterId = session.metadata?.characterId
    if (userId && characterId && PREMIUM[characterId]) {
      await addPurchase(userId, characterId, session.id)
      console.log(`[Checkout] unlocked ${characterId} for ${userId}`)
    }
  }

  res.json({ received: true })
}

router.post('/webhook', handleWebhook)

module.exports = router
module.exports.handleWebhook = handleWebhook
module.exports.addPurchase = addPurchase
module.exports.listPurchases = listPurchases
