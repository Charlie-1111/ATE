/**
 * Lean leaderboard tables for guest profiles (Supabase / any Postgres).
 * Safe to run even if 001_initial was never applied.
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto')

  const hasProfiles = await knex.schema.hasTable('profiles')
  if (!hasProfiles) {
    await knex.schema.createTable('profiles', (table) => {
      table.text('id').primary()
      table.string('display_name', 40).notNullable().defaultTo('Player')
      table.string('avatar_id', 40)
      table.integer('wins').notNullable().defaultTo(0)
      table.integer('losses').notNullable().defaultTo(0)
      table.integer('total_battles').notNullable().defaultTo(0)
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  }

  const hasMatches = await knex.schema.hasTable('match_results')
  if (!hasMatches) {
    await knex.schema.createTable('match_results', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.text('battle_id').notNullable()
      table.string('mode', 20).notNullable().defaultTo('freestyle')
      table.string('format', 20).notNullable().defaultTo('best_of_3')
      table.string('topic', 80)
      table.text('winner_id').notNullable()
      table.text('loser_id').notNullable()
      table.text('player1_id').notNullable()
      table.text('player2_id').notNullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.index(['winner_id'])
      table.index(['created_at'])
    })
  }
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('match_results')
  await knex.schema.dropTableIfExists('profiles')
}
