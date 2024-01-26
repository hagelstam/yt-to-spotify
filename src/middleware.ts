import { NextFunction, Request, Response } from 'express'
import { rateLimit } from 'express-rate-limit'

const MINUTE_MS = 60 * 1000

const sanitize = (input: string) => {
  return input.replace(/<\/?[^>]+(>|$)/g, '').trim()
}

const isYoutubeUrl = (url: string) => {
  return (
    url.startsWith('https://www.youtube.com/watch?v=') ||
    url.startsWith('https://www.youtube.com/shorts/')
  )
}

export const validateBody = (
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

    const sanitizedArtistName = sanitize(artistName)
    const sanitizedSongTitle = sanitize(songTitle)

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

export const limiter = rateLimit({
  windowMs: MINUTE_MS,
  limit: 6, // Limit each IP to 6 requests/minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    console.error('IP got rate limited')
    res.redirect('/')
  },
})
