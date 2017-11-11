import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'
import * as compression from 'compression'
import * as path from 'path'
import * as cors from 'cors'
import * as cookie from 'cookie-parser'

import * as config from './config'
import startup from './startup'

import streamRange from './middlewares/streamRange'
import getMedia from './middlewares/getMedia'

const app = express()
const sendSeekable = require('send-seekable')

app.use(helmet(), cors(), compression(), bodyParser.json(), cookie())

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/static/index.html'))
})

app.use('/range-streamer', streamRange)
app.use('/media', getMedia)

startup(app).catch(console.error)
