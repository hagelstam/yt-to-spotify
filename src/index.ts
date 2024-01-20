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
const audioFile = `${DUMP_PATH}/audio.mp3`
const croppedThumbnailFile = `${DUMP_PATH}/cropped_thumbnail.jpg`
const finalFile = `${DUMP_PATH}/final.mp3`

;(async () => {
  const downloadPromises = [
    downloadAudio(youtubeUrl, audioFile),
    downloadThumbnail(youtubeUrl, thumbnailFile),
  ]
  await Promise.all(downloadPromises)
  await cropThumbnail(thumbnailFile, croppedThumbnailFile)
  await addMetadata(
    audioFile,
    croppedThumbnailFile,
    'every step',
    'glaive',
    finalFile,
  )
})()
