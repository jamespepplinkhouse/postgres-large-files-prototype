import * as Express from 'express'

import { db as mediaDb } from '../../lib/db'
import download from '../../lib/download'

export default async function(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): Promise<void> {
  console.log('Streaming oid: 16385')

  const { stream: downloadStream, size } = await download(mediaDb, 16385)
  downloadStream.pipe(res)
}
