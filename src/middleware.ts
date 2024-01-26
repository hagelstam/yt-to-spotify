import { NextFunction, Request, Response } from 'express'

const sanitizeString = (input: string) => {
  return input.replace(/<\/?[^>]+(>|$)/g, '').trim()
}

const isYoutubeUrl = (url: string) => {
  return (
    url.startsWith('https://www.youtube.com/watch?v=') ||
    url.startsWith('https://www.youtube.com/shorts/')
  )
}

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { youtubeUrl, artistName, songTitle } = req.body

    if (!youtubeUrl || !artistName || !songTitle) {
      throw Error('missing required fields')
    }

    if (!isYoutubeUrl(youtubeUrl)) {
      throw Error('invalid youtube url')
    }

    const sanitizedArtistName = sanitizeString(artistName)
    const sanitizedSongTitle = sanitizeString(songTitle)

    if (sanitizedArtistName.length === 0 || sanitizedSongTitle.length === 0) {
      throw Error('invalid artist name or song title')
    }

    req.body.artistName = sanitizedArtistName
    req.body.songTitle = sanitizedSongTitle

    return next()
  } catch (err) {
    console.error(`ERROR: ${err instanceof Error ? err.message : err}`)
    return res.redirect('/')
  }
}
