import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import { Request, Response } from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { FILES_PATH, SERVER_URL } from "../utils/constants";

export const convert = (req: Request, res: Response) => {
  const { title, artist } = req.body as { title: string; artist: string };

  const id = uuid();
  fs.mkdirSync(`${FILES_PATH}/${id}`);

  const metadataProcess = spawn(ffmpegPath, [
    "-i",
    "./song.mp3",
    "-i",
    `./cover.jpg`,
    "-map",
    "0:0",
    "-map",
    "1:0",
    "-c",
    "copy",
    "-id3v2_version",
    "3",
    "-metadata",
    `title=${title}`,
    "-metadata",
    `artist=${artist}`,
    `${FILES_PATH}/${id}/out.mp3`,
  ]);

  return metadataProcess.on("exit", (code) => {
    if (code !== 0)
      return res.status(500).json({ error: "something went wrong" });

    return res
      .status(200)
      .json({ file_path: `${SERVER_URL}/api/download/${id}` });
  });
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
