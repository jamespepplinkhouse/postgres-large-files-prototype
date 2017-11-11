import * as config from './config'
import * as express from 'express'
import { createServer } from 'http'

export default async function startup(app: express.Express): Promise<void> {
  const server = createServer(app)

  console.log('Starting HTTP server')
  await new Promise((resolve, reject) =>
    server.listen(config.express.httpPort, resolve)
  )

  const serverText = `Server has started
   - http://localhost:${config.express.httpPort}`
}
