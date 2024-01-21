import { NextFunction, Request, Response } from 'express'

const sanitizeString = (input: string) => {
  return input.replace(/<\/?[^>]+(>|$)/g, '').trim()
}

export const isYoutubeUrl = (url: string) => {
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
  const { youtubeUrl, artistName, songTitle } = req.body

  if (!youtubeUrl || !artistName || !songTitle) {
    return res.status(400).send('missing required fields')
  }

  if (!isYoutubeUrl(youtubeUrl)) {
    return res.status(400).send('invalid youtube url')
  }

  const sanitizedArtistName = sanitizeString(artistName)
  const sanitizedSongTitle = sanitizeString(songTitle)

  if (sanitizedArtistName.length === 0 || sanitizedSongTitle.length === 0) {
    return res.status(400).send('invalid artist name or song title')
  }

  req.body.artistName = sanitizedArtistName
  req.body.songTitle = sanitizedSongTitle

  return next()
}
