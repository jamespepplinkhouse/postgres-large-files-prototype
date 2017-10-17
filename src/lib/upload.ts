import { createReadStream } from 'fs'
import { LargeObjectManager } from 'pg-large-object'

export const uploadStream = async (db, inputStream) => {
  return db.tx(async (tx: any) => {
    const man = new LargeObjectManager({ pgPromise: tx })

    return man
      .createAndWritableStreamAsync()
      .then(([oid, outputStream]: any) => {
        inputStream.pipe(outputStream)

        return new Promise((resolve, reject) => {
          let outputFinished = false

          inputStream.on('error', error => {
            console.error('input stream error:', error)
            reject(error)
          })

          inputStream.on('close', () => {
            if (!outputFinished) {
              reject('input closed before output finished')
            }
          })

          outputStream.on('error', error => {
            console.error('output stream error:', error)
            reject(error)
          })

          outputStream.on('finish', () => {
            outputFinished = true
            resolve(oid)
          })
        })
      })
  })
}

export const uploadFile = async (db, path: string) => {
  return await uploadStream(db, createReadStream(path))
}
