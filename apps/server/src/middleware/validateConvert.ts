import { NextFunction, Request, Response } from "express";
import ytdl from "ytdl-core";

const MAX_VIDEO_LENGTH_MIN = 7;

export const validateConvert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, artist, url } = req.body as {
      title: string | undefined;
      artist: string | undefined;
      url: string | undefined;
    };

    if (!title || !artist || !url) throw new Error("Missing required fields");

    if (
      typeof title !== "string" ||
      typeof artist !== "string" ||
      typeof url !== "string"
    )
      throw new Error("Invalid fields");

    if (
      title.trim().length === 0 ||
      artist.trim().length === 0 ||
      url.trim().length === 0
    )
      throw new Error("Invalid fields");

    if (!ytdl.validateURL(url)) throw new Error("Invalid URL");

    const videoInfo = await ytdl.getInfo(req.body.url);
    if (
      Number(videoInfo.videoDetails.lengthSeconds) >
      MAX_VIDEO_LENGTH_MIN * 60
    )
      throw new Error(`Video must be under ${MAX_VIDEO_LENGTH_MIN} min long`);

    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Bad request" });
  }
};
