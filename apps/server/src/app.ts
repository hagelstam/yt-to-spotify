import cors from "cors";
import express from "express";
import helmet from "helmet";
import userRouter from "./routes/userRouter";

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/api/users", userRouter);

export default app;
