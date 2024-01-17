import fs from 'fs'
import { DUMP_PATH } from './constants'
import { downloadAudio, downloadThumbnail } from './utils'

fs.mkdirSync(DUMP_PATH)

const youtubeUrl = 'https://www.youtube.com/watch?v=ParNLyJfOXM'

downloadAudio(youtubeUrl)
downloadThumbnail(youtubeUrl)
