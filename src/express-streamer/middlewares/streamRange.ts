import * as Express from 'express'

import { db as mediaDb } from '../../lib/db'
import download from '../../lib/download'

import getRequestRanges from '../helpers/getRequestRanges'
import setVideoHeaders from '../helpers/setVideoHeaders'

export default async function(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): Promise<void> {
  console.log('Streaming oid: 16385')

  req.on('aborted', () => {
    console.log('requeset aborted')
  })

  req.on('abort', () => {
    console.log('requeset abort')
  })
  req.on('close', () => {
    console.log('requeset close')
  })

  res.on('clientError', () => {
    console.log('response clientError')
  })

  res.on('finish', () => {
    console.log('response finish')
  })

  res.on('close', () => {
    console.log('response close')
  })

  res.on('error', () => {
    console.log('response error')
  })

  // In real life, the size would be stored and accessible in a media metadata database
  const range = getRequestRanges(req, res, 31551484)

  if (range.error) {
    res.status(range.status).send()
    return
  }

  res.set('Content-Type', 'video/mp4')

  const { stream: downloadStream, size } = await download(
    mediaDb,
    16385,
    range.start
  )
  setVideoHeaders(res, size, range)
  downloadStream.pipe(res)
}
