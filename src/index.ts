// Example tests:
// Download many files while uploading many files
// Download files and kill the writeable stream
// Upload files where we kill the stream randomly or throw errors

import uploader from './uploader'
import downloader from './downloader'

uploader()
downloader()
