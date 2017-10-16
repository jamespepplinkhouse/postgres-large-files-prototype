import { db, createLargeObjectManager } from './db'
import stream = require('stream')

export default async (input: stream) => {
  return db.tx(async (tx: any) => {
    const man = createLargeObjectManager(tx)
    return man.createAndWritableStreamAsync().then(([oid, output]: any) => {
      input.pipe(output)

      return new Promise((resolve, reject) => {
        let outputFinished = false

        input.on('error', () => {
          // Errors get passed to output correctly, no need to handle here
          console.log('##### input error')
        })
        input.on('close', () => {
          console.log('input close')

          // Input close does not close output correctly!
          if (!outputFinished) {
            reject('input closed before output finished')
          }
        })

        input.on('finish', () => console.log('input finish'))

        output.on('error', () => {
          console.log('##### output error')
          reject('output')
        })
        output.on('close', () => console.log('output close'))
        output.on('finish', () => {
          outputFinished = true
          console.log('output finish')
          resolve(oid)
        })
      })
    })
  })
}
