const parseRange = require('range-parser')

const parseRanges = (req, res, length): any => {
  if (!req.headers.range) {
    return {
      start: 0,
      end: length,
      partial: false
    }
  }

  const ranges = parseRange(length, req.headers.range)
  if (ranges === -2) {
    return {
      error: true,
      status: 400 // malformed range
    }
  }
  if (ranges === -1) {
    res.set('Content-Range', '*/' + length)
    return {
      error: true,
      status: 416 // unsatisfiable range
    }
  }

  if (!ranges.length) {
    throw new Error('send-seekable was unable to parse an array')
  }

  if (ranges.length > 1) {
    throw new Error('send-seekable can only serve single ranges')
  }

  ranges[0].partial = true
  ranges[0].error = false
  return ranges[0]
}

export default parseRanges
