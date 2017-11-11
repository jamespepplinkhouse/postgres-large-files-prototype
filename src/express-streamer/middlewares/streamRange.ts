import * as Express from 'express'

import { db as mediaDb } from '../../lib/db'
import download from '../../lib/download'

import getRequestRanges from '../helpers/getRequestRanges'
import setVideoHeaders from '../helpers/setVideoHeaders'

import { Readable, Transform } from 'stream'

export default async function(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): Promise<void> {
  let stream: Readable | undefined
  // let killTransactionCallback

  try {
    console.log('Streaming oid: 16385')

    const clientHasCancelledPromise = new Promise((resolve, reject) => {
      req.on('aborted', () => {
        console.log('req: aborted')
        resolve()
      })

      req.on('abort', () => {
        console.log('req: abort')
        resolve()
      })
      req.on('close', () => {
        console.log('req: close')
        resolve()
      })
    })

    const downloadHasFinishedPromise = new Promise(resolve => {
      res.on('clientError', () => {
        console.log('res: clientError')
        resolve()
      })

      res.on('finish', () => {
        console.log('res: finish')
        resolve()
      })

      res.on('close', () => {
        console.log('res: close')
        resolve()
      })

      res.on('error', () => {
        console.log('res: error')
        resolve()
      })
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
    stream = downloadStream
    setVideoHeaders(res, size, range)
    downloadStream.pipe(res)

    await Promise.race([clientHasCancelledPromise, downloadHasFinishedPromise])
  } catch (error) {
    console.error('/stream error: ', error)
  } finally {
    console.log('finally')
    if (stream) {
      // const oubliettes = new Transform()
      // stream.pipe(oubliettes)
      // oubliettes.flush()
    }
  }

  // try {
  //   /**
  //    * These promises capture the state of the request and the response
  //    *
  //    * If either of these close, we should ensure the database transaction is closed
  //    */
  //   const clientHasCancelledPromise = new Promise((resolve, reject) => {
  //     req.on('aborted', () => {
  //       resolve()
  //     })

  //     req.on('abort', () => {
  //       resolve()
  //     })
  //     req.on('close', () => {
  //       resolve()
  //     })
  //   })

  //   const downloadHasFinishedPromise = new Promise(resolve => {
  //     res.on('clientError', () => {
  //       resolve()
  //     })

  //     res.on('finish', () => {
  //       resolve()
  //     })

  //     res.on('close', () => {
  //       resolve()
  //     })

  //     res.on('error', () => {
  //       resolve()
  //     })
  //   })

  //   const range = getRequestRanges(req, res, media.size)

  //   if (range.error) {
  //     res.status(range.status).send()
  //     return
  //   }

  //   res.set('Content-Type', media.mimetype)

  //   const {
  //     stream: downloadStream,
  //     size,
  //     forceKillTransaction: downloadCallback
  //   } = await download(mediaDb, media.id, range.start)
  //   stream = downloadStream
  //   killTransactionCallback = downloadCallback

  //   setVideoHeaders(res, size, range)

  //   stream.pipe(res)

  //   const imStuck = new Promise(resolve => {
  //     setTimeout(() => {
  //       console.error('A transaction was stuck and forcefully killed')
  //       resolve()
  //     }, 1000 * 60 * 10)
  //   })

  //   // Wait for one of these to occur
  //   await Promise.race([
  //     clientHasCancelledPromise,
  //     downloadHasFinishedPromise,
  //     imStuck
  //   ])
  // } catch (error) {
  //   next(error)
  // } finally {
  //   if (stream && killTransactionCallback) {
  //     killTransactionCallback()
  //   }
  // }
}
