import { db, createLargeObjectManager } from './db'
import stream = require('stream')

export default async (input: stream) => {
  return db.tx(async (tx: any) => {
    const man = createLargeObjectManager(tx)
    return man.createAndWritableStreamAsync().then(([oid, output]: any) => {
      input.pipe(output)

      return new Promise((resolve, reject) => {
        let outputFinished = false

        input.on('error', error => {
          console.error('input stream error:', error)
          reject(error)
        })

        input.on('close', () => {
          if (!outputFinished) {
            reject('input closed before output finished')
          }
        })

        output.on('error', error => {
          console.error('output stream error:', error)
          reject(error)
        })

        output.on('finish', () => {
          outputFinished = true
          resolve(oid)
        })
      })
    })
  })
}
