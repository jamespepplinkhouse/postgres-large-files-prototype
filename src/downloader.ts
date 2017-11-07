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

  const { stream, size } = await download(db, oid)
  console.info(`Got stream with size ${size}`)

  stream.pipe(outputFile)
  outputFile.on('close', () => stream.destroy())

  // Kill the output stream
  setTimeout(() => {
    console.log('Closing output stream')
    outputFile.close()
  }, 50)
}

export default () => {
  setInterval(downloadFile, 1000)
}
