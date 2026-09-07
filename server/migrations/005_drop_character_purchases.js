/** Drop Stripe purchase table — payments removed; unlocks are ranked-wins only. */
exports.up = async function (knex) {
  await knex.schema.dropTableIfExists('character_purchases')
}

exports.down = async function (knex) {
  const has = await knex.schema.hasTable('character_purchases')
  if (!has) {
    await knex.schema.createTable('character_purchases', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.text('user_id').notNullable()
      table.string('character_id', 64).notNullable()
      table.string('stripe_session_id', 255)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.unique(['user_id', 'character_id'])
    })
  }
}
