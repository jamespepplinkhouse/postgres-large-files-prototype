import download from './lib/download'
import { v4 as uuid } from 'uuid'
import { createWriteStream } from 'fs'
import { db } from './lib/db'

const downloadFile = async () => {
  const oid = 16385
  console.info(`Downloading OID: ${oid}`)

  const outputFileName = `temp/${uuid()}.tmp`
  const outputFile = createWriteStream(outputFileName)
  console.info(`Output file name: ${outputFileName}`)

  download(db, oid, (stream, size, done) => {
    outputFile.on('close', done)

    stream.pipe(outputFile)
    stream.on('end', () => {
      console.info(`DB stream ended for: ${oid}`)
    })

    stream.on('error', err => {
      console.info(`DB stream error: ${oid} ${err}`)
    })
  })

  // Kill the output stream
  // setTimeout(() => {
  //   console.log('Closing output stream')
  //   outputFile.close()
  // }, 50)
}

export default () => {
  setInterval(downloadFile, 1000)
}
