import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import cors from "cors";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import path from "path";
import { v4 as uuid } from "uuid";

const PORT = process.env.PORT ?? 8080;

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.post("/api/add-metadata", (req, res) => {
  const title = req.body.title as string;
  const artist = req.body.artist as string;

  if (!title || !artist) return res.status(400).json({ message: "Fill in required fields" });

  const id = uuid();

  if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
  }

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
    `./uploads/${id}.mp3`,
  ]);

  return child.on("exit", (code) => {
    if (code !== 0) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    return res.status(200).json({ file_path: `http://localhost:${PORT}/uploads/${id}.mp3` });
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
