import * as fs from 'fs'
import upload from './lib/upload'

const testFile = './data/5meg.test'
const uploadedFiles: number[] = []

const uploadFileSane = async () => {
  // const defaults = {
  //   flags: 'r',
  //   encoding: null,
  //   fd: null,
  //   mode: 0o666,
  //   autoClose: true
  // }

  const testFileStream = fs.createReadStream(testFile)

  try {
    const oid = await upload(testFileStream)
    console.log('Sane upload:', oid)
    uploadedFiles.push(oid)
  } catch (error) {
    console.error('Sane upload failed', error)
  }
}

const uploadFileCrazy = async () => {
  const crazyFileStream = fs.createReadStream(testFile)

  console.log('Started crazy upload...')
  setTimeout(() => {
    // crazyFileStream.emit('error', new Error('Oh no!'))
    crazyFileStream.close()
  }, 150)

  upload(crazyFileStream)
    .then(oid => {
      console.log('Crazy upload:', oid)
      uploadedFiles.push(oid)
    })
    .catch(error => {
      console.error('Crazy upload failed', error)
    })
}

export default () => {
  // uploadFileSane()

  // const saneChain = uploadFileSane()
  // for (let i = 0; i < 100; i++) {
  //   saneChain.then(() => {
  //     return uploadFileSane()
  //   })
  // }
  // saneChain.catch(error => console.error('Sane chain failed:', error))

  setInterval(uploadFileCrazy, 1000)

  // setInterval(uploadFileSane, 1000)

  setInterval(() => {
    console.log(`Uploaded ${uploadedFiles.length} files...`)
  }, 5000)
}
