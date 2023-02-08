import { Request, Response } from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";
import ytdl from "ytdl-core";
import { FILES_PATH, SERVER_URL } from "../utils/constants";
import {
  addMetadata,
  convertVideoToMp3,
  downloadVideo,
  getCoverFromVideo,
} from "../utils/convertHelpers";

export const convert = async (req: Request, res: Response) => {
  const id = uuid();
  const DUMP_PATH = `${FILES_PATH}/${id}`;

  try {
    const { title, artist, url } = req.body as {
      title: string;
      artist: string;
      url: string;
    };

    fs.mkdirSync(DUMP_PATH);

    if (!ytdl.validateURL(url))
      return res.status(400).json({ error: "invalid url" });

    await downloadVideo(DUMP_PATH, url);
    await getCoverFromVideo(DUMP_PATH);
    await convertVideoToMp3(DUMP_PATH);
    await addMetadata(DUMP_PATH, title, artist);

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
    return res.status(400).json({ error: "bad id" });

  return res.download(`${FILES_PATH}/${id}/out.mp3`, () => {
    fs.rmSync(`${FILES_PATH}/${id}`, {
      recursive: true,
    });
  });
};
