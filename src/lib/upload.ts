import { createReadStream, ReadStream, WriteStream } from 'fs'
import { LargeObjectManager } from 'pg-large-object'

export const uploadStream = async (pgpDb, inputStream: ReadStream) => {
  return pgpDb.tx(async (tx: any) => {
    const man = new LargeObjectManager({ pgPromise: tx })

    return man
      .createAndWritableStreamAsync()
      .then(([oid, outputStream]: [number, WriteStream]) => {
        console.info(`Created writable stream for OID:${oid}`)
        inputStream.pipe(outputStream)

        return new Promise((resolve, reject) => {
          let outputFinished = false

          inputStream.on('error', error => {
            console.error(`Input stream error for OID:${oid}`, error)
            reject(error)
          })

          inputStream.on('close', () => {
            if (!outputFinished) {
              console.info(
                `Input stream closed before output finished for OID:${oid}`
              )
              outputStream.end()
            }
          })

          outputStream.on('error', error => {
            console.error(`Output stream error for OID:${oid}`, error)
            reject(error)
          })

          outputStream.on('finish', () => {
            console.info(`Finished writable stream for OID:${oid}`)
            outputFinished = true
            resolve(oid)
          })
        })
      })
  })
}

export const uploadFile = async (pgpDb, path: string) => {
  return await uploadStream(pgpDb, createReadStream(path))
}
