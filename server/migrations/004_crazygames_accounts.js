/**
 * crazygames_id link for backend accounts associated with CrazyGames Users.
 * Also softens users.email/password for CG-only accounts when the users table exists.
 */
exports.up = async function (knex) {
  const hasUsers = await knex.schema.hasTable('users')
  if (hasUsers) {
    const hasCol = await knex.schema.hasColumn('users', 'crazygames_id')
    if (!hasCol) {
      await knex.schema.alterTable('users', (table) => {
        table.string('crazygames_id', 128).unique().nullable()
        table.string('profile_picture_url', 512).nullable()
        table.string('auth_provider', 32).nullable()
      })
    }
    // Allow CG-only rows without password/email uniqueness conflicts via synthetic email
  }

  const hasCg = await knex.schema.hasTable('crazygames_accounts')
  if (!hasCg) {
    await knex.schema.createTable('crazygames_accounts', (table) => {
      table.text('crazygames_id').primary()
      table.text('user_id').notNullable().unique()
      table.string('username', 64)
      table.string('profile_picture_url', 512)
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      table.timestamp('created_at').defaultTo(knex.fn.now())
    })
  }
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('crazygames_accounts')
  const hasUsers = await knex.schema.hasTable('users')
  if (hasUsers && (await knex.schema.hasColumn('users', 'crazygames_id'))) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('crazygames_id')
      table.dropColumn('profile_picture_url')
      table.dropColumn('auth_provider')
    })
  }
}
