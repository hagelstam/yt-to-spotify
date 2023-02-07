import cors from "cors";
import express from "express";
import helmet from "helmet";
import apiRouter from "./routes/apiRouter";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

export default app;
