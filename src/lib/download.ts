const { LargeObject, LargeObjectManager } = require('pg-large-object')

export default async (
  pgpDb,
  oid: number,
  callback: (
    stream: NodeJS.ReadableStream,
    size: number,
    done: () => void
  ) => void,
  offset: number = 0
) => {
  return pgpDb.tx(async (tx: any) => {
    const manager = new LargeObjectManager({ pgPromise: tx })
    const largeObject = await manager.openAsync(oid, LargeObjectManager.READ)
    largeObject.seek(offset, LargeObject.SEEK_SET, () => {})

    const stream: NodeJS.ReadableStream = largeObject.getReadableStream()
    const size: number = await largeObject.sizeAsync()

    return new Promise((resolve, reject) => {
      callback(stream, size, resolve)
    })
  })
}
