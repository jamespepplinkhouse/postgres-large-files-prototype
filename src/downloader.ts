import download from './lib/download'
import { v4 as uuid } from 'uuid'
import { createWriteStream } from 'fs'
import { db } from './lib/db'

const oids = [16385, 16386, 16387, 16388, 16389]

const downloadFile = async () => {
  const oid = oids[Math.floor(Math.random() * oids.length)]

  console.info(`Downloading OID: ${oid}`)

  const outputFileName = `temp/${uuid()}.tmp`
  const outputFile = createWriteStream(outputFileName)
  console.info(`Output file name: ${outputFileName}`)

  const offset = Math.floor(Math.random() * 2000000)
  console.info(`Offset: ${offset}`)
  const { stream, size } = await download(db, oid, offset)
  console.info(`Got stream with size ${size}`)

  stream.pipe(outputFile)

  outputFile.on('error', err => {
    console.log('### error ###: stream destroyed', err)
    stream.destroy()
  })

  outputFile.on('close', () => {
    console.log('### close ###: stream destroyed')
    stream.destroy()
  })

  // Kill the output stream
  setTimeout(() => {
    const random = Math.random()
    if (random > 0.66) {
      outputFile.close()
    } else if (random > 0.33) {
      outputFile.emit('error', new Error('Oh no!!'))
    }
  }, 50)
}

export default () => {
  setInterval(() => {
    Promise.all([
      downloadFile(),
      downloadFile(),
      downloadFile(),
      downloadFile()
    ])
  }, 100)
}
