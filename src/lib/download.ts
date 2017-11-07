const { LargeObject, LargeObjectManager } = require('pg-large-object')

// To be safe with PG transactions either:
// a) Read the stream to the end
// b) Call stream.destroy() in the consuming code

export default async (pgpDb, oid: number, offset: number = 0): Promise<any> => {
  return new Promise((resolve, reject) => {
    const resolveStream = (stream, size) => {
      resolve({ stream, size })
    }

    pgpDb
      .tx(async (tx: any) => {
        const manager = new LargeObjectManager({ pgPromise: tx })
        const largeObject = await manager.openAsync(
          oid,
          LargeObjectManager.READ
        )

        largeObject.seek(offset, LargeObject.SEEK_SET, () => {
          // Do nothing
        })

        const stream = largeObject.getReadableStream()
        const size = await largeObject.sizeAsync()

        return new Promise((res, rej) => {
          stream.on('error', rej)
          stream.on('close', res)
          stream.on('end', res)

          resolveStream(stream, size)
        })
      })
      .catch(err => {
        if (err.message === 'stream.push() after EOF') {
          console.error(`Writable stream closed unexpectedly for OID: ${oid}`)
        } else {
          throw err
        }
      })
  })
}
