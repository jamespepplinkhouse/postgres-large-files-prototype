import { db } from './db'
const { LargeObject, LargeObjectManager } = require('pg-large-object')

export default async (
  pgpDb,
  oid: number,
  callback: (stream: NodeJS.ReadableStream, size: number) => any,
  offset: number = 0
) => {
  return pgpDb.tx(async (tx: any) => {
    const manager = new LargeObjectManager({ pgPromise: tx })
    const largeObject = await manager.openAsync(oid, LargeObjectManager.READ)

    largeObject.seek(offset, LargeObject.SEEK_SET, () => {})

    const stream: NodeJS.ReadableStream = largeObject.getReadableStream()
    const size: number = await largeObject.sizeAsync()
    console.info(`Reading stream for OID: ${oid}, Size: ${size}`)

    return new Promise((resolve, reject) => {
      stream.on('error', error => {
        console.error(`Error while downloading OID: ${oid}`, error)
        reject(error)
      })

      stream.on('close', () => {
        console.info(`Closed input stream for OID: ${oid}`)
        resolve()
      })

      stream.on('end', () => {
        console.info(`Closed input stream for OID: ${oid}`)
        resolve()
      })

      callback(stream, size)
    })
  })
}

// type Callback = () => any

// export default class LargeFileStreamer {
//   private manager
//   private state

//   private forceCloseResolvers: Callback[] = []
//   private streamPromises: Array<Promise<any>> = []

//   private closeTransactionFlag

//   constructor() {
//     this.state = 'uninitialised'
//   }

//   public init(): Promise<void> {
//     /* tslint:disable */
//     const that = this
//     /* tslint:enable */
//     return new Promise<void>((setupResolve, setupReject) => {
//       db.tx((transaction): Promise<any> => {
//         that.manager = new LargeObjectManager({ pgPromise: transaction })
//         that.state = 'open'
//         setupResolve()

//         return new Promise((resolve, reject) => {
//           // Wait until the close function is called
//           that.closeTransactionFlag = resolve
//         }).then(() => {
//           // Wait until all the stream have been closed
//           return Promise.all(that.streamPromises)
//         })
//       })
//     })
//   }

//   public getStream(
//     id: number,
//     callback: (stream: NodeJS.ReadableStream, size: number) => any,
//     offset: number = 0
//   ): void {
//     if (this.state !== 'open') {
//       throw new Error('LargeFileStreamer is closed or not initialised')
//     }
//     /* tslint:disable */
//     const that = this
//     /* tslint:enable */
//     const streamPromise = that.manager
//       .openAndReadableStreamAsync(id)
//       .then(([size, stream]) => {
//         console.info('Streaming a large object with a total size of', size)

//         return new Promise((resolve, reject) => {
//           stream.on('end', resolve)
//           stream.on('error', reject)

//           that.forceCloseResolvers.push(() => {
//             stream.unpipe()
//             resolve()
//           })

//           callback(stream, size)
//         })
//       })

//     this.streamPromises.push(streamPromise)
//   }

//   public close(): void {
//     this.state = 'closed'
//     this.forceCloseResolvers.map(callback => callback())
//     this.closeTransactionFlag()
//   }
// }
