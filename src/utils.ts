import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import { spawn } from 'child_process'
import fs from 'fs'
import sharp from 'sharp'
import { pipeline } from 'stream/promises'

const getVideoId = (url: string) => {
  const videoUrl = new URL(url)
  const videoId = videoUrl.searchParams.get('v')

  if (!videoId) return videoUrl.pathname.substring('/shorts/'.length)
  return videoId
}

const getThumbnailUrl = (url: string) => {
  const videoId = getVideoId(url)
  return `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
}

const getAudioUrl = async (url: string) => {
  const res = await fetch('https://co.wuk.sh/api/json', {
    method: 'POST',
    body: JSON.stringify({
      url,
      aFormat: 'mp3',
      filenamePattern: 'classic',
      dubLang: false,
      isAudioOnly: true,
      isNoTTWatermark: true,
      isTTFullAudio: true,
      disableMetadata: true,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gip, deflate, br',
    },
  })
  if (!res.ok) {
    throw Error(`${res.url} returned status code ${res.status}`)
  }

  const data = (await res.json()) as { url: string }
  return data.url
}

export const downloadAudio = async (url: string, outFile: string) => {
  console.info('Downloading audio...')

  const audioUrl = await getAudioUrl(url)
  const res = await fetch(audioUrl)
  if (!res.ok || !res.body) {
    throw Error(`could not download audio`)
  }
  const data = res.body as unknown as NodeJS.ReadableStream

  const writer = fs.createWriteStream(outFile)
  await pipeline(data, writer)

  console.info('Audio downloaded.')
}

export const downloadCover = async (url: string, outFile: string) => {
  console.info('Downloading cover...')

  const thumbnailUrl = getThumbnailUrl(url)
  const res = await fetch(thumbnailUrl)
  if (!res.ok || !res.body) {
    throw Error('cover not found')
  }
  const data = res.body as unknown as NodeJS.ReadableStream

  const writer = fs.createWriteStream(outFile)
  await pipeline(data, writer)

  console.info('Cover downloaded.')
}

export const addMetadata = (
  audioFile: string,
  coverFile: string,
  artist: string,
  title: string,
  outFile: string,
): Promise<void> => {
  const ffmpegArgs = [
    '-i',
    audioFile,
    '-i',
    coverFile,
    '-map',
    '0:0',
    '-map',
    '1:0',
    '-c',
    'copy',
    '-metadata',
    `artist=${artist}`,
    '-metadata',
    `title=${title}`,
    outFile,
  ]

  const process = spawn(ffmpegPath, ffmpegArgs)

  return new Promise((resolve, reject) => {
    process.on('spawn', () => {
      console.info('Adding metadata...')
    })
    process.on('error', (error) => {
      console.error('Error adding metadata')
      reject(error)
    })
    process.on('exit', () => {
      console.info('Metadata added.')
      resolve()
    })
  })
}

export const cropCover = async (inFile: string, outFile: string) => {
  console.info('Cropping cover...')

  await sharp(inFile)
    .extract({ left: 80, top: 0, width: 480, height: 480 })
    .toFile(outFile)

  console.info('Cover cropped.')
}
