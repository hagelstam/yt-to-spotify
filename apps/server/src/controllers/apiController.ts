import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import { Request, Response } from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";
import ytdl from "ytdl-core";
import { FILES_PATH, SERVER_URL } from "../utils/constants";

export const convert = (req: Request, res: Response) => {
  try {
    const { title, artist, url } = req.body as {
      title: string;
      artist: string;
      url: string;
    };

    const id = uuid();
    const DUMP_PATH = `${FILES_PATH}/${id}`;
    fs.mkdirSync(DUMP_PATH);

    if (!ytdl.validateURL(url))
      return res.status(400).json({ error: "invalid url" });

    return ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    })
      .pipe(fs.createWriteStream(`${DUMP_PATH}/video.mp4`))
      .on("finish", () => {
        spawn(ffmpegPath, [
          "-i",
          `${DUMP_PATH}/video.mp4`,
          `${DUMP_PATH}/in.mp3`,
        ]).on("exit", (code) => {
          if (code !== 0)
            return res.status(500).json({ error: "error downloading video" });

          return spawn(ffmpegPath, [
            "-i",
            `${DUMP_PATH}/in.mp3`,
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
            `${DUMP_PATH}/out.mp3`,
          ]).on("exit", (code) => {
            if (code !== 0)
              return res.status(500).json({ error: "error adding metadata" });

            return res
              .status(200)
              .json({ file_path: `${SERVER_URL}/api/download/${id}` });
          });
        });
      });
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
