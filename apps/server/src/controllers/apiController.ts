import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import { Request, Response } from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { FILES_PATH } from "../utils/constants";

export const upload = (req: Request, res: Response) => {
  const title = req.body.title as string;
  const artist = req.body.artist as string;

  if (!title || !artist) return res.status(400).json({ message: "Fill in required fields" });

  const id = uuid();

  if (!fs.existsSync(FILES_PATH)) {
    fs.mkdirSync(FILES_PATH);
  }

  fs.mkdirSync(`${FILES_PATH}/${id}`);

  const child = spawn(ffmpegPath, [
    "-i",
    "./song.mp3",
    "-i",
    "cover.jpg",
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

  return child.on("exit", (code) => {
    if (code !== 0) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    return res.status(200).json({ file_path: `/api/download/${id}.mp3` });
  });
};

export const download = (req: Request, res: Response) => {
  const { id } = req.params;

  if (!fs.existsSync(`${FILES_PATH}/${id}`)) return res.status(400).json({ message: "Fake id" });

  return res.download(`${FILES_PATH}/${id}/out.mp3`, "james.mp3", () => {
    fs.rmSync(`${FILES_PATH}/${id}`, {
      recursive: true,
    });
  });
};
