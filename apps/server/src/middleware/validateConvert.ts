import { NextFunction, Request, Response } from "express";
import fs from "fs";
import ytdl from "ytdl-core";
import { FILES_PATH } from "../utils/constants";

const MAX_VIDEO_LENGTH_MIN = 7;

export const validateConvert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const DUMP_PATH = `${FILES_PATH}/${req.id}`;

  try {
    const { title, artist, url } = req.body as {
      title: string | undefined;
      artist: string | undefined;
      url: string | undefined;
    };

    if (!title || !artist || !url || !req.file)
      throw new Error("Missing required fields");

    if (!ytdl.validateURL(url)) throw new Error("Invalid URL");

    const videoInfo = await ytdl.getInfo(req.body.url);
    if (
      Number(videoInfo.videoDetails.lengthSeconds) >
      MAX_VIDEO_LENGTH_MIN * 60
    )
      throw new Error(`Video must be under ${MAX_VIDEO_LENGTH_MIN} min long`);

    return next();
  } catch (err) {
    fs.rmSync(DUMP_PATH, {
      recursive: true,
    });

    return res
      .status(400)
      .json({ error: err instanceof Error ? err.message : "Bad request" });
  }
};
