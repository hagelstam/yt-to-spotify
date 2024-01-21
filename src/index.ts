import express from 'express'
import fs from 'fs'
import path from 'path'
import {
  AUDIO_FILE,
  COVER_FILE,
  CROPPED_COVER_FILE,
  DUMP_PATH,
  FINAL_FILE,
  PORT,
} from './constants'
import { validateRequest } from './middleware'
import { addMetadata, cropCover, downloadAudio, downloadCover } from './utils'

const app = express()

app.use(express.static(path.join(__dirname, '../public')))
app.use(express.urlencoded({ extended: true }))

app.get('/', (_req, res) => {
  return res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

app.post('/convert', validateRequest, async (req, res) => {
  try {
    const { youtubeUrl, artistName, songTitle } = req.body

    if (fs.existsSync(DUMP_PATH)) {
      fs.rmSync(DUMP_PATH, { recursive: true })
    }
    fs.mkdirSync(DUMP_PATH)

    await Promise.all([
      downloadAudio(youtubeUrl, AUDIO_FILE),
      downloadCover(youtubeUrl, COVER_FILE),
    ])
    await cropCover(COVER_FILE, CROPPED_COVER_FILE)
    await addMetadata(
      AUDIO_FILE,
      CROPPED_COVER_FILE,
      artistName,
      songTitle,
      FINAL_FILE,
    )

    const fileName = `${artistName}_${songTitle.split(' ').join('_')}.mp3`

    return res.download(FINAL_FILE, fileName, () => {
      console.info(`File sent: ${fileName}`)
    })
  } catch (error) {
    return res
      .status(500)
      .send(error instanceof Error ? error.message : 'error converting')
  }
})

app.use((_req, res) => res.redirect('/'))

app.listen(PORT, () => console.info(`Server running on port ${PORT}`))
