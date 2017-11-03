import { createReadStream, ReadStream, WriteStream } from 'fs'
import { LargeObjectManager } from 'pg-large-object'

export const uploadStream = async (pgpDb, inputStream: ReadStream) => {
  return pgpDb.tx(async (tx: any) => {
    const manager = new LargeObjectManager({ pgPromise: tx })

    return manager
      .createAndWritableStreamAsync()
      .then(([oid, outputStream]: [number, WriteStream]) => {
        inputStream.pipe(outputStream)

        return new Promise((resolve, reject) => {
          inputStream.on('error', reject)
          inputStream.on('close', () => {
            outputStream.end()
          })

          outputStream.on('error', reject)
          outputStream.on('finish', () => {
            resolve(oid)
          })
        })
      })
  })
}

export const uploadFile = async (pgpDb, path: string) => {
  return await uploadStream(pgpDb, createReadStream(path))
}
