import * as Express from 'express'

import { db as mediaDb } from '../../lib/db'
import download from '../../lib/download'

export default async function(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
): Promise<void> {
  console.log('Get Full Media oid: 16385')
  const { stream, size } = await download(mediaDb, 16385)
  stream.pipe(res)
}