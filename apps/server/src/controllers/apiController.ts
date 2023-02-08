import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import { Request, Response } from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";
import ytdl from "ytdl-core";
import { FILES_PATH, SERVER_URL } from "../utils/constants";

export const convert = (req: Request, res: Response) => {
  const id = uuid();
  const DUMP_PATH = `${FILES_PATH}/${id}`;

  try {
    const { title, artist, url } = req.body as {
      title: string;
      artist: string;
      url: string;
    };

    fs.mkdirSync(DUMP_PATH);

    if (!ytdl.validateURL(url)) throw new Error("invalid url");

    return ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    })
      .pipe(fs.createWriteStream(`${DUMP_PATH}/video.mp4`))
      .on("error", () => {
        throw new Error("error downloading video");
      })
      .on("finish", () => {
        spawn(ffmpegPath, [
          "-i",
          `${DUMP_PATH}/video.mp4`,
          `${DUMP_PATH}/in.mp3`,
        ]).on("exit", (code) => {
          if (code !== 0) throw new Error("error converting to mp3");

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
            if (code !== 0) throw new Error("error adding metadata");

            return res
              .status(200)
              .json({ file_path: `${SERVER_URL}/api/download/${id}` });
          });
        });
      });
  } catch (err) {
    fs.rmSync(DUMP_PATH, {
      recursive: true,
    });

    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
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
