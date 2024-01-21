import path from 'path'

export const PORT = Number(process.env.PORT) || 3000

export const DUMP_PATH = path.join(__dirname, '../temp')

export const COVER_FILE = `${DUMP_PATH}/cover.jpg`

export const AUDIO_FILE = `${DUMP_PATH}/audio.mp3`

export const CROPPED_COVER_FILE = `${DUMP_PATH}/cropped_cover.jpg`

export const FINAL_FILE = `${DUMP_PATH}/final.mp3`
