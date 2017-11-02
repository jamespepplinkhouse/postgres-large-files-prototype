import Download from './lib/download'
import { v4 as uuid } from 'uuid'
import { createWriteStream } from 'fs'

const downloadFile = async () => {
  const oid = 16385
  console.info(`Downloading OID: ${oid}`)

  const download = new Download()
  const outputFileName = `temp/${uuid()}.tmp`
  const outputFile = createWriteStream(outputFileName)
  console.info(`Output file name: ${outputFileName}`)

  await download.init()

  download.getStream(oid, (stream, size) => {
    stream.pipe(outputFile)
    stream.on('end', () => {
      console.info(`DB stream ended for: ${oid}`)
      download.close()
    })

    stream.on('error', err => {
      console.info(`DB stream error: ${oid} ${err}`)
      download.close()
    })
  })
}

const downloadFileCrazy = async () => {
  const oid = 16385
  console.info(`Downloading OID: ${oid}`)

  const download = new Download()
  const outputFileName = `temp/${uuid()}.tmp`
  const outputFile = createWriteStream(outputFileName)
  console.info(`Output file name: ${outputFileName}`)

  await download.init()

  download.getStream(oid, (stream, size) => {
    stream.pipe(outputFile)
    stream.on('end', () => {
      console.info(`DB stream ended for: ${oid}`)
      download.close()
    })

    stream.on('error', err => {
      console.info(`DB stream error: ${oid} ${err}`)
      download.close()
    })

    setTimeout(() => {
      console.log('Closing output stream')
      outputFile.close()
    }, 50)
  })
}

export default () => {
  // setInterval(downloadFile, 1000)
  setInterval(downloadFileCrazy, 1000)
}
