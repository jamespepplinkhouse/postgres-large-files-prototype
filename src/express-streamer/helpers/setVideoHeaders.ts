export default (res, size, range): void => {
  const start = range.start
  const end = range.end
  const isPartial = range.partial

  if (isPartial) {
    res.set('Accept-Ranges', 'bytes')
    res.set('Content-Length', end - start + 1 + '')
    res.set('Content-Range', 'bytes ' + start + '-' + end + '/' + size)
    res.status(206)
  }
}
