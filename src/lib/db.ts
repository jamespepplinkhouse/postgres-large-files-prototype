const pgp = require('pg-promise')()

export const db = pgp({
  host: 'localhost',
  port: 5444,
  database: 'media',
  user: 'postgres',
  password: 'postgres'
})
