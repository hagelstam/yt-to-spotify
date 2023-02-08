import { Request, Response } from "express";
import fs from "fs";
import ytdl from "ytdl-core";
import { FILES_PATH, SERVER_URL } from "../utils/constants";
import {
  addMetadata,
  convertVideoToMp3,
  downloadVideo,
  getThumbnailFromVideo,
} from "../utils/convertHelpers";

const MAX_VIDEO_LENGTH_SECONDS = 300;

export const convert = async (req: Request, res: Response) => {
  const { id } = req;
  const DUMP_PATH = `${FILES_PATH}/${id}`;

  try {
    const { title, artist, url } = req.body as {
      title: string;
      artist: string;
      url: string;
    };

    const cover = req.file;
    const useThumbnailAsCover = cover ? false : true;

    if (!ytdl.validateURL(url))
      return res.status(400).json({ error: "invalid url" });

    const videoInfo = await ytdl.getInfo(url);
    if (Number(videoInfo.videoDetails.lengthSeconds) > MAX_VIDEO_LENGTH_SECONDS)
      return res.status(400).json({ error: "video too long" });

    await downloadVideo(DUMP_PATH, url);
    await convertVideoToMp3(DUMP_PATH);
    if (useThumbnailAsCover) await getThumbnailFromVideo(DUMP_PATH);
    await addMetadata(DUMP_PATH, title, artist, useThumbnailAsCover);

    if (!fs.existsSync(`${DUMP_PATH}/out.mp3`)) {
      fs.rmSync(DUMP_PATH, {
        recursive: true,
      });
      return res.status(500).json({ error: "error processing video" });
    }

    return res
      .status(200)
      .json({ file_path: `${SERVER_URL}/api/download/${id}` });
  } catch (err) {
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const download = (req: Request, res: Response) => {
  const { id } = req.params;

  if (!fs.existsSync(`${FILES_PATH}/${id}`))
    return res.status(400).json({ error: "invalid id" });

  return res.download(`${FILES_PATH}/${id}/out.mp3`, () => {
    fs.rmSync(`${FILES_PATH}/${id}`, {
      recursive: true,
    });
  });
};
