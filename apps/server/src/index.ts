import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import cors from "cors";
import express from "express";
import ffmpeg from "fluent-ffmpeg";
import helmet from "helmet";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const PORT = process.env.PORT ?? 8080;

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

app.get("/", (_req, res) => {
  ffmpeg("./song.mp3")
    .audioCodec("copy")
    .outputOptions("-metadata", "title=How Could I Be Mad?", "-metadata", "artist=Glaive")
    .output("./song-with-metadata.mp3")
    .on("end", () => {
      console.log("done");
    })
    .run();

  res.status(200).json({ message: "Hello World!" });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
