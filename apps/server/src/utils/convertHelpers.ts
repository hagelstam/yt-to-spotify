import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import fs from "fs";
import sharp from "sharp";
import ytdl from "ytdl-core";

export const downloadVideo = (path: string, url: string): Promise<void> => {
  const process = ytdl(url, {
    filter: "audioonly",
    quality: "highestaudio",
  }).pipe(fs.createWriteStream(`${path}/in.m4a`));

  return new Promise((resolve) => {
    process.on("open", () => {
      console.log("Downloading video...");
    });
    process.on("close", () => {
      console.info("Video downloaded");
      resolve();
    });
  });
};

export const resizeCover = async (path: string): Promise<void> => {
  console.log("Resizing cover...");
  await sharp(`${path}/cover.png`)
    .resize(500, 500, { fit: "cover" })
    .toFile(`${path}/resized-cover.png`);
  console.log("Cover resized");
};

export const addMetadata = (
  path: string,
  title: string,
  artist: string
): Promise<void> => {
  [
    "-i",
    `${path}/in.mp3`,
    "-i",
    `${path}/resized-cover.png`,
    "-map",
    "0",
    "-map",
    "1",
    "-c",
    "copy",
    "-disposition:v:1",
    "attached_pic",
    "-metadata",
    `title=${title}`,
    "-metadata",
    `artist=${artist}`,
    `${path}/out.mp3`,
  ];

  const process = spawn(ffmpegPath, [
    "-i",
    `${path}/in.m4a`,
    "-i",
    `${path}/resized-cover.png`,
    "-map",
    "0",
    "-map",
    "1",
    "-c",
    "copy",
    "-id3v2_version",
    "3",
    "-metadata",
    `title=${title}`,
    "-metadata",
    `artist=${artist}`,
    `${path}/out.m4a`,
  ]);

  return new Promise((resolve) => {
    process.on("spawn", () => {
      console.log("Adding metadata...");
    });
    process.on("exit", () => {
      console.info("Metadata added");
      resolve();
    });
  });
};
