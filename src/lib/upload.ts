import { db, createLargeObjectManager } from './db'
import stream = require('stream')

export default async (incomingStream: stream) => {
  return db.tx(async (tx: any) => {
    const man = createLargeObjectManager(tx)
    return man
      .createAndWritableStreamAsync()
      .then(([oid, databaseWritableStream]: any) => {
        incomingStream.pipe(databaseWritableStream)

        return new Promise((resolve, reject) => {
          incomingStream.on('error', () => {
            // reject('incomingStream')
            console.log('##### incomingStream error')
          })
          incomingStream.on('close', () => {
            // reject('incomingStream')
            console.log('incomingStream close')
          }) // Normal Event

          incomingStream.on('finish', () =>
            console.log('incomingStream finish')
          )

          databaseWritableStream.on('error', () => {
            console.log('##### databaseWritableStream error')
            reject('databaseWritableStream')
          })
          databaseWritableStream.on('close', () =>
            console.log('databaseWritableStream close')
          )
          databaseWritableStream.on('finish', () => {
            console.log('databaseWritableStream finish') // Normal Event
            resolve(oid)
          })
        })
      })
  })
  // .catch((error: any) => {
  //   console.error('db tx error', error)
  // })
}
