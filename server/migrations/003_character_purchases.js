/**
 * character_purchases — premium unlocks via Stripe
 */
exports.up = async function (knex) {
  const has = await knex.schema.hasTable('character_purchases')
  if (has) return
  await knex.schema.createTable('character_purchases', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id').notNullable().index()
    table.string('character_id', 64).notNullable()
    table.string('stripe_session_id', 255)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.unique(['user_id', 'character_id'])
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('character_purchases')
}
