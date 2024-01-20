import { exec } from 'child_process'
import fs from 'fs'
import { pipeline } from 'stream/promises'

const isYoutubeUrl = (url: string): boolean => {
  return url.startsWith('https://www.youtube.com/watch?v=')
}

const getThumbnailUrl = (url: string): string => {
  if (!isYoutubeUrl(url)) throw Error('invalid youtube url')

  const params = new URL(url).searchParams
  const videoId = params.get('v')

  if (!videoId || videoId.length === 0)
    throw Error('could not extract video id')

  return `https://i.ytimg.com/vi/${videoId}/hq720.jpg`
}

const getAudioUrl = async (url: string): Promise<string> => {
  const res = await fetch('https://co.wuk.sh/api/json', {
    method: 'POST',
    body: JSON.stringify({
      url,
      aFormat: 'best',
      filenamePattern: 'basic',
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
  if (!res.ok) throw Error(`co.wuk.sh returned status code ${res.status}`)

  const data = (await res.json()) as { url: string }
  return data.url
}

export const downloadAudio = async (
  url: string,
  outFile: string,
): Promise<void> => {
  console.info('Downloading audio...')

  if (!isYoutubeUrl(url)) throw Error('invalid youtube url')

  const audioUrl = await getAudioUrl(url)

  const res = await fetch(audioUrl)
  if (!res.ok || !res.body)
    throw Error(`co.wuk.sh returned status code ${res.status}`)

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

  if (!isYoutubeUrl(url)) throw Error('invalid youtube url')

  const thumbnailUrl = getThumbnailUrl(url)

  const res = await fetch(thumbnailUrl)
  if (!res.ok || !res.body)
    throw Error(`co.wuk.sh returned status code ${res.status}`)

  const data = res.body as unknown as NodeJS.ReadableStream

  const writer = fs.createWriteStream(outFile)
  await pipeline(data, writer)

  console.info('Thumbnail downloaded.')
}

export const addMetadata = async (
  inAudioFile: string,
  title: string,
  artist: string,
  outFile: string,
): Promise<void> => {
  const child = exec(
    `ffmpeg -i "${inAudioFile}" -metadata title="${title}" -metadata artist="${artist}" "${outFile}"`,
  )

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
