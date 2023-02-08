import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import fs from "fs";
import ytdl from "ytdl-core";

export const downloadVideo = (path: string, url: string): Promise<void> => {
  const process = ytdl(url, {
    filter: "audioandvideo",
    quality: "highestaudio",
  }).pipe(fs.createWriteStream(`${path}/video.mp4`));

  return new Promise((resolve, reject) => {
    process.on("open", () => {
      console.log("Downloading video...");
    });
    process.on("error", () => {
      console.error("Error downloading video");
      reject();
    });
    process.on("close", () => {
      console.info("Video downloaded");
      resolve();
    });
  });
};

export const getThumbnailFromVideo = (path: string): Promise<void> => {
  const process = spawn(ffmpegPath, [
    "-i",
    `${path}/video.mp4`,
    "-ss",
    "00:00:01.000",
    "-frames:v",
    "1",
    `${path}/thumbnail.png`,
  ]);

  return new Promise((resolve, reject) => {
    process.on("spawn", () => {
      console.log("Getting thumbnail...");
    });
    process.on("error", () => {
      console.error("Error getting thumbnail");
      reject();
    });
    process.on("exit", () => {
      console.info("Thumbnail saved");
      resolve();
    });
  });
};

export const convertVideoToMp3 = (path: string): Promise<void> => {
  const process = spawn(ffmpegPath, [
    "-i",
    `${path}/video.mp4`,
    `${path}/in.mp3`,
  ]);

  return new Promise((resolve, reject) => {
    process.on("spawn", () => {
      console.log("Converting video to mp3...");
    });
    process.on("error", () => {
      console.error("Error converting video to mp3");
      reject();
    });
    process.on("exit", () => {
      console.info("Video converted to mp3");
      resolve();
    });
  });
};

export const addMetadata = (
  path: string,
  title: string,
  artist: string,
  useThumbnail: boolean
): Promise<void> => {
  const process = spawn(ffmpegPath, [
    "-i",
    `${path}/in.mp3`,
    "-i",
    `${path}/${useThumbnail ? "thumbnail" : "cover"}.png`,
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
    `${path}/out.mp3`,
  ]);

  return new Promise((resolve, reject) => {
    process.on("spawn", () => {
      console.log("Adding metadata...");
    });
    process.on("error", () => {
      console.error("Error adding metadata");
      reject();
    });
    process.on("exit", () => {
      console.info("Metadata added");
      resolve();
    });
  });
};
