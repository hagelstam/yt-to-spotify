import cors from "cors";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import apiRouter from "./routes/apiRouter";
import { FILES_PATH } from "./utils/constants";

if (!fs.existsSync(FILES_PATH)) {
  fs.mkdirSync(FILES_PATH);
}

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

export default app;
