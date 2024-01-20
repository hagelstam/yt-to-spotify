import fs from 'fs'
import path from 'path'
import {
  addMetadata,
  cropThumbnail,
  downloadAudio,
  downloadThumbnail,
} from './utils'

const DUMP_PATH = path.join(__dirname, '../temp')
fs.mkdirSync(DUMP_PATH)

const youtubeUrl = 'https://www.youtube.com/watch?v=FL7t09fVFOE'
const thumbnailFile = `${DUMP_PATH}/thumbnail.jpg`
const coverFile = `${DUMP_PATH}/cover.jpg`
const songFile = `${DUMP_PATH}/song.mp3`
const finalFile = `${DUMP_PATH}/final.mp3`

;(async () => {
  const downloadPromises = [
    downloadAudio(youtubeUrl, songFile),
    downloadThumbnail(youtubeUrl, thumbnailFile),
  ]

  await Promise.all(downloadPromises)
  await cropThumbnail(thumbnailFile, coverFile)
  await addMetadata(songFile, coverFile, 'every step', 'glaive', finalFile)
})()
