import { NextFunction, Request, Response } from "express";
import fs from "fs";
import ytdl from "ytdl-core";
import { object, string } from "yup";
import { FILES_PATH } from "../utils/constants";

const MAX_VIDEO_LENGTH_MIN = 7;

const convertSchema = object({
  title: string().trim().min(1).max(50).required(),
  artist: string().trim().min(1).max(50).required(),
  url: string().trim().url().required(),
});

export const validateConvert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const DUMP_PATH = `${FILES_PATH}/${req.id}`;

  try {
    await convertSchema.validate(req.body);

    if (!ytdl.validateURL(req.body.url)) throw new Error("Invalid URL");

    const videoInfo = await ytdl.getInfo(req.body.url);
    if (
      Number(videoInfo.videoDetails.lengthSeconds) >
      MAX_VIDEO_LENGTH_MIN * 60
    )
      throw new Error(`Video must be under ${MAX_VIDEO_LENGTH_MIN} min long`);

    if (!fs.existsSync(DUMP_PATH)) {
      fs.mkdirSync(DUMP_PATH);
    }

    return next();
  } catch (err) {
    fs.rmSync(DUMP_PATH, {
      recursive: true,
    });

    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ error: "Missing required fields" });
  }
};
