import fs from 'fs'
import { pipeline } from 'stream/promises'

const isYouTubeUrl = (url: string): boolean => {
  return url.startsWith('https://www.youtube.com/watch?v=')
}

export const getThumbnailUrl = (url: string): string => {
  if (!isYouTubeUrl(url)) throw Error('invalid youtube url')

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

export const downloadAudio = async (url: string): Promise<void> => {
  if (!isYouTubeUrl(url)) throw Error('invalid youtube url')

  const audioUrl = await getAudioUrl(url)

  const res = await fetch(audioUrl)
  if (!res.ok || !res.body)
    throw Error(`co.wuk.sh returned status code ${res.status}`)

  const data = res.body as unknown as NodeJS.ReadableStream

  const writer = fs.createWriteStream('james.opus')
  await pipeline(data, writer)
}
