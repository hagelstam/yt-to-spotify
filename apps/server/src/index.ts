import cors from "cors";
import express from "express";
import helmet from "helmet";

const PORT = process.env.PORT ?? 8080;

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Hello World!" });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
