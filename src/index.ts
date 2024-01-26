import { randomUUID } from 'crypto'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { FILES_PATH, PORT } from './constants'
import { limiter, validateBody } from './middleware'
import { addMetadata, cropCover, downloadAudio, downloadCover } from './utils'

const app = express()

app.use(express.static(path.join(__dirname, '../public')))
app.use(express.urlencoded({ extended: true }))

if (!fs.existsSync(FILES_PATH)) {
  fs.mkdirSync(FILES_PATH)
}

app.get('/', (_req, res) => {
  return res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

app.post('/convert', limiter, validateBody, async (req, res) => {
  const requestId = randomUUID()
  const DUMP_PATH = `${FILES_PATH}/${requestId}`
  const AUDIO_FILE = `${DUMP_PATH}/audio.mp3`
  const COVER_FILE = `${DUMP_PATH}/cover.jpg`
  const CROPPED_COVER_FILE = `${DUMP_PATH}/cropped_cover.jpg`
  const FINAL_FILE = `${DUMP_PATH}/final.mp3`

  try {
    const { youtubeUrl, artistName, songTitle } = req.body

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
      fs.rmSync(DUMP_PATH, {
        recursive: true,
      })
    })
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    fs.rmSync(DUMP_PATH, {
      recursive: true,
    })
    return res.redirect('/')
  }
})

app.use((_req, res) => res.redirect('/'))

app.listen(PORT, () => console.info(`Server running on port ${PORT}`))
