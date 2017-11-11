// upload video file
import { createReadStream } from 'fs'
import { uploadStream, uploadFile } from '../lib/upload'
import { db } from '../lib/db'

const testVideo = './data/testVideo.mp4'

const uploadTestVideo = async () => {
  try {
    const oid = await uploadFile(db, testVideo)
    console.log('Uploaded Test Video:', oid)
  } catch (error) {
    console.error('Upload failed', error)
  }
}

uploadTestVideo().then(() => process.exit(0))
