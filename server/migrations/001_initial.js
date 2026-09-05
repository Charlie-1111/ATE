const { v4: uuidv4 } = require('uuid')

exports.up = async function(knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('username', 30).unique().notNullable()
    table.string('email', 255).unique().notNullable()
    table.string('password_hash', 255).notNullable()
    table.string('country', 2)
    table.jsonb('avatar_config').defaultTo('{}')
    table.decimal('avg_score', 3, 1).defaultTo(0)
    table.integer('total_battles').defaultTo(0)
    table.integer('wins').defaultTo(0)
    table.integer('losses').defaultTo(0)
    table.specificType('cosmetics_owned', 'uuid[]').defaultTo('{}')
    table.string('title', 50)
    table.timestamps(true, true)
  })

  await knex.schema.createTable('battles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('player1_id').references('id').inTable('users')
    table.uuid('player2_id').references('id').inTable('users')
    table.enum('status', ['queued', 'active', 'completed', 'abandoned']).defaultTo('queued')
    table.uuid('winner_id').references('id').inTable('users')
    table.enum('format', ['best_of_3', 'best_of_5']).defaultTo('best_of_3')
    table.integer('player1_total_score').defaultTo(0)
    table.integer('player2_total_score').defaultTo(0)
    table.integer('current_round').defaultTo(1)
    table.timestamps(true, true)
  })

  await knex.schema.createTable('roasts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('battle_id').references('id').inTable('battles')
    table.uuid('player_id').references('id').inTable('users')
    table.integer('round')
    table.text('text')
    table.integer('ai_score')
    table.string('ai_feedback', 50)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('cosmetics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('name', 50).notNullable()
    table.enum('type', ['skin', 'hair', 'eyes', 'mouth', 'accessory'])
    table.decimal('price', 5, 2).defaultTo(0)
    table.enum('rarity', ['common', 'rare', 'legendary']).defaultTo('common')
    table.enum('unlock_method', ['free', 'paid', 'battle_pass']).defaultTo('free')
    table.string('svg_path', 255)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('user_cosmetics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').references('id').inTable('users')
    table.uuid('cosmetic_id').references('id').inTable('cosmetics')
    table.timestamp('owned_at').defaultTo(knex.fn.now())
  })

  await knex.schema.createTable('leaderboard_cache', (table) => {
    table.uuid('user_id').primary().references('id').inTable('users')
    table.integer('world_rank')
    table.integer('country_rank')
    table.decimal('avg_score', 3, 1)
    table.integer('total_battles')
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('leaderboard_cache')
  await knex.schema.dropTableIfExists('user_cosmetics')
  await knex.schema.dropTableIfExists('cosmetics')
  await knex.schema.dropTableIfExists('roasts')
  await knex.schema.dropTableIfExists('battles')
  await knex.schema.dropTableIfExists('users')
}
