import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import cors from "cors";
import express from "express";
import helmet from "helmet";

const PORT = process.env.PORT ?? 8080;

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

app.get("/", (_req, res) => {
  spawn(ffmpegPath, [
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
    "title=How Could I Be Mad?",
    "-metadata",
    "artist=Glaive",
    "./out.mp3",
  ]);

  res.status(200).json({ message: "Hello World!" });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
