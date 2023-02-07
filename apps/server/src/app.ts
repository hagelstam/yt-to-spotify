import cors from "cors";
import express from "express";
import helmet from "helmet";
import apiRouter from "./routes/apiRouter";

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/api", apiRouter);

export default app;
