const pgp = require('pg-promise')()
const { LargeObjectManager } = require('pg-large-object')

export const db = pgp({
  host: 'localhost',
  port: 5444,
  database: 'media',
  user: 'postgres',
  password: 'postgres'
})

export const createLargeObjectManager = (tx: any) => {
  return new LargeObjectManager({ pgPromise: tx })
}
