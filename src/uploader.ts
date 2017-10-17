import { createReadStream } from 'fs'
import { uploadStream, uploadFile } from './lib/upload'
import { db } from './lib/db'

const testFile = './data/5meg.test'
const uploadedFiles: number[] = []

const uploadFileSane = async () => {
  try {
    const oid = await uploadFile(db, testFile)
    console.log('Sane upload:', oid)
    uploadedFiles.push(oid)
  } catch (error) {
    console.error('Sane upload failed', error)
  }
}

const uploadFileCrazy = async () => {
  const crazyFileStream = createReadStream(testFile)

  console.log('Started crazy upload...')
  setTimeout(() => {
    // crazyFileStream.emit('error', new Error('Oh no!'))
    crazyFileStream.close()
  }, 150)

  uploadStream(db, crazyFileStream)
    .then(oid => {
      console.log('Crazy upload:', oid)
      uploadedFiles.push(oid)
    })
    .catch(error => {
      console.error('Crazy upload failed:', error)
    })
}

const uploadSaneChain = () => {
  const saneChain = uploadFileSane()
  for (let i = 0; i < 100; i++) {
    saneChain.then(() => {
      return uploadFileSane()
    })
  }
  saneChain.catch(error => console.error('Sane chain failed:', error))
}

export default () => {
  // uploadFileSane()
  // uploadSaneChain()

  setInterval(uploadFileCrazy, 1000)

  // setInterval(uploadFileSane, 1000)

  setInterval(() => {
    console.log(`Uploaded ${uploadedFiles.length} files...`)
  }, 5000)
}
