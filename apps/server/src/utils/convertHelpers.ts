import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import fs from "fs";
import sharp from "sharp";
import ytdl from "ytdl-core";

export const downloadVideo = (
  fileOut: string,
  videoUrl: string
): Promise<void> => {
  const process = ytdl(videoUrl, {
    filter: "audioonly",
    quality: "highestaudio",
  }).pipe(fs.createWriteStream(fileOut));

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

export const downloadCover = async (
  tempFile: string,
  fileOut: string,
  videoId: string,
  sizePx: number
): Promise<void> => {
  console.log("Downloading cover...");

  const res = await fetch(
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  );
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(tempFile, buffer);

  await sharp(tempFile)
    .extract({
      height: sizePx,
      width: sizePx,
      left: sizePx * 0.75,
      top: sizePx * 0.1,
    })
    .toFile(fileOut);

  console.log("Cover downloaded");
};

export const convertToMp3 = (
  fileIn: string,
  fileOut: string
): Promise<void> => {
  const process = spawn(ffmpegPath, ["-i", fileIn, fileOut]);

  return new Promise((resolve) => {
    process.on("spawn", () => {
      console.log("Converting to mp3...");
    });
    process.on("exit", () => {
      console.info("Converted to mp3");
      resolve();
    });
  });
};

export const addMetadata = (
  inAudioFile: string,
  inImageFile: string,
  outFile: string,
  title: string,
  artist: string
): Promise<void> => {
  const process = spawn(ffmpegPath, [
    "-i",
    inAudioFile,
    "-i",
    inImageFile,
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
    outFile,
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
