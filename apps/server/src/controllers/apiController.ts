import { Request, Response } from "express";
import fs from "fs";
import { FILES_PATH, SERVER_URL } from "../utils/constants";
import {
  addMetadata,
  convertVideoToMp3,
  downloadVideo,
  getThumbnailFromVideo,
  resizeCover,
} from "../utils/convertHelpers";

export const convert = async (req: Request, res: Response) => {
  const DUMP_PATH = `${FILES_PATH}/${req.id}`;

  try {
    const { title, artist, url } = req.body as {
      title: string;
      artist: string;
      url: string;
    };
    const cover = req.file;

    await downloadVideo(DUMP_PATH, url);
    await convertVideoToMp3(DUMP_PATH);
    if (!cover) {
      await getThumbnailFromVideo(DUMP_PATH);
    }
    await resizeCover(DUMP_PATH);
    await addMetadata(DUMP_PATH, title, artist);

    if (!fs.existsSync(`${DUMP_PATH}/out.mp3`)) {
      // fs.rmSync(DUMP_PATH, {
      //   recursive: true,
      // });
      return res.status(500).json({ error: "Couldn't process video" });
    }

    return res
      .status(200)
      .json({ file_path: `${SERVER_URL}/api/download/${req.id}` });
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
