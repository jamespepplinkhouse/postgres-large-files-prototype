import { db } from './db'
const { LargeObjectManager } = require('pg-large-object')

type Callback = () => any

export default class LargeFileStreamer {
  private manager
  private state

  private forceCloseResolvers: Callback[] = []
  private streamPromises: Array<Promise<any>> = []

  private closeTransactionFlag

  constructor() {
    this.state = 'uninitialised'
  }

  public init(): Promise<void> {
    /* tslint:disable */
    const that = this
    /* tslint:enable */
    return new Promise<void>((setupResolve, setupReject) => {
      db.tx((transaction): Promise<any> => {
        that.manager = new LargeObjectManager({ pgPromise: transaction })
        that.state = 'open'
        setupResolve()

        return new Promise((resolve, reject) => {
          // Wait until the close function is called
          that.closeTransactionFlag = resolve
        }).then(() => {
          // Wait until all the stream have been closed
          return Promise.all(that.streamPromises)
        })
      })
    })
  }

  public getStream(
    id: number,
    callback: (stream: NodeJS.ReadableStream, size: number) => any
  ): void {
    if (this.state !== 'open') {
      throw new Error('LargeFileStreamer is closed or not initialised')
    }
    /* tslint:disable */
    const that = this
    /* tslint:enable */
    const streamPromise = that.manager
      .openAndReadableStreamAsync(id)
      .then(([size, stream]) => {
        console.info('Streaming a large object with a total size of', size)

        return new Promise((resolve, reject) => {
          stream.on('end', resolve)
          stream.on('error', reject)

          that.forceCloseResolvers.push(() => {
            stream.unpipe()
            resolve()
          })

          callback(stream, size)
        })
      })

    this.streamPromises.push(streamPromise)
  }

  public close(): void {
    this.state = 'closed'
    this.forceCloseResolvers.map(callback => callback())
    this.closeTransactionFlag()
  }
}
