import path from 'path'

export const PORT = Number(process.env.PORT) || 3000

export const FILES_PATH = path.join(__dirname, '../files')
