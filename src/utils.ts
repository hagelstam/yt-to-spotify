import { spawn } from 'child_process'
import fs from 'fs'
import sharp from 'sharp'
import { pipeline } from 'stream/promises'

const getVideoId = (url: string): string => {
  const videoUrl = new URL(url)
  const videoId = videoUrl.searchParams.get('v')

  if (!videoId) return videoUrl.pathname.substring('/shorts/'.length)
  return videoId
}

const getThumbnailUrl = (url: string): string => {
  const videoId = getVideoId(url)
  return `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
}

const getAudioUrl = async (url: string): Promise<string> => {
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

export const isYoutubeUrl = (url: string): boolean => {
  return (
    url.startsWith('https://www.youtube.com/watch?v=') ||
    url.startsWith('https://www.youtube.com/shorts/')
  )
}

export const downloadAudio = async (
  url: string,
  outFile: string,
): Promise<void> => {
  console.info('Downloading audio...')

  const audioUrl = await getAudioUrl(url)
  const res = await fetch(audioUrl)
  if (!res.ok || !res.body) {
    throw Error(`${res.url} returned status code ${res.status}`)
  }
  const data = res.body as unknown as NodeJS.ReadableStream

  const writer = fs.createWriteStream(outFile)
  await pipeline(data, writer)

  console.info('Audio downloaded.')
}

export const downloadThumbnail = async (
  url: string,
  outFile: string,
): Promise<void> => {
  console.info('Downloading thumbnail...')

  const thumbnailUrl = getThumbnailUrl(url)
  const res = await fetch(thumbnailUrl)
  if (!res.ok || !res.body) {
    throw Error(`${res.url} returned status ${res.status}`)
  }
  const data = res.body as unknown as NodeJS.ReadableStream

  const writer = fs.createWriteStream(outFile)
  await pipeline(data, writer)

  console.info('Thumbnail downloaded.')
}

export const addMetadata = async (
  inAudioFile: string,
  inImageFile: string,
  title: string,
  artist: string,
  outFile: string,
): Promise<void> => {
  const ffmpegArgs = [
    '-i',
    inAudioFile,
    '-i',
    inImageFile,
    '-map',
    '0:0',
    '-map',
    '1:0',
    '-c',
    'copy',
    '-metadata',
    `title="${title}"`,
    '-metadata',
    `artist="${artist}"`,
    outFile,
  ]

  const child = spawn('ffmpeg', ffmpegArgs)

  return new Promise((resolve, reject) => {
    child.on('spawn', () => {
      console.info('Adding metadata...')
    })
    child.on('error', (error) => {
      console.error('Error adding metadata')
      reject(error)
    })
    child.on('exit', () => {
      console.info('Metadata added.')
      resolve()
    })
  })
}

export const cropThumbnail = async (
  inFile: string,
  outFile: string,
): Promise<void> => {
  console.info('Cropping thumbnail...')

  await sharp(inFile)
    .extract({ left: 80, top: 0, width: 480, height: 480 })
    .toFile(outFile)

  console.info('Thumbnail cropped.')
}
