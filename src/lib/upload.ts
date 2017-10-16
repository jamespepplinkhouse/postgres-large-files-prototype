import { db, createLargeObjectManager } from './db'
import stream = require('stream')

export const saveFile = async (incomingStream: stream) => {
  const result = await db.tx(async (tx: any) => {
    const man = createLargeObjectManager(tx)
    return man
      .createAndWritableStreamAsync()
      .then(([oid, databaseWritableStream]: any) => {
        incomingStream.pipe(databaseWritableStream)

        return new Promise((resolve, reject) => {
          databaseWritableStream.on('finish', () => resolve(oid))
          databaseWritableStream.on('error', reject)
        })
      })
  })
  return result
}

export default saveFile
