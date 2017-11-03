import { db } from './db'
const { LargeObject, LargeObjectManager } = require('pg-large-object')

export default async (
  pgpDb,
  oid: number,
  callback: (stream: NodeJS.ReadableStream, size: number) => any,
  offset: number = 0
) => {
  return pgpDb.tx(async (tx: any) => {
    const manager = new LargeObjectManager({ pgPromise: tx })
    const largeObject = await manager.openAsync(oid, LargeObjectManager.READ)

    largeObject.seek(offset, LargeObject.SEEK_SET, () => {})

    const stream: NodeJS.ReadableStream = largeObject.getReadableStream()
    const size: number = await largeObject.sizeAsync()
    console.info(`Reading stream for OID: ${oid}, Size: ${size}`)

    return new Promise((resolve, reject) => {
      stream.on('error', error => {
        console.error(`Error while downloading OID: ${oid}`, error)
        reject(error)
      })

      stream.on('close', () => {
        console.info(`Closed input stream for OID: ${oid}`)
        resolve()
      })

      stream.on('end', () => {
        console.info(`Closed input stream for OID: ${oid}`)
        resolve()
      })

      callback(stream, size)
    })
  })
}
