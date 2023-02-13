import { randomUUID } from "crypto";
import { Request, Response } from "express";
import fs from "fs";
import ytdl from "ytdl-core";
import { FILES_PATH, SERVER_URL } from "../utils/constants";
import {
  addMetadata,
  convertToMp3,
  downloadCover,
  downloadVideo,
} from "../utils/convertHelpers";

export const convert = async (req: Request, res: Response) => {
  const id = randomUUID();
  const DUMP_PATH = `${FILES_PATH}/${id}`;

  try {
    fs.mkdirSync(DUMP_PATH);

    const { title, artist, url } = req.body as {
      title: string;
      artist: string;
      url: string;
    };

    const videoId = ytdl.getURLVideoID(url);

    await downloadVideo(`${DUMP_PATH}/in.m4a`, url);
    await downloadCover(
      `${DUMP_PATH}/temp.jpg`,
      `${DUMP_PATH}/cover.jpg`,
      videoId,
      500
    );
    await convertToMp3(`${DUMP_PATH}/in.m4a`, `${DUMP_PATH}/temp.mp3`);
    await addMetadata(
      `${DUMP_PATH}/temp.mp3`,
      `${DUMP_PATH}/cover.jpg`,
      `${DUMP_PATH}/out.mp3`,
      title,
      artist
    );

    if (!fs.existsSync(`${DUMP_PATH}/out.mp3`)) {
      fs.rmSync(DUMP_PATH, {
        recursive: true,
      });
      return res.status(500).json({ error: "Something went wrong" });
    }

    return res
      .status(200)
      .json({ file_path: `${SERVER_URL}/api/download/${id}` });
  } catch (err) {
    fs.rmSync(DUMP_PATH, {
      recursive: true,
    });
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const download = (req: Request, res: Response) => {
  const { id } = req.params;

  if (!fs.existsSync(`${FILES_PATH}/${id}`))
    return res.status(400).json({ error: "Invalid id" });

  return res.download(`${FILES_PATH}/${id}/out.mp3`, () => {
    fs.rmSync(`${FILES_PATH}/${id}`, {
      recursive: true,
    });
  });
};
