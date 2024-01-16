const extractVideoId = (url: string) => {
  if (!url.includes('https://www.youtube.com/watch')) throw Error('Invalid url')

  const params = new URL(url).searchParams
  const videoId = params.get('v')

  if (!videoId || videoId.length === 0) throw Error('Invalid url')

  return videoId
}

const getThumbnailUrl = (url: string) => {
  const videoId = extractVideoId(url)
  return `https://i.ytimg.com/vi/${videoId}/hq720.jpg`
}

const getVideoUrl = async (url: string) => {
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
  if (!res.ok) throw Error(`API returned status code ${res.status}`)

  const data = (await res.json()) as { url: string }
  return data.url
}
