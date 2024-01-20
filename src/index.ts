import fs from 'fs'
import path from 'path'
import { addMetadata, downloadAudio, downloadThumbnail } from './utils'

const DUMP_PATH = path.join(__dirname, '../temp')
fs.mkdirSync(DUMP_PATH)

const youtubeUrl = 'https://www.youtube.com/watch?v=FL7t09fVFOE'
const thumbnailFile = `${DUMP_PATH}/thumbnail.jpg`
const songFile = `${DUMP_PATH}/song.mp3`
const finalFile = `${DUMP_PATH}/final.mp3`

;(async () => {
  await downloadAudio(youtubeUrl, songFile)
  await downloadThumbnail(youtubeUrl, thumbnailFile)
  await addMetadata(songFile, thumbnailFile, 'every step', 'glaive', finalFile)
})()
